"""
Tests for Monetization Models
==============================
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from decimal import Decimal
from ..models import Wallet, LedgerEntry, ModuleDeposit, EntryType, DepositStatus

User = get_user_model()


class WalletModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='walletuser@example.com',
            first_name='Wallet',
            last_name='User',
            password='pass')
        self.wallet = Wallet.objects.create(user=self.user)

    def test_wallet_creation(self):
        """Test wallet is created with zero balances"""
        self.assertEqual(self.wallet.balance_locked, Decimal('0'))
        self.assertEqual(self.wallet.balance_available, Decimal('0'))
        self.assertEqual(self.wallet.balance_paid_out, Decimal('0'))

    def test_wallet_str(self):
        """Test wallet string representation"""
        self.assertEqual(str(self.wallet), f"Wallet: {self.user.email}")

    def test_negative_balance_validation(self):
        """Test that negative balances are prevented"""
        self.wallet.balance_locked = Decimal('-10')
        with self.assertRaises(ValidationError):
            self.wallet.full_clean()


class LedgerEntryModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='ledgeruser@example.com',
            first_name='Ledger',
            last_name='User',
            password='pass')

    def test_ledger_entry_creation(self):
        """Test ledger entry is created successfully"""
        entry = LedgerEntry.objects.create(
            user=self.user,
            entry_type=EntryType.DEPOSIT,
            amount=Decimal('100.00'),
            idempotency_key='test_deposit_1'
        )
        self.assertIsNotNone(entry.id)
        self.assertEqual(entry.amount, Decimal('100.00'))

    def test_ledger_entry_append_only_update(self):
        """Test that ledger entries cannot be updated"""
        entry = LedgerEntry.objects.create(
            user=self.user,
            entry_type=EntryType.DEPOSIT,
            amount=Decimal('100.00'),
            idempotency_key='test_deposit_2'
        )
        entry.amount = Decimal('200.00')
        with self.assertRaises(PermissionError):
            entry.save()

    def test_ledger_entry_append_only_delete(self):
        """Test that ledger entries cannot be deleted"""
        entry = LedgerEntry.objects.create(
            user=self.user,
            entry_type=EntryType.DEPOSIT,
            amount=Decimal('100.00'),
            idempotency_key='test_deposit_3'
        )
        with self.assertRaises(PermissionError):
            entry.delete()

    def test_idempotency_key_uniqueness(self):
        """Test that duplicate idempotency keys are rejected"""
        LedgerEntry.objects.create(
            user=self.user,
            entry_type=EntryType.DEPOSIT,
            amount=Decimal('100.00'),
            idempotency_key='test_deposit_4'
        )
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            LedgerEntry.objects.create(
                user=self.user,
                entry_type=EntryType.DEPOSIT,
                amount=Decimal('100.00'),
                idempotency_key='test_deposit_4'
            )

    def test_ledger_entry_str(self):
        """Test ledger entry string representation"""
        entry = LedgerEntry.objects.create(
            user=self.user,
            entry_type=EntryType.REFUND,
            amount=Decimal('50.00'),
            idempotency_key='test_refund_1'
        )
        expected = f"refund: 50.00 ({self.user.email})"
        self.assertEqual(str(entry), expected)


class ModuleDepositModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='deposituser@example.com',
            first_name='Deposit',
            last_name='User',
            password='pass')

    def test_module_deposit_creation(self):
        """Test module deposit is created with ACTIVE status"""
        from django.contrib.contenttypes.models import ContentType
        ct = ContentType.objects.get_for_model(User)

        deposit = ModuleDeposit.objects.create(
            user=self.user,
            content_type=ct,
            object_id=self.user.id,
            amount=Decimal('100.00')
        )
        self.assertEqual(deposit.status, DepositStatus.ACTIVE)
        self.assertIsNone(deposit.settled_at)

    def test_can_settle(self):
        """Test can_settle returns True for ACTIVE deposits"""
        from django.contrib.contenttypes.models import ContentType
        ct = ContentType.objects.get_for_model(User)

        deposit = ModuleDeposit.objects.create(
            user=self.user,
            content_type=ct,
            object_id=self.user.id,
            amount=Decimal('100.00')
        )
        self.assertTrue(deposit.can_settle())

    def test_mark_settled(self):
        """Test marking deposit as settled"""
        from django.contrib.contenttypes.models import ContentType
        ct = ContentType.objects.get_for_model(User)

        deposit = ModuleDeposit.objects.create(
            user=self.user,
            content_type=ct,
            object_id=self.user.id,
            amount=Decimal('100.00')
        )
        deposit.mark_settled()
        self.assertEqual(deposit.status, DepositStatus.SETTLED)
        self.assertIsNotNone(deposit.settled_at)

    def test_mark_settled_twice_fails(self):
        """Test that settling twice raises ValueError"""
        from django.contrib.contenttypes.models import ContentType
        ct = ContentType.objects.get_for_model(User)

        deposit = ModuleDeposit.objects.create(
            user=self.user,
            content_type=ct,
            object_id=self.user.id,
            amount=Decimal('100.00')
        )
        deposit.mark_settled()
        with self.assertRaises(ValueError):
            deposit.mark_settled()
