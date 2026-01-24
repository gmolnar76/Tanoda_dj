"""
Settlement Service
==================

Handles module completion settlement according to MASTER_SPEC v1.0.

INVARIANTS:
- One settlement per ModuleDeposit (idempotency)
- Atomic transactions
- Deterministic calculations
"""


from django.db import transaction, IntegrityError
from decimal import Decimal, ROUND_HALF_UP
from typing import Tuple
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth import get_user_model
from ..models import ModuleDeposit, LedgerEntry, Wallet, EntryType, DepositStatus


class SettlementService:
    """
    Core service for processing module deposit settlements.
    All operations are atomic and idempotent.
    """

    def __init__(self):
        pass

    def settle_module(self, module_deposit_id: int, earned_points: int, max_points: int) -> dict:
        """
        Settle a module deposit based on completion ratio.

        Args:
            module_deposit_id: ID of ModuleDeposit to settle
            earned_points: Points earned by user
            max_points: Maximum possible points

        Returns:
            dict with keys: refund, system_fee, loss, completion_ratio

        Raises:
            ValueError: If deposit already settled or invalid
            ValueError: If points are negative or max_points is zero
        """

        # Validate inputs
        if earned_points < 0 or max_points <= 0:
            raise ValueError("Invalid points: earned_points must be >= 0 and max_points > 0")

        with transaction.atomic():
            deposit = ModuleDeposit.objects.select_for_update().get(id=module_deposit_id)
            if not deposit.can_settle():
                raise ValueError("Already settled")

            completion_ratio, refund, system_fee, loss = self._calculate_settlement(
                deposit.amount, earned_points, max_points
            )

            wallet, _ = Wallet.objects.get_or_create(user=deposit.user)

            # Create ledger entries for settlement (wallet will be recalculated from ledger after)
            try:
                LedgerEntry.objects.create(
                    user=deposit.user,
                    entry_type=EntryType.REFUND,
                    amount=refund,
                    related_deposit=deposit,
                    idempotency_key=f"{module_deposit_id}:refund"
                )
                LedgerEntry.objects.create(
                    user=deposit.user,
                    entry_type=EntryType.SYSTEM_FEE,
                    amount=system_fee,
                    related_deposit=deposit,
                    idempotency_key=f"{module_deposit_id}:system_fee"
                )
                LedgerEntry.objects.create(
                    user=deposit.user,
                    entry_type=EntryType.LOSS,
                    amount=loss,
                    related_deposit=deposit,
                    idempotency_key=f"{module_deposit_id}:loss"
                )
            except IntegrityError as e:
                # Rollback: do not mark as settled
                raise e

            deposit.mark_settled()

            # Recalculate wallet from ledger to ensure consistency
            # This enforces the Ledger-first invariant from MASTER_SPEC
            wallet.recalculate_from_ledger()

            return {
                "refund": float(refund),
                "system_fee": float(system_fee),
                "loss": float(loss),
                "completion_ratio": float(completion_ratio)
            }

    def _calculate_settlement(
        self, deposit_amount: Decimal, earned_points: int, max_points: int
    ) -> Tuple[Decimal, Decimal, Decimal, Decimal]:
        """
        Calculate settlement amounts based on completion ratio.

        Formula (MASTER_SPEC v1.0):
            completion_ratio = earned_points / max_points
            refund = deposit_amount × completion_ratio × 0.9
            system_fee = deposit_amount × completion_ratio × 0.1
            loss = deposit_amount - refund - system_fee

        Args:
            deposit_amount: Original deposit amount
            earned_points: Points earned
            max_points: Maximum points

        Returns:
            Tuple of (completion_ratio, refund, system_fee, loss)
        """

        completion_ratio = Decimal(earned_points) / Decimal(max_points)
        refund = (deposit_amount * completion_ratio * Decimal('0.9')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        system_fee = (deposit_amount * completion_ratio * Decimal('0.1')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        loss = (deposit_amount - refund - system_fee).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        return (completion_ratio, refund, system_fee, loss)

    def create_deposit(self, user_id: int, learning_object, amount: Decimal) -> int:
        """
        Create a new module deposit and lock funds.

        Args:
            user_id: ID of the user
            learning_object: Django object (e.g., KerdoivKitoltes instance)
            amount: Deposit amount

        Returns:
            ModuleDeposit ID

        Raises:
            ValueError: If insufficient balance
        """

        User = get_user_model()
        with transaction.atomic():
            user = User.objects.get(id=user_id)
            wallet, _ = Wallet.objects.get_or_create(user=user)
            if wallet.balance_available < amount:
                raise ValueError("Insufficient balance")

            ct = ContentType.objects.get_for_model(learning_object)
            deposit = ModuleDeposit.objects.create(
                user=user,
                content_type=ct,
                object_id=learning_object.id,
                amount=amount,
                status=DepositStatus.ACTIVE
            )
            # Create ledger entry for deposit
            # Note: Since deposit.id is auto-generated, idempotency collision should
            # not occur in normal operation. Any IntegrityError here indicates a real
            # database issue and should not be silently ignored.
            LedgerEntry.objects.create(
                user=user,
                entry_type=EntryType.DEPOSIT,
                amount=amount,
                related_deposit=deposit,
                idempotency_key=f"{deposit.id}:deposit"
            )
            wallet.balance_locked = (wallet.balance_locked + amount).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            wallet.balance_available = (wallet.balance_available - amount).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            wallet.save()
            return deposit.id

    def verify_settlement_integrity(self, module_deposit_id: int) -> bool:
        """
        Verify that settlement ledger entries match expected amounts.

        Args:
            module_deposit_id: ID of settled deposit

        Returns:
            True if integrity check passes

        Raises:
            ValueError: If integrity check fails
        """

        deposit = ModuleDeposit.objects.get(id=module_deposit_id)
        if deposit.status != DepositStatus.SETTLED:
            raise ValueError("Deposit not settled")
        entries = LedgerEntry.objects.filter(related_deposit=deposit)
        refund = sum(Decimal(e.amount) for e in entries if e.entry_type == EntryType.REFUND)
        system_fee = sum(Decimal(e.amount) for e in entries if e.entry_type == EntryType.SYSTEM_FEE)
        loss = sum(Decimal(e.amount) for e in entries if e.entry_type == EntryType.LOSS)
        total = Decimal(refund + system_fee + loss).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        if total != deposit.amount:
            raise ValueError("Integrity check failed")
        return True
