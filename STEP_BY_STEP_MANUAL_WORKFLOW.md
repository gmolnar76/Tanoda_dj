# 🎮 LÉPÉSENKÉNTI MANUÁLIS WORKFLOW VEZÉRLŐ

```
╔═══════════════════════════════════════════════════════════════════════════╗
║           TANODA - EXPLICIT MODELLVÁLTÁSOS FEJLESZTÉSI FOLYAMAT           ║
║                    Manuális Kontroll Minden Lépésnél                      ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**FONTOS:** Minden STEP után **TE váltasz modellt manuálisan**!

---

## 📋 TELJES FOLYAMAT ÁTTEKINTÉS

```
┌──────────────────────────────────────────────────────────────┐
│ STEP 1: Design (OPUS 4.5)                                    │
│ ↓ MANUÁLIS MODELLVÁLTÁS                                      │
│ STEP 2: Scaffold (SONNET 4.5)                                │
│ ↓ ÁTVÁLTÁS VS CODE-RA                                        │
│ STEP 3: Implementation (VS Code + Copilot)                   │
│ ↓ VISSZA CLAUDE CODE-BA                                      │
│ STEP 4: Review (SONNET 4.5)                                  │
│ ↓ MANUÁLIS MODELLVÁLTÁS (csak ha kell)                       │
│ STEP 5: Validation (OPUS 4.5) - OPCIONÁLIS                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔴 STEP 1: ARCHITECTURAL DESIGN

### ⚙️ MODELL: OPUS 4.5

**KÖRNYEZET:** Claude Code terminal

**TE CSINÁLOD:**
1. Terminal megnyitása
2. `claude code` futtatása
3. **Modell választás: OPUS 4.5**
4. Az alábbi prompt beillesztése:

### 📝 PROMPT STEP 1:

```
MODELL: OPUS 4.5
FEATURE: Monetizációs Motor - Wallet/Ledger/ModuleDeposit

FELADAT:
Finalizáld a Monetizációs Motor architektúráját a MASTER_SPEC v1.0 alapján.

KÉSZÍTSD EL:
Egy design document-et az alábbi struktúrával:

# MONETIZATION ENGINE - ARCHITECTURE DESIGN

## 1. DATA MODEL FINALIZATION

### Wallet Model
- Final field list with types
- Constraints and validators
- Indexes
- Methods

### LedgerEntry Model
- Final field list with types
- Entry types enum
- Constraints
- Why append-only

### ModuleDeposit Model
- Final field list with types
- Status state machine
- Relationships

## 2. SETTLEMENT ALGORITHM

### Core Calculation
- completion_ratio formula
- refund formula
- fee formula
- loss formula

### Edge Cases
- Zero score handling
- Perfect score handling
- Partial completion

## 3. TRANSACTION STRATEGY

### Atomicity Requirements
- What must be atomic
- Rollback conditions
- Idempotency mechanism

## 4. SECURITY CHECKPOINTS

- Balance validation points
- Double-spend prevention
- Audit requirements

## 5. INTEGRATION POINTS

- Trigger from Pontszam
- Connection to existing models
- Signal strategy

---
OUTPUT FORMAT: Markdown document
TOKEN BUDGET: 1000 max
NEXT STEP: Handoff to Sonnet for detailed spec

STOP AFTER THIS - WAIT FOR MANUAL MODEL SWITCH
```

### ✅ STEP 1 KIMENET:

Opus létrehoz egy `MONETIZATION_DESIGN.md` fájlt.

### 🛑 STOP! 

**TE CSINÁLOD MOST:**
1. Ellenőrizd a design document-et
2. Ha OK → **Manuálisan válts SONNET 4.5-re**
3. Folytasd STEP 2-vel

---

## 🟡 STEP 2: DETAILED SPECIFICATION

### ⚙️ MODELL: SONNET 4.5

**KÖRNYEZET:** Claude Code terminal (ugyanaz)

**TE CSINÁLOD:**
1. **Modell váltás: SONNET 4.5**
2. Az alábbi prompt beillesztése:

### 📝 PROMPT STEP 2:

```
MODELL: SONNET 4.5
FEATURE: Monetizációs Motor

CONTEXT:
Opus elkészítette a MONETIZATION_DESIGN.md fájlt.
Lásd: [projekten belül a file path]

FELADAT:
Készíts részletes implementációs specifikációt Copilot számára.

KÉSZÍTSD EL A KÖVETKEZŐ FÁJLOKAT:

1. tanoda/monetization/models.py
   - Python skeleton
   - Field definíciók COMMENT formában
   - Copilot számára részletes utasítások
   
2. tanoda/monetization/services/settlement.py
   - Service class skeleton
   - Method signatures
   - Algorithm steps COMMENT-ben
   
3. tanoda/monetization/COPILOT_SPEC.md
   - Részletes implementációs útmutató
   - Edge cases lista
   - Test cases outline

FORMÁTUM:
Minden fájlban használj # COPILOT: prefix-et az utasításokhoz.

Példa:
```python
class Wallet(models.Model):
    # COPILOT: Add OneToOneField to CustomUser
    # Field name: user
    # on_delete: CASCADE
    # related_name: 'wallet'
    
    # COPILOT: Add DecimalField
    # Field name: balance_locked
    # max_digits: 10, decimal_places: 2
    # default: 0
    # Add MinValueValidator(0)
```

TOKEN BUDGET: 2500 max
NEXT STEP: Developer implements in VS Code with Copilot

STOP AFTER FILE CREATION - WAIT FOR VS CODE SWITCH
```

### ✅ STEP 2 KIMENET:

Sonnet létrehozza:
- `tanoda/monetization/models.py` (skeleton + comments)
- `tanoda/monetization/services/settlement.py` (skeleton)
- `tanoda/monetization/COPILOT_SPEC.md`

### 🛑 STOP!

**TE CSINÁLOD MOST:**
1. Ellenőrizd a skeleton fájlokat
2. **Váltás VS Code-ra**
3. Folytasd STEP 3-mal

---

## 🟢 STEP 3: IMPLEMENTATION

### ⚙️ ESZKÖZ: VS Code + GitHub Copilot (GPT-4.1)

**KÖRNYEZET:** VS Code editor

**TE CSINÁLOD:**

1. **VS Code megnyitása** a tanoda projekt könyvtárban

2. **Nyisd meg:** `tanoda/monetization/COPILOT_SPEC.md`
   - Olvasd át a specet

3. **Nyisd meg:** `tanoda/monetization/models.py`

4. **Copilot használat:**
   - Cursor-t a `# COPILOT: ...` comment alá
   - Tab / Enter → Copilot suggestion
   - Fogadd el vagy módosítsd

5. **Ismételd minden mezőnél, metódusnál**

6. **Ugyanígy:** `services/settlement.py`

### 💡 TIPPEK COPILOT-HOZ:

**Ha Copilot nem reagál jól:**
```python
# COPILOT: Generate the user field as OneToOneField to CustomUser
```

**Vagy kezd el gépelni:**
```python
user = models.  # <-- Copilot kiegészíti
```

### ✅ STEP 3 KIMENET:

Teljes implementáció:
- `models.py` → minden mező, metódus kész
- `services/settlement.py` → business logic kész

### 🛑 STOP!

**TE CSINÁLOD MOST:**
1. Save all files (Ctrl+S)
2. **Váltás vissza Claude Code terminal-ra**
3. **Modell váltás: SONNET 4.5**
4. Folytasd STEP 4-gyel

---

## 🔵 STEP 4: REVIEW & TESTING

### ⚙️ MODELL: SONNET 4.5

**KÖRNYEZET:** Claude Code terminal

**TE CSINÁLOD:**
1. Terminál vissza
2. **Modell: SONNET 4.5**
3. Prompt:

### 📝 PROMPT STEP 4:

```
MODELL: SONNET 4.5
FEATURE: Monetizációs Motor - Review

CONTEXT:
Copilot implementálta:
- tanoda/monetization/models.py
- tanoda/monetization/services/settlement.py

FELADAT:
1. REVIEW - Ellenőrizd az implementációt
   - View fájlokat
   - Spec compliance check
   - Security review
   - Edge case handling

2. TESTS - Készíts teszteket
   - tanoda/monetization/tests/test_models.py
   - tanoda/monetization/tests/test_settlement.py
   
3. MIGRATIONS
   - Készítsd el a migration fájlt
   - python manage.py makemigrations monetization

4. RUN TESTS
   - bash: python manage.py test monetization

JELENTSD:
- Mit találtál
- Mit javítottál
- Test results

TOKEN BUDGET: 2000 max
NEXT STEP: Ha kritikus issue → escalate Opus-nak

STOP AFTER REVIEW
```

### ✅ STEP 4 KIMENET:

Sonnet:
- Review report
- Test fájlok
- Migration fájl
- Test eredmények

### 🛑 DÖNTÉSI PONT!

**TE DÖNTÖD EL:**

**HA review OK:**
- ✅ Kész, merge-ölhető
- VÉGE ennek a feature-nek

**HA kritikus issue van:**
- ⚠️ Folytasd STEP 5-tel (Opus validation)

---

## 🔴 STEP 5: VALIDATION (Opcionális)

### ⚙️ MODELL: OPUS 4.5

**MIKOR:** Csak ha Sonnet kritikus problémát talált

**TE CSINÁLOD:**
1. **Modell váltás: OPUS 4.5**
2. Prompt:

### 📝 PROMPT STEP 5:

```
MODELL: OPUS 4.5
FEATURE: Monetizációs Motor - Critical Validation

CONTEXT:
Sonnet review talált problémát:
[Itt részletezd mit talált Sonnet]

FELADAT:
Architectural decision szükséges:

[Konkrét kérdés/probléma]

OPTIONS:
1. [Option A]
2. [Option B]

KÉRDÉS:
Melyik az optimális megoldás és miért?

TOKEN BUDGET: 800 max
```

### ✅ STEP 5 KIMENET:

Opus döntés + indoklás

### 🛑 MAJD:

Vissza STEP 2-höz Sonnet-tel, új spec alapján

---

## 📊 GYORSREFERENCIA TÁBLÁZAT

| Step | Model | Környezet | Input | Output | Következő |
|------|-------|-----------|-------|--------|-----------|
| 1 | **OPUS 4.5** | Claude Code | MASTER_SPEC | Design doc | → SONNET |
| 2 | **SONNET 4.5** | Claude Code | Design doc | Skeleton + Spec | → VS Code |
| 3 | **Copilot** | VS Code | Spec | Implementation | → SONNET |
| 4 | **SONNET 4.5** | Claude Code | Code files | Review + Tests | → END or OPUS |
| 5 | **OPUS 4.5** | Claude Code | Critical issue | Decision | → SONNET |

---

## 🎯 MONETIZÁCIÓ - KONKRÉT KEZDÉS

### TE MOST KEZDED:

**1. Nyisd meg a terminált**

**2. Futtasd:**
```bash
claude code
```

**3. Válassz modellt: OPUS 4.5**

**4. Másold be a STEP 1 promptot:**

```
MODELL: OPUS 4.5
FEATURE: Monetizációs Motor - Wallet/Ledger/ModuleDeposit

FELADAT:
Finalizáld a Monetizációs Motor architektúráját a MASTER_SPEC v1.0 alapján.

FÓKUSZ:
1. Wallet model final schema
2. LedgerEntry model final schema  
3. ModuleDeposit model final schema
4. Settlement algorithm validation
5. Transaction atomicity strategy
6. Security checkpoints

OUTPUT:
Markdown document: tanoda/monetization/DESIGN_DOC.md

Tömör, strukturált, decision-focused.

TOKEN BUDGET: 1000 max

STOP AFTER - HANDOFF TO SONNET
```

**5. Enter**

**6. Várd meg az Opus választ**

**7. STOP - elolvasod**

**8. Ha OK → Manuális váltás SONNET 4.5-re**

**9. STEP 2 prompt beillesztése**

---

## ⚡ GYORS TIPPEK

### Modellváltás Claude Code-ban:

1. Új prompt írásakor
2. Írj: `MODELL: [név]` a prompt elejére
3. Claude felismeri és használja

### Token Tracking:

Minden STEP után nézd meg:
- Input tokens
- Output tokens
- Összesen használt

### Checklist Minden Lépés Után:

- [ ] STEP kimenet OK?
- [ ] Fájlok létrejöttek?
- [ ] Következő lépés input ready?
- [ ] Modellváltás szükséges?

---

## 🎬 KÉSZ VAGY INDULÁSRA!

**KÖVETKEZŐ LÉPÉS:**

1. **Terminál:** `claude code`
2. **Modell:** OPUS 4.5
3. **Prompt:** STEP 1 (fent)
4. **Action:** Várni → Review → Váltás SONNET-re

**Indíthatod most?** 🚀
