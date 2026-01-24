"""
Monetization Hook Service
=========================

Integrates learning events with the monetization system.
MASTER_SPEC: Ledger-first monetization - rewards only after events.
"""

from decimal import Decimal
from typing import Optional, Dict, Any
from django.db import transaction
from django.contrib.contenttypes.models import ContentType

from monetization.models import Wallet, LedgerEntry, ModuleDeposit, EntryType, DepositStatus


class MonetizationHook:
    """
    Hook into the learning system for monetization events.
    All rewards flow through the ledger.
    """

    # Reward configurations
    LEVEL_COMPLETION_REWARDS = {
        1: Decimal('0.50'),
        2: Decimal('0.75'),
        3: Decimal('1.00'),
        4: Decimal('1.25'),
        5: Decimal('1.50'),
        6: Decimal('1.75'),
        7: Decimal('2.00'),
        8: Decimal('2.50'),
        9: Decimal('3.00'),
        10: Decimal('5.00'),
    }

    STREAK_MILESTONES = {
        10: Decimal('0.25'),
        25: Decimal('0.50'),
        50: Decimal('1.00'),
        100: Decimal('2.50'),
    }

    CHALLENGE_WIN_REWARD = Decimal('1.00')
    CHALLENGE_LOSS_FEE = Decimal('0.25')

    @classmethod
    def ensure_wallet(cls, user) -> Wallet:
        """Ensure user has a wallet"""
        wallet, created = Wallet.objects.get_or_create(user=user)
        return wallet

    @classmethod
    @transaction.atomic
    def on_level_completed(
        cls,
        user,
        level: int,
        session_id: str,
        **kwargs
    ) -> Optional[Dict[str, Any]]:
        """
        Called when a user completes a level.
        Creates a reward entry in the ledger.
        """
        reward_amount = cls.LEVEL_COMPLETION_REWARDS.get(level, Decimal('0.50'))

        # Ensure wallet exists
        wallet = cls.ensure_wallet(user)

        # Check for idempotency
        idempotency_key = f"level_complete:{user.id}:{level}:{session_id}"
        if LedgerEntry.objects.filter(idempotency_key=idempotency_key).exists():
            return None  # Already processed

        # Create ledger entry (REFUND type = reward going to available balance)
        entry = LedgerEntry.objects.create(
            user=user,
            entry_type=EntryType.REFUND,
            amount=reward_amount,
            idempotency_key=idempotency_key,
        )

        # Recalculate wallet
        wallet.recalculate_from_ledger()

        return {
            'type': 'level_completion',
            'level': level,
            'amount': float(reward_amount),
            'entry_id': str(entry.id),
        }

    @classmethod
    @transaction.atomic
    def on_streak_milestone(
        cls,
        user,
        streak: int,
        session_id: str,
        **kwargs
    ) -> Optional[Dict[str, Any]]:
        """
        Called when a user reaches a streak milestone.
        """
        if streak not in cls.STREAK_MILESTONES:
            return None

        reward_amount = cls.STREAK_MILESTONES[streak]

        # Ensure wallet exists
        wallet = cls.ensure_wallet(user)

        # Check for idempotency
        idempotency_key = f"streak:{user.id}:{streak}:{session_id}"
        if LedgerEntry.objects.filter(idempotency_key=idempotency_key).exists():
            return None  # Already processed

        # Create ledger entry
        entry = LedgerEntry.objects.create(
            user=user,
            entry_type=EntryType.REFUND,
            amount=reward_amount,
            idempotency_key=idempotency_key,
        )

        # Recalculate wallet
        wallet.recalculate_from_ledger()

        return {
            'type': 'streak_milestone',
            'streak': streak,
            'amount': float(reward_amount),
            'entry_id': str(entry.id),
        }

    @classmethod
    @transaction.atomic
    def on_challenge_started(
        cls,
        user,
        challenge_id: str,
        stake_amount: Decimal,
        **kwargs
    ) -> Optional[Dict[str, Any]]:
        """
        Called when a user starts a challenge.
        Creates a deposit (locks funds).
        """
        wallet = cls.ensure_wallet(user)

        # Verify sufficient balance
        if wallet.balance_available < stake_amount:
            return {
                'success': False,
                'error': 'Insufficient balance',
                'required': float(stake_amount),
                'available': float(wallet.balance_available),
            }

        # Check for idempotency
        idempotency_key = f"challenge_start:{user.id}:{challenge_id}"
        if LedgerEntry.objects.filter(idempotency_key=idempotency_key).exists():
            return None

        # Create deposit entry (locks funds)
        entry = LedgerEntry.objects.create(
            user=user,
            entry_type=EntryType.DEPOSIT,
            amount=stake_amount,
            idempotency_key=idempotency_key,
        )

        # Recalculate wallet
        wallet.recalculate_from_ledger()

        return {
            'success': True,
            'type': 'challenge_started',
            'challenge_id': challenge_id,
            'stake': float(stake_amount),
            'entry_id': str(entry.id),
        }

    @classmethod
    @transaction.atomic
    def on_challenge_ended(
        cls,
        user,
        challenge_id: str,
        won: bool,
        stake_amount: Decimal,
        **kwargs
    ) -> Optional[Dict[str, Any]]:
        """
        Called when a challenge ends.
        Settles the challenge - returns stake + reward for win, or takes fee for loss.
        """
        wallet = cls.ensure_wallet(user)

        # Check for idempotency
        idempotency_key = f"challenge_end:{user.id}:{challenge_id}"
        if LedgerEntry.objects.filter(idempotency_key=idempotency_key).exists():
            return None

        if won:
            # Return stake + reward
            total_return = stake_amount + cls.CHALLENGE_WIN_REWARD
            entry = LedgerEntry.objects.create(
                user=user,
                entry_type=EntryType.REFUND,
                amount=total_return,
                idempotency_key=idempotency_key,
            )
            result_type = 'challenge_won'
        else:
            # Return stake minus fee
            fee = min(cls.CHALLENGE_LOSS_FEE, stake_amount)
            refund = stake_amount - fee

            if refund > 0:
                LedgerEntry.objects.create(
                    user=user,
                    entry_type=EntryType.REFUND,
                    amount=refund,
                    idempotency_key=f"{idempotency_key}:refund",
                )

            if fee > 0:
                LedgerEntry.objects.create(
                    user=user,
                    entry_type=EntryType.SYSTEM_FEE,
                    amount=fee,
                    idempotency_key=f"{idempotency_key}:fee",
                )

            result_type = 'challenge_lost'

        # Recalculate wallet
        wallet.recalculate_from_ledger()

        return {
            'type': result_type,
            'challenge_id': challenge_id,
            'won': won,
        }

    @classmethod
    def get_wallet_summary(cls, user) -> Dict[str, Any]:
        """Get wallet summary for user"""
        wallet = cls.ensure_wallet(user)

        return {
            'balance_locked': float(wallet.balance_locked),
            'balance_available': float(wallet.balance_available),
            'balance_paid_out': float(wallet.balance_paid_out),
            'total_earned': float(wallet.balance_available + wallet.balance_paid_out),
        }
