from django.test import TestCase, TransactionTestCase
from django.db import transaction, IntegrityError
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from ..models import Wallet, ModuleDeposit, LedgerEntry, EntryType, DepositStatus
from ..services.settlement import SettlementService

User = get_user_model()

class SettlementTests(TransactionTestCase):
    reset_sequences = True

    def setUp(self):
        self.user = User.objects.create(
            email='testuser@example.com',
            first_name='Test',
            last_name='User',
            password='testpass123'
        )
        self.wallet = Wallet.objects.create(user=self.user, balance_available=Decimal('200.00'))
        # Dummy learning object
        self.learning_object = User.objects.create(
            email='dummyobj@example.com',
            first_name='Dummy',
            last_name='Obj',
            password='dummypass123'
        )
        self.ct = ContentType.objects.get_for_model(self.learning_object)
        self.service = SettlementService()

    def create_deposit(self, amount=Decimal('100.00')):
        # Use the service to create deposit and lock funds
        deposit_id = self.service.create_deposit(self.user.id, self.learning_object, amount)
        return ModuleDeposit.objects.get(id=deposit_id)

    def test_settlement_perfect_score(self):
        deposit = self.create_deposit()
        result = self.service.settle_module(deposit.id, 100, 100)
        wallet = Wallet.objects.get(user=self.user)
        wallet.refresh_from_db()
        self.assertEqual(result['refund'], 90.0)
        self.assertEqual(result['system_fee'], 10.0)
        self.assertEqual(result['loss'], 0.0)
        self.assertEqual(float(wallet.balance_available), 90.0)
        entries = LedgerEntry.objects.filter(related_deposit=deposit)
        self.assertEqual(entries.filter(entry_type=EntryType.REFUND).count(), 1)
        self.assertEqual(entries.filter(entry_type=EntryType.SYSTEM_FEE).count(), 1)
        self.assertEqual(entries.filter(entry_type=EntryType.LOSS).count(), 1)

    def test_settlement_zero_score(self):
        deposit = self.create_deposit()
        result = self.service.settle_module(deposit.id, 0, 100)
        wallet = Wallet.objects.get(user=self.user)
        wallet.refresh_from_db()
        self.assertEqual(result['refund'], 0.0)
        self.assertEqual(result['system_fee'], 0.0)
        self.assertEqual(result['loss'], 100.0)
        self.assertEqual(float(wallet.balance_available), 0.0)

    def test_settlement_half_score(self):
        deposit = self.create_deposit()
        result = self.service.settle_module(deposit.id, 50, 100)
        wallet = Wallet.objects.get(user=self.user)
        wallet.refresh_from_db()
        self.assertEqual(result['refund'], 45.0)
        self.assertEqual(result['system_fee'], 5.0)
        self.assertEqual(result['loss'], 50.0)
        self.assertEqual(float(wallet.balance_available), 45.0)

    def test_settlement_rounding_edge(self):
        deposit = self.create_deposit()
        result = self.service.settle_module(deposit.id, 33, 100)
        # Calculate expected values with Decimal rounding
        from decimal import Decimal, ROUND_HALF_UP
        deposit_amount = Decimal('100.00')
        completion_ratio = Decimal(33) / Decimal(100)
        refund = (deposit_amount * completion_ratio * Decimal('0.9')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        system_fee = (deposit_amount * completion_ratio * Decimal('0.1')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        loss = (deposit_amount - refund - system_fee).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        self.assertEqual(result['refund'], float(refund))
        self.assertEqual(result['system_fee'], float(system_fee))
        self.assertEqual(result['loss'], float(loss))

    def test_settlement_idempotency(self):
        deposit = self.create_deposit()
        self.service.settle_module(deposit.id, 100, 100)
        with self.assertRaises(ValueError):
            self.service.settle_module(deposit.id, 100, 100)
        entries = LedgerEntry.objects.filter(related_deposit=deposit)
        # There will be 4 entries: 1 DEPOSIT + 3 settlement (refund, fee, loss)
        self.assertEqual(entries.count(), 4)

    def test_ledger_append_only(self):
        deposit = self.create_deposit()
        self.service.settle_module(deposit.id, 100, 100)
        entry = LedgerEntry.objects.filter(related_deposit=deposit).first()
        self.assertIsNotNone(entry, "No LedgerEntry found for deposit after settlement")
        with self.assertRaises(PermissionError):
            entry.amount = Decimal('999.99')
            entry.save()
        with self.assertRaises(PermissionError):
            entry.delete()

    def test_wallet_integrity(self):
        deposit1 = self.create_deposit()
        deposit2 = self.create_deposit()
        self.service.settle_module(deposit1.id, 100, 100)
        self.service.settle_module(deposit2.id, 50, 100)
        wallet = Wallet.objects.get(user=self.user)
        wallet.verify_integrity()
        # Corrupt wallet
        wallet.balance_available = Decimal('999.99')
        wallet.save()
        with self.assertRaises(ValueError):
            wallet.verify_integrity()

    def test_insufficient_funds(self):
        self.wallet.balance_available = Decimal('10.00')
        self.wallet.save()
        with self.assertRaises(ValueError):
            self.service.create_deposit(self.user.id, self.learning_object, Decimal('100.00'))

    def test_negative_balance_validator(self):
        from django.core.exceptions import ValidationError
        self.wallet.balance_available = Decimal('-1.00')
        with self.assertRaises(ValidationError):
            self.wallet.full_clean()
