"""
Monetization Engine Models
==========================

MASTER_SPEC v1.0 compliant implementation skeleton.
All fields are specified as COPILOT comments for guided completion.
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.validators import MinValueValidator
from uuid import uuid4

CustomUser = get_user_model()


class Wallet(models.Model):
    """
    Derived state - balance calculated from LedgerEntry.
    INVARIANT: All balances must be >= 0.
    """

    # COPILOT: Add OneToOneField to CustomUser
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.PROTECT,
        primary_key=True,
        related_name='wallet'
    )
    # Field name: user
    # on_delete: models.PROTECT
    # primary_key: True
    # related_name: 'wallet'

    # COPILOT: Add DecimalField for locked balance
    balance_locked = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Balance locked in active module deposits"
    )
    # Field name: balance_locked
    # max_digits: 10, decimal_places: 2
    # default: 0
    # validators: [MinValueValidator(0)]
    # help_text: "Balance locked in active module deposits"

    # COPILOT: Add DecimalField for available balance
    balance_available = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Balance available for payout"
    )
    # Field name: balance_available
    # max_digits: 10, decimal_places: 2
    # default: 0
    # validators: [MinValueValidator(0)]
    # help_text: "Balance available for payout"

    # COPILOT: Add DecimalField for paid out balance
    balance_paid_out = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Total already paid out"
    )
    # Field name: balance_paid_out
    # max_digits: 10, decimal_places: 2
    # default: 0
    # validators: [MinValueValidator(0)]
    # help_text: "Total already paid out"

    # COPILOT: Add DateTimeField
    updated_at = models.DateTimeField(
        auto_now=True
    )
    # Field name: updated_at
    # auto_now: True

    class Meta:
        verbose_name = "Wallet"
        verbose_name_plural = "Wallets"

    def __str__(self):
        # COPILOT: Return f"Wallet: {self.user.email}"
        return f"Wallet: {self.user.email}"
    def recalculate_from_ledger(self):
        """
        Recalculate all balances from LedgerEntry records.
        This is the source of truth verification method.

        MASTER_SPEC INVARIANT: Wallet is derived state from Ledger only.

        Formulas:
        - balance_locked = deposits - (refunds + fees + losses)
          → Represents funds still locked in active deposits
        - balance_available = refunds - payouts
          → Represents funds available for withdrawal
        - balance_paid_out = payouts
          → Represents total withdrawn funds
        """
        from decimal import Decimal, ROUND_HALF_UP

        entries = LedgerEntry.objects.filter(user=self.user)

        # Aggregate by entry type (use Decimal(0) as default for empty querysets)
        total_deposits = sum((e.amount for e in entries if e.entry_type == EntryType.DEPOSIT), Decimal('0'))
        total_refunds = sum((e.amount for e in entries if e.entry_type == EntryType.REFUND), Decimal('0'))
        total_fees = sum((e.amount for e in entries if e.entry_type == EntryType.SYSTEM_FEE), Decimal('0'))
        total_losses = sum((e.amount for e in entries if e.entry_type == EntryType.LOSS), Decimal('0'))
        total_payouts = sum((e.amount for e in entries if e.entry_type == EntryType.PAYOUT), Decimal('0'))

        # balance_locked: funds in active (unsettled) deposits
        # When settled: refund + fee + loss = deposit, so this becomes 0
        self.balance_locked = (total_deposits - total_refunds - total_fees - total_losses).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

        # balance_available: refunds earned minus payouts withdrawn
        self.balance_available = (total_refunds - total_payouts).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

        # balance_paid_out: total withdrawn
        self.balance_paid_out = total_payouts.quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

        self.save()

    def verify_integrity(self):
        """
        Verify wallet integrity against ledger.
        Returns True if balances match, raises ValueError if mismatch detected.

        This is a non-destructive check that compares current wallet state
        against what the ledger says it should be.
        """
        from decimal import Decimal, ROUND_HALF_UP

        # Store current values
        current_locked = self.balance_locked
        current_available = self.balance_available
        current_paid_out = self.balance_paid_out

        # Calculate expected values from ledger (without saving)
        entries = LedgerEntry.objects.filter(user=self.user)

        total_deposits = sum((e.amount for e in entries if e.entry_type == EntryType.DEPOSIT), Decimal('0'))
        total_refunds = sum((e.amount for e in entries if e.entry_type == EntryType.REFUND), Decimal('0'))
        total_fees = sum((e.amount for e in entries if e.entry_type == EntryType.SYSTEM_FEE), Decimal('0'))
        total_losses = sum((e.amount for e in entries if e.entry_type == EntryType.LOSS), Decimal('0'))
        total_payouts = sum((e.amount for e in entries if e.entry_type == EntryType.PAYOUT), Decimal('0'))

        expected_locked = (total_deposits - total_refunds - total_fees - total_losses).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )
        expected_available = (total_refunds - total_payouts).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )
        expected_paid_out = total_payouts.quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

        # Compare
        if (current_locked != expected_locked or
            current_available != expected_available or
            current_paid_out != expected_paid_out):
            raise ValueError(
                f"Wallet integrity check failed: "
                f"locked={current_locked} (expected {expected_locked}), "
                f"available={current_available} (expected {expected_available}), "
                f"paid_out={current_paid_out} (expected {expected_paid_out})"
            )

        return True


class EntryType(models.TextChoices):
    """Ledger entry types - CANONICAL"""
    # COPILOT: Add choice DEPOSIT = 'deposit', 'Deposit'
    DEPOSIT = 'deposit', 'Deposit'
    # COPILOT: Add choice REFUND = 'refund', 'Refund'
    REFUND = 'refund', 'Refund'
    # COPILOT: Add choice SYSTEM_FEE = 'system_fee', 'System Fee'
    SYSTEM_FEE = 'system_fee', 'System Fee'
    # COPILOT: Add choice LOSS = 'loss', 'Loss'
    LOSS = 'loss', 'Loss'
    # COPILOT: Add choice PAYOUT = 'payout', 'Payout'
    PAYOUT = 'payout', 'Payout'


class LedgerEntry(models.Model):
    """
    Append-only financial audit log.
    INVARIANT: Never update or delete.
    """

    # COPILOT: Add UUIDField as primary key
    id = models.UUIDField(
        primary_key=True,
        default=uuid4,
        editable=False
    )   
    # Field name: id
    # primary_key: True
    # default: uuid4
    # editable: False

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='ledger_entries'
    )

    entry_type = models.CharField(
        max_length=20,
        choices=EntryType.choices
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)],
        help_text="Always positive, type determines debit/credit"
    )

    related_deposit = models.ForeignKey(
        'ModuleDeposit',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='ledger_entries'
    )

    idempotency_key = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        help_text="Format: {deposit_id}:{entry_type}"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        verbose_name = "Ledger Entry"
        verbose_name_plural = "Ledger Entries"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            # idempotency_key is already unique and indexed
        ]

    def __str__(self):
        return f"{self.entry_type}: {self.amount} ({self.user.email})"

    def delete(self, *args, **kwargs):
        """BLOCKED - Ledger is append-only"""
        raise PermissionError("LedgerEntry cannot be deleted (append-only)")

    def save(self, *args, **kwargs):
        """Override to block updates after creation"""
        if self.pk and LedgerEntry.objects.filter(pk=self.pk).exists():
            raise PermissionError("LedgerEntry cannot be modified")
        super().save(*args, **kwargs)


class DepositStatus(models.TextChoices):
    """Module deposit lifecycle states"""
    ACTIVE = 'active', 'Active'
    SETTLED = 'settled', 'Settled'


class ModuleDeposit(models.Model):
    """
    Links learning object to financial deposit.
    State machine: active -> settled (one-way).
    """

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='module_deposits'
    )

    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.PROTECT,
        help_text="Type of learning object (e.g., KerdoivKitoltes)"
    )

    object_id = models.PositiveIntegerField(
        help_text="ID of the learning object"
    )

    learning_object = GenericForeignKey('content_type', 'object_id')

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )

    status = models.CharField(
        max_length=10,
        choices=DepositStatus.choices,
        default=DepositStatus.ACTIVE
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    settled_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when settlement completed"
    )

    class Meta:
        verbose_name = "Module Deposit"
        verbose_name_plural = "Module Deposits"
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['content_type', 'object_id']),
        ]

    def __str__(self):
        return f"Deposit {self.id}: {self.amount} ({self.status})"

    def can_settle(self):
        """Check if deposit can be settled"""
        return self.status == DepositStatus.ACTIVE

    def mark_settled(self):
        """Mark deposit as settled (one-way transition)"""
        from django.utils import timezone
        if not self.can_settle():
            raise ValueError("Deposit already settled")
        self.status = DepositStatus.SETTLED
        self.settled_at = timezone.now()
        self.save()
