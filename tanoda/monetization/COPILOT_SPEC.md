# COPILOT IMPLEMENTATION SPEC - Monetization Engine

## Overview

This spec guides Copilot through implementing the Monetization Engine according to MASTER_SPEC v1.0.

**Files to implement:**
- `tanoda/monetization/models.py` - Data models
- `tanoda/monetization/services/settlement.py` - Settlement logic
- `tanoda/monetization/admin.py` - Admin interface (read-only)
- `tanoda/monetization/tests/` - Test suite

---

## Implementation Order

### Phase 1: Models
1. Complete all `# COPILOT:` comments in `models.py`
2. Run `python manage.py makemigrations monetization`
3. Run `python manage.py migrate`

### Phase 2: Services
1. Complete all `# COPILOT:` comments in `services/settlement.py`
2. Implement imports for each method
3. Follow the algorithm steps precisely

### Phase 3: Admin
1. Create `admin.py` with read-only ModelAdmin classes
2. Register Wallet, LedgerEntry, ModuleDeposit
3. Add list filters and search fields

### Phase 4: Tests
1. Create test cases for each edge case below
2. Verify idempotency
3. Test transaction rollback

---

## Edge Cases to Handle

### Settlement Calculations

| Scenario | earned_points | max_points | Expected Result |
|----------|---------------|------------|-----------------|
| Zero score | 0 | 100 | refund=0, fee=0, loss=100% |
| Perfect score | 100 | 100 | refund=90%, fee=10%, loss=0 |
| 50% completion | 50 | 100 | refund=45%, fee=5%, loss=50% |
| Rounding edge | 33 | 100 | Verify decimal precision |

### Transaction Atomicity

- **Double settlement attempt:** Second call must raise ValueError
- **Concurrent settlement:** `select_for_update()` must block
- **Partial failure:** If ledger creation fails, rollback deposit status
- **Idempotency:** Same idempotency_key must not create duplicate entries

### Balance Validation

- **Insufficient funds:** Creating deposit with insufficient balance_available
- **Negative balance:** Ensure validators prevent negative values
- **Integrity check:** Wallet balance must equal SUM(ledger) at all times

---

## Test Cases Outline

### Test: `test_settlement_perfect_score`
```python
# COPILOT: Create deposit with amount=100
# COPILOT: Settle with earned=100, max=100
# COPILOT: Assert refund=90, fee=10, loss=0
# COPILOT: Verify wallet.balance_available increased by 90
# COPILOT: Verify 3 LedgerEntry created (refund, fee, loss)
```

### Test: `test_settlement_zero_score`
```python
# COPILOT: Create deposit with amount=100
# COPILOT: Settle with earned=0, max=100
# COPILOT: Assert refund=0, fee=0, loss=100
# COPILOT: Verify wallet.balance_available unchanged
```

### Test: `test_settlement_idempotency`
```python
# COPILOT: Create and settle deposit
# COPILOT: Attempt to settle again with same ID
# COPILOT: Assert raises ValueError("Already settled")
# COPILOT: Verify only one set of ledger entries exists
```

### Test: `test_ledger_append_only`
```python
# COPILOT: Create LedgerEntry
# COPILOT: Attempt to update entry.amount
# COPILOT: Assert raises PermissionError
# COPILOT: Attempt to delete entry
# COPILOT: Assert raises PermissionError
```

### Test: `test_wallet_integrity`
```python
# COPILOT: Create multiple deposits and settlements
# COPILOT: Call wallet.verify_integrity()
# COPILOT: Assert no ValueError raised
# COPILOT: Manually corrupt wallet balance
# COPILOT: Assert verify_integrity() raises ValueError
```

---

## Critical Implementation Notes

### Decimal Precision
```python
# Always use Decimal for money calculations
from decimal import Decimal, ROUND_HALF_UP

# Round to 2 decimal places
amount = amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
```

### Idempotency Keys
```python
# Format: "{deposit_id}:{entry_type}"
idempotency_key = f"{module_deposit_id}:refund"

# Wrap in try/except for IntegrityError (duplicate key)
try:
    LedgerEntry.objects.create(idempotency_key=key, ...)
except IntegrityError:
    # Already processed - this is OK for idempotency
    pass
```

### Atomic Transactions
```python
from django.db import transaction

with transaction.atomic():
    deposit = ModuleDeposit.objects.select_for_update().get(id=deposit_id)
    # ... perform settlement ...
    deposit.mark_settled()
```

### Generic Foreign Keys
```python
from django.contrib.contenttypes.models import ContentType

# Get ContentType for learning object
ct = ContentType.objects.get_for_model(learning_object)

# Create deposit
ModuleDeposit.objects.create(
    content_type=ct,
    object_id=learning_object.id,
    ...
)
```

---

## Validation Checklist

Before considering implementation complete:

- [ ] All `# COPILOT:` comments implemented
- [ ] Migrations created and applied
- [ ] All 5 test cases pass
- [ ] Admin interface functional
- [ ] `python manage.py check` passes
- [ ] No direct wallet modification without ledger entry
- [ ] All monetary calculations use Decimal
- [ ] Idempotency verified with duplicate calls
- [ ] Transaction rollback tested

---

## Integration Points

### Signal Handler (Future)
```python
# In monetization/signals.py (to be created later)
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Pontszam)
def trigger_settlement(sender, instance, **kwargs):
    if instance.is_final:
        # Get associated ModuleDeposit
        # Call SettlementService.settle_module()
        pass
```

### Admin Configuration
```python
# In monetization/admin.py
from django.contrib import admin

@admin.register(LedgerEntry)
class LedgerEntryAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'entry_type', 'amount', 'created_at']
    list_filter = ['entry_type', 'created_at']
    search_fields = ['user__username', 'idempotency_key']
    readonly_fields = ['id', 'user', 'entry_type', 'amount', 'created_at']

    def has_add_permission(self, request):
        return False  # Ledger entries created by service only

    def has_delete_permission(self, request, obj=None):
        return False  # Append-only
```

---

## Next Steps After Implementation

1. **Manual Testing:** Create deposits via Django shell
2. **Admin Verification:** Check ledger entries in admin
3. **Integration Test:** Connect to existing Pontszam model
4. **Documentation:** Update README with monetization flow

---

**STOP HERE** - Wait for VS Code implementation with Copilot.
