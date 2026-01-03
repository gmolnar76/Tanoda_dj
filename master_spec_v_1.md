# MASTER SPEC v1.0 – Tanoda Monetizációs Motor

## 0. Cél és hatókör

Ez a dokumentum a Tanoda rendszer monetizációs motorjának **kanonikus specifikációja**.
A cél egy **szimulációs alapú**, auditálható, determinisztikus pénzügyi rendszer létrehozása, amely:

- nem használ valódi fizetési kaput (első fázis)
- később **adapter-szinten** lecserélhető Stripe / Barion integrációra
- illeszkedik a meglévő pont- és tanulási rendszerhez
- jogilag *nem befektetés*, hanem teljesítményarányos visszatérítés

Ez a SPEC **normatív**: a kivitelezés nem térhet el tőle üzleti logikában.

---

## 1. Alapelvek (INVARIÁNSOK)

Ezek a szabályok **soha nem sérülhetnek**:

1. **Ledger-first elv**  
   A pénzügyi igazság forrása a Ledger. A Wallet csak derivált állapot.

2. **Determináltság**  
   Ugyanarra a bemenetre mindig ugyanaz az eredmény születik.

3. **Egyszeri elszámolás**  
   Egy tanulási egységhez pontosan egy settlement tartozhat.

4. **Snapshot-elv**  
   A teljesítmény az elszámolás pillanatában rögzül, utólag nem újraszámolható.

5. **Szimulációs izoláció**  
   A fizetési logika adapteren keresztül működik; nincs közvetlen külső API-hívás.

---

## 2. Fogalmi modell

### 2.1 Szereplők

- **User (CustomUser)** – diák
- **System** – a Tanoda platform

### 2.2 Pénzügyi objektumok

- **Wallet** – felhasználói pénzügyi állapot
- **LedgerEntry** – könyvelési esemény (audit)
- **ModuleDeposit** – egy tanulási egységhez rendelt letét

### 2.3 Tanulási objektumok (külső rendszerekből)

- Kerdoiv / KerdoivKitoltes
- Pontszam / OsszesitettPontszam

A monetizációs motor **nem módosítja** ezeket, csak olvassa.

---

## 3. Wallet modell (derivált állapot)

A Wallet nem önálló igazságforrás.

Attribútumok:
- balance_locked – aktív modulokhoz kötött összeg
- balance_available – kifizetésre jogosult összeg
- balance_paid_out – már kifizetett összeg

Minden érték **LedgerEntry-kből visszaszámolható** kell legyen.

---

## 4. LedgerEntry modell (SZENT GRAÁL)

Minden pénzmozgás ledgerbe kerül.

### Típusok:
- deposit
- refund
- system_fee
- loss
- payout

### Kötelező tulajdonságok:
- user
- entry_type
- amount (pozitív)
- related_object (pl. ModuleDeposit ID)
- created_at

A ledger **append-only**.

---

## 5. Tanulási egység elszámolása (Settlement)

### 5.1 Kiindulás

- Egy User egy ModuleDeposit-et hoz létre
- A deposit összege = modul ára
- Az összeg `balance_locked`-be kerül

### 5.2 Teljesítmény kiszámítása

```
completion_ratio = earned_points / max_points
completion_ratio ∈ [0, 1]
```

### 5.3 Pénzügyi képletek

```
refundable_amount = deposit_amount × completion_ratio × 0.9
system_fee        = deposit_amount × completion_ratio × 0.1
loss              = deposit_amount − (refundable_amount + system_fee)
```

### 5.4 Könyvelési lépések

1. deposit (már korábban rögzítve)
2. refund
3. system_fee
4. loss

A `balance_locked` nullázódik.

---

## 6. ModuleDeposit modell

Cél: kapcsolat a tanulási esemény és a pénzügy között.

Attribútumok:
- user
- learning_object_type (pl. KerdoivKitoltes)
- learning_object_id
- amount
- status: active | settled
- settled_at

Egy ModuleDeposit **csak egyszer** settlementelhető.

---

## 7. Szimulált fizetési szolgáltató

### 7.1 SimulatedPaymentProvider

Feladata:
- deposit szimulálása
- payout szimulálása
- fake transaction ID-k generálása

NEM:
- nem hív külső API-t
- nem tárol állapotot

---

## 8. Tranzakciókezelés

Minden settlement:

- `transaction.atomic()` blokkban fut
- idempotens (dupla hívás → nincs dupla ledger)

---

## 9. Admin és audit

Admin felületen:
- Wallet állapot megtekinthető
- LedgerEntry lista szűrhető
- Settlement állapot ellenőrizhető

Nincs manuális módosítás.

---

## 10. Későbbi bővítés (NEM MOST)

A rendszer tervezése **előre felkészített** a valódi fizetési kapuk integrációjára, de azok **funkcionálisan le vannak tiltva** a szimulációs fázisban.

### 10.1 Dual-mode payment architecture

A monetizációs motor **dual-mode** fizetési architektúrát alkalmaz.

#### Alapelv

- A fizetési logika **provider-agnosztikus**
- A settlement és ledger réteg **nem tudja**, melyik payment provider aktív
- A provider kizárólag adapter-szinten cserélhető

#### PaymentProvider interfész

Minden fizetési kapu ugyanazt az interfészt valósítja meg:

- `create_deposit(user, amount) -> transaction_reference`
- `execute_payout(user, amount) -> payout_reference`

#### Elérhető implementációk

- **SimulatedPaymentProvider**
  - Alapértelmezett
  - Minden környezetben engedélyezett
  - Nem generál valódi pénzmozgást

- **RealPaymentProvider (DISABLED)**
  - Adapter-szinten jelen van
  - Funkcionálisan tiltott alapértelmezés szerint
  - Csak explicit konfigurációval aktiválható

#### Aktiválási feltételek

A RealPaymentProvider kizárólag akkor aktiválható, ha **minden** alábbi feltétel teljesül:

- külön környezeti változó (`ENABLE_REAL_PAYMENTS=true`)
- külön settings flag
- auditált konfiguráció

#### Tiltások

- Egyidejűleg **csak egy** provider lehet aktív
- Settlement logika nem tartalmazhat provider-specifikus feltételt
- Valódi pénzmozgás nem indulhat explicit engedély nélkül

---


## 11. Tiltott dolgok

- Wallet közvetlen módosítása ledger nélkül
- Utólagos újraszámolás
- Tanulási modellek módosítása
- Pénzügyi logika view-ban

---

## 12. Záró megjegyzés

Ez a specifikáció úgy készült, hogy:
- Copilot szó szerint végrehajthatja
- Sonnet biztonságosan implementálhatja
- Opus auditálhatja

Ez a dokumentum a **monetizációs motor alkotmánya**.



---

## 0. Canonical Project Structure Map (Model Guidance Layer)

This section provides a **token-efficient mental map** of the Tanoda project. All design, review, and implementation decisions MUST be aligned with this structure.

### 0.1 Repository Root

```
Tanoda/
├── manage.py
├── pyproject.toml / requirements.txt
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── dev.py
│   │   └── prod.py
│   ├── urls.py
│   └── wsgi.py / asgi.py
├── apps/
│   ├── users/
│   ├── learning/
│   ├── monetization/   ← THIS SPEC APPLIES HERE
│   └── analytics/
├── common/
│   ├── services/
│   ├── enums/
│   └── utils/
├── tests/
│   └── monetization/
└── docs/
    └── master_spec.md
```

### 0.2 App Responsibility Boundaries

**users/**
- User model
- Student / instructor roles
- No payment logic

**learning/**
- Modules, lessons, scoring
- Progress & completion percentages
- Emits read-only signals to monetization

**monetization/**
- Deposits
- Ledger
- Settlement logic
- PaymentProvider adapters
- No UI, no pedagogy, no grading

**analytics/**
- Aggregations
- Reporting only

### 0.3 Internal Structure of `monetization/`

```
monetization/
├── models/
│   ├── ledger.py
│   ├── deposit.py
│   └── payout.py
├── services/
│   ├── payments/
│   │   ├── base.py
│   │   ├── simulated.py
│   │   └── real.py
│   ├── settlement.py
│   └── invariants.py
├── admin.py
├── apps.py
├── tests/
│   ├── test_ledger.py
│   ├── test_settlement.py
│   └── test_providers.py
└── __init__.py
```

### 0.4 Model Usage Rules (CRITICAL)

- Models MUST NOT request full repository scans
- This map is authoritative
- Deviations require explicit justification

---

