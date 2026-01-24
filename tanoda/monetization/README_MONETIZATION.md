# Monetizációs Motor – Használati útmutató

## Manuális tesztelés (Django shell)

1. Indítsd el a shell-t:
   ```bash
   python tanoda/manage.py shell
   ```
2. Példa deposit létrehozására és settlement futtatására:
   ```python
   from django.contrib.auth import get_user_model
   from tanoda.monetization.models import Wallet
   from tanoda.monetization.services.settlement import SettlementService
   from django.contrib.contenttypes.models import ContentType

   User = get_user_model()
   user = User.objects.create(username='manualtest')
   wallet = Wallet.objects.create(user=user, balance_available=100)
   learning_object = User.objects.create(username='dummyobj')
   service = SettlementService()
   deposit_id = service.create_deposit(user.id, learning_object, 100)
   result = service.settle_module(deposit_id, 100, 100)
   print(result)
   ```

## Admin ellenőrzés
- Jelentkezz be a Django adminba.
- Ellenőrizd a Wallet, LedgerEntry, ModuleDeposit modelleket (csak olvasható, szűrhető, kereshető).

## Integráció Pontszam modellel
- A settlement logika szignálból is hívható, lásd: COPILOT_SPEC.md "Integration Points".

## Főbb edge case-ek
- 0, 50, 100 pont, kerekítés, idempotencia, rollback, insufficient funds, negative balance, integritás – minden automatikusan tesztelve.

## Tesztek futtatása
```bash
python tanoda/manage.py test monetization
```

## Decimal pontosság
- Minden pénzügyi számítás Decimal, két tizedesre kerekítve.

## További dokumentáció
- Lásd: COPILOT_SPEC.md, models.py, settlement.py, admin.py, tests/
