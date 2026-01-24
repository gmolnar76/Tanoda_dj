from django.test import TransactionTestCase
from django.db import transaction, IntegrityError
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from ..models import Wallet, ModuleDeposit, LedgerEntry, DepositStatus
from ..services.settlement import SettlementService

User = get_user_model()

class TransactionRollbackTests(TransactionTestCase):
    reset_sequences = True

    def setUp(self):
        self.user = User.objects.create(
            email='rollbackuser@example.com',
            first_name='Rollback',
            last_name='User',
            password='rollbackpass123'
        )
        self.wallet = Wallet.objects.create(user=self.user, balance_available=Decimal('100.00'))
        self.learning_object = User.objects.create(
            email='dummyobj2@example.com',
            first_name='Dummy',
            last_name='Obj2',
            password='dummypass456'
        )
        self.ct = ContentType.objects.get_for_model(self.learning_object)
        self.service = SettlementService()

    def create_deposit(self, amount=Decimal('100.00')):
        # Use the service to create deposit and lock funds
        deposit_id = self.service.create_deposit(self.user.id, self.learning_object, amount)
        return ModuleDeposit.objects.get(id=deposit_id)

    def test_rollback_on_ledger_failure(self):
        deposit = self.create_deposit()
        # Patch LedgerEntry.objects.create to raise IntegrityError on SYSTEM_FEE
        orig_create = LedgerEntry.objects.create
        def patched_create(*args, **kwargs):
            if kwargs.get('entry_type', None) == 'system_fee':
                raise IntegrityError('Simulated failure')
            return orig_create(*args, **kwargs)
        LedgerEntry.objects.create = patched_create
        try:
            self.service.settle_module(deposit.id, 100, 100)
            # After simulated failure, deposit should still be ACTIVE (rollback)
            deposit.refresh_from_db()
            self.assertEqual(deposit.status, DepositStatus.ACTIVE)
            # No settlement ledger entries should be created for this deposit (only DEPOSIT)
            entries = LedgerEntry.objects.filter(related_deposit=deposit)
            self.assertEqual(entries.count(), 1)
            self.assertEqual(entries.first().entry_type, 'deposit')
        finally:
            LedgerEntry.objects.create = orig_create
