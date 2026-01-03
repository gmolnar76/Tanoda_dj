# 🔧 CLAUDE CODE + VS CODE INTEGRÁLT WORKFLOW

```
╔═══════════════════════════════════════════════════════════════════════════╗
║         TANODA PROJEKT - CLAUDE CODE + VS CODE MUNKAKÖRNYEZET             ║
║              Token-Optimalizált Multi-Model Development                   ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Verzió:** 1.0  
**Dátum:** 2026. január 3.  
**Környezet:** Claude Code + VS Code + GitHub Copilot

---

## 🏗️ KÖRNYEZET ARCHITEKTÚRA

### Eszköz Szerepkörök

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLAUDE CODE (Terminal)                       │
│  ─────────────────────────────────────────────────────────      │
│  Modellek:                                                      │
│  • Opus 4.5    → Architectural decisions                       │
│  • Sonnet 4.5  → Task orchestration & file operations          │
│                                                                 │
│  Képességek:                                                    │
│  • File creation, editing, viewing                             │
│  • Bash command execution                                      │
│  • Multi-file operations                                       │
│  • Project structure navigation                                │
│  • Git operations                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VS CODE (Editor)                             │
│  ─────────────────────────────────────────────────────────      │
│  Modellek:                                                      │
│  • GitHub Copilot (GPT-4.1) → Code generation                  │
│                                                                 │
│  Képességek:                                                    │
│  • Inline code suggestions                                     │
│  • Function/class generation                                   │
│  • Auto-completion                                             │
│  • Refactoring assistance                                      │
│  • Test generation                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 MUNKAMEGOSZTÁS ESZKÖZÖK SZERINT

### CLAUDE CODE Felelősségek

**1. Projekt Orchestration (Sonnet 4.5)**
- Feladat dekompozíció
- File struktúra tervezés
- Multi-file operációk koordinálása
- Integration testing
- Code review

**2. Architectural Design (Opus 4.5)**
- Design documents készítése
- Data model finalizálás
- API contract definition
- Security architecture
- Performance strategy

**3. File Operations**
- Új fájlok létrehozása struktuált módon
- Meglévő fájlok módosítása (str_replace)
- Directory struktúra kialakítása
- Migration fájlok létrehozása
- Configuration fájlok

**4. Automated Tasks**
- Django management commands futtatása
- Testing framework execution
- Database migrations
- Static file collection
- Dependency management

### VS CODE + COPILOT Felelősségek

**1. Interactive Coding (GPT-4.1)**
- Function implementáció
- Class methods generálás
- Boilerplate code
- Import statements
- Docstrings

**2. Rapid Development**
- CRUD operations
- Serializers
- Form classes
- Admin configurations
- Simple views

**3. Refactoring**
- Code cleanup
- Variable renaming
- Extract method
- Inline variable

**4. Test Writing**
- Unit test cases
- Fixture creation
- Mock objects
- Assertion statements

---

## 🔄 INTEGRÁLT WORKFLOW

### Feature Development Flow

```
STEP 1: DESIGN (Claude Code - Opus 4.5)
├─ Terminal: claude code
├─ Prompt: "Design [Feature] architecture"
├─ Output: design_doc.md
└─ Action: Creates design document

        ↓

STEP 2: SCAFFOLD (Claude Code - Sonnet 4.5)
├─ Terminal: claude code
├─ Prompt: "Create file structure for [Feature]"
├─ Actions:
│  ├─ create_file: models.py (skeleton)
│  ├─ create_file: services.py (skeleton)
│  ├─ create_file: tests.py (skeleton)
│  └─ create_file: IMPLEMENTATION_SPEC.md
└─ Output: File structure ready

        ↓

STEP 3: IMPLEMENT (VS Code - Copilot)
├─ Editor: VS Code
├─ Open: models.py
├─ Read: IMPLEMENTATION_SPEC.md
├─ Action: Copilot generates code following spec
└─ Developer: Accept/modify suggestions

        ↓

STEP 4: REVIEW (Claude Code - Sonnet 4.5)
├─ Terminal: claude code
├─ Prompt: "Review implementation in [files]"
├─ Actions:
│  ├─ view: generated files
│  ├─ bash: run tests
│  └─ str_replace: fix issues
└─ Output: Reviewed and corrected code

        ↓

STEP 5: VALIDATE (Claude Code - Opus 4.5 if needed)
├─ Terminal: claude code
├─ Prompt: "Validate [Feature] architecture compliance"
└─ Output: Validation report
```

---

## 💻 PRAKTIKUS PÉLDÁK

### Példa 1: Monetizációs Motor - Wallet Model

#### Phase 1: Claude Code (Sonnet) - Scaffold

**Terminal Command:**
```bash
claude code
```

**Prompt:**
```
Create the Wallet model scaffold based on MASTER_SPEC v1.0.

Location: tanoda/monetization/models.py

Include:
- Model skeleton
- Field definitions as comments
- Method signatures
- Meta class outline

Leave implementation details for Copilot.
```

**Claude Code Action:**
```python
# Claude creates this file:

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Wallet(models.Model):
    """
    User wallet for monetization system.
    Tracks locked, available, and paid out balances.
    """
    
    # COPILOT: Implement these fields according to spec
    # - user: OneToOneField to CustomUser
    # - balance_locked: DecimalField(max_digits=10, decimal_places=2)
    # - balance_available: DecimalField(max_digits=10, decimal_places=2)
    # - balance_paid_out: DecimalField(max_digits=10, decimal_places=2)
    # - created_at: DateTimeField(auto_now_add=True)
    # - updated_at: DateTimeField(auto_now=True)
    
    class Meta:
        # COPILOT: Add meta options
        pass
    
    def total_balance(self):
        """Calculate total balance across all fields"""
        # COPILOT: Implement
        pass
    
    def __str__(self):
        # COPILOT: Implement
        pass
```

#### Phase 2: VS Code (Copilot) - Implementation

**Developer opens models.py in VS Code**

**Copilot suggests (auto-complete):**
```python
user = models.OneToOneField(
    User,
    on_delete=models.CASCADE,
    related_name='wallet'
)
balance_locked = models.DecimalField(
    max_digits=10,
    decimal_places=2,
    default=0,
    validators=[MinValueValidator(0)]
)
# ... etc
```

**Developer accepts suggestions, file complete**

#### Phase 3: Claude Code (Sonnet) - Review

**Terminal:**
```bash
claude code
```

**Prompt:**
```
Review monetization/models.py implementation.
Check:
1. Spec compliance
2. Validation presence
3. Method completeness
4. Meta options
```

**Claude Code:**
- Reads file
- Checks against spec
- Suggests corrections if needed
- Runs initial tests

---

### Példa 2: Settlement Service

#### Phase 1: Claude Code - Create Spec

**Prompt:**
```
Create detailed implementation spec for SettlementService.

Output to: monetization/SETTLEMENT_SPEC.md

Include:
- Method signatures
- Algorithm steps
- Edge cases
- Transaction requirements
```

**Claude Output:**
```markdown
# Settlement Service Implementation Spec

## Method: settle_module(module_deposit_id: int) -> dict

### Algorithm Steps:
1. Fetch ModuleDeposit (raise if not found)
2. Check settled status (idempotency)
3. Get user score from Pontszam
4. Calculate completion_ratio = earned / max
5. Calculate amounts:
   - refund = deposit × ratio × 0.9
   - fee = deposit × ratio × 0.1
   - loss = deposit - (refund + fee)
6. Create LedgerEntry records (atomic)
7. Update Wallet balances
8. Mark deposit as settled

### Copilot Instructions:
- Use @transaction.atomic decorator
- Raise ValueError on invalid states
- Return dict with all calculated amounts
- Log all operations

### Edge Cases:
- module_deposit_id doesn't exist → raise NotFound
- Already settled → return cached result
- Zero score → full loss
- Max score → 90% refund + 10% fee
```

#### Phase 2: Claude Code - Create Service Skeleton

**Prompt:**
```
Create service skeleton at monetization/services/settlement.py
based on SETTLEMENT_SPEC.md
```

**Claude creates:**
```python
from django.db import transaction
from decimal import Decimal

class SettlementService:
    """
    Handles module settlement calculations and wallet updates.
    """
    
    @transaction.atomic
    def settle_module(self, module_deposit_id: int) -> dict:
        """
        Settle a completed module deposit.
        
        Args:
            module_deposit_id: ID of ModuleDeposit to settle
            
        Returns:
            dict: Settlement summary with refund, fee, loss amounts
            
        Raises:
            ValueError: If deposit invalid or already settled
        """
        # COPILOT: Implement following SETTLEMENT_SPEC.md steps 1-8
        pass
    
    def _calculate_amounts(self, deposit_amount: Decimal, 
                          completion_ratio: float) -> dict:
        """Calculate refund, fee, loss amounts"""
        # COPILOT: Implement calculation formulas
        pass
    
    def _create_ledger_entries(self, user, amounts: dict, 
                               deposit) -> None:
        """Create LedgerEntry records for settlement"""
        # COPILOT: Implement ledger entry creation
        pass
```

#### Phase 3: VS Code - Copilot Implements

Developer opens settlement.py, Copilot fills in the blanks

#### Phase 4: Claude Code - Integration Test

**Prompt:**
```
Create integration test for SettlementService.
Test scenarios from SETTLEMENT_SPEC.md edge cases.
```

**Claude creates:** `tests/test_settlement_integration.py`

---

## 🎯 WORKFLOW OPTIMALIZÁCIÓ

### Token Spórolás Stratégiák

**1. Skeleton Files (Claude Code)**
```python
# Claude creates structure, Copilot fills details
class MyModel(models.Model):
    # COPILOT: Add fields per spec
    pass
```

**2. Spec-Driven Development**
```markdown
# Claude writes spec
# Copilot reads spec from comments
# Developer guides Copilot
```

**3. Batch Operations (Claude Code)**
```
Single prompt creates multiple related files:
- models.py
- admin.py
- tests/test_models.py
```

**4. Iterative Refinement**
```
Claude → Skeleton
Copilot → Implementation  
Claude → Review
Copilot → Fix
```

### Fájl Műveletek Hatékonyan

**Claude Code strengths:**
- Multi-file operations (create 5 files at once)
- str_replace for precise edits
- Bash commands for automation
- View entire directory structures

**VS Code + Copilot strengths:**
- Inline suggestions
- Context-aware completions
- Real-time feedback
- Interactive refinement

---

## 📁 PROJEKT STRUKTÚRA KEZELÉS

### Claude Code Directory Setup

**Prompt:**
```
Set up monetization app structure:

tanoda/
└── monetization/
    ├── __init__.py
    ├── apps.py
    ├── models.py
    ├── admin.py
    ├── services/
    │   ├── __init__.py
    │   ├── settlement.py
    │   └── validation.py
    ├── providers/
    │   ├── __init__.py
    │   ├── base.py
    │   └── simulated.py
    ├── migrations/
    │   └── __init__.py
    └── tests/
        ├── __init__.py
        ├── test_models.py
        ├── test_services.py
        └── test_integration.py
```

**Claude Response:**
```bash
# Creates all directories and __init__.py files
# Creates skeleton files with imports
# Updates tanoda/settings.py INSTALLED_APPS
```

### VS Code Interactive Development

Developer navigates created structure, implements with Copilot assistance

---

## 🔀 GIT WORKFLOW INTEGRÁCIÓ

### Claude Code + Git

**Commit Strategy:**

**Phase 1: Scaffold (Claude Code)**
```bash
git checkout -b feature/monetization-wallet
git add monetization/
git commit -m "feat(monetization): Add Wallet model scaffold

Created by: Claude Code Sonnet 4.5
- Model structure
- Field definitions (comments)
- Method signatures
Ready for Copilot implementation"
```

**Phase 2: Implementation (VS Code + Copilot)**
```bash
git add monetization/models.py
git commit -m "feat(monetization): Implement Wallet model

Implemented by: GitHub Copilot GPT-4.1
Following spec from scaffold
- All fields implemented
- Validators added
- Methods completed"
```

**Phase 3: Review (Claude Code)**
```bash
git add monetization/models.py monetization/tests/
git commit -m "refactor(monetization): Review and test Wallet

Reviewed by: Claude Code Sonnet 4.5
- Added edge case handling
- Fixed validation logic
- Added comprehensive tests"
```

---

## 🎮 PRAKTIKUS HASZNÁLATI MINTÁK

### Pattern 1: New Django App

**1. Claude Code:**
```
"Create new Django app 'monetization' with standard structure.
Include models, admin, services, tests directories."
```

**2. Claude Code:**
```
"Create design document for Wallet/Ledger/ModuleDeposit models."
```

**3. Claude Code:**
```
"Create model skeletons with Copilot instructions as comments."
```

**4. VS Code:**
Developer implements models with Copilot

**5. Claude Code:**
```
"Review models.py, create migrations, run tests."
```

### Pattern 2: API Endpoint

**1. Claude Code (Opus):**
```
"Design RESTful API for settlement endpoint.
Include request/response schemas, authentication, permissions."
```

**2. Claude Code (Sonnet):**
```
"Create ViewSet skeleton for SettlementAPI.
Include serializer specs as comments."
```

**3. VS Code:**
Developer implements ViewSet and Serializer with Copilot

**4. Claude Code:**
```
"Create API tests, run, review implementation."
```

### Pattern 3: Database Migration

**1. Claude Code:**
```
"Create migration for Wallet/Ledger/ModuleDeposit models.
Include indexes and constraints."
```

**2. Claude Code:**
```
bash: python manage.py makemigrations
bash: python manage.py migrate --plan
```

**3. Review migration file in VS Code**

**4. Claude Code:**
```
bash: python manage.py migrate
"Verify migration with test data."
```

---

## ⚡ GYORSÍTÓTÁBLÁZAT

| Feladat | Eszköz | Model | Prompt Mintája |
|---------|--------|-------|----------------|
| Architektúra design | Claude Code | Opus 4.5 | "Design architecture for..." |
| File struktúra | Claude Code | Sonnet 4.5 | "Create file structure for..." |
| Model skeleton | Claude Code | Sonnet 4.5 | "Create model skeleton with Copilot comments..." |
| Implementation | VS Code | Copilot GPT-4.1 | Tab/accept suggestions |
| Multi-file edit | Claude Code | Sonnet 4.5 | "Update files X, Y, Z to..." |
| Code review | Claude Code | Sonnet 4.5 | "Review implementation in..." |
| Testing | Claude Code | Sonnet 4.5 | "Create and run tests for..." |
| Refactoring | VS Code | Copilot GPT-4.1 | Select code, ask Copilot |
| Git operations | Claude Code | Sonnet 4.5 | "Commit changes with message..." |
| Documentation | Claude Code | Sonnet 4.5 | "Generate API docs for..." |

---

## 🚀 KÖVETKEZŐ LÉPÉSEK - MONETIZÁCIÓ START

### Javasolt Indítási Szekvencia

**STEP 1: Terminal (Claude Code)**
```bash
claude code
```

**Prompt:**
```
CONTEXT: Working on Tanoda Django project monetization feature.

TASK: Set up monetization app structure.

Create directory structure:
tanoda/monetization/
  ├── models.py
  ├── admin.py
  ├── apps.py
  ├── services/settlement.py
  ├── providers/simulated.py
  ├── tests/

Register app in settings.INSTALLED_APPS.

Token budget: Keep minimal, structure only.
```

**STEP 2: Claude Code (Opus 4.5)**
```
TASK: Review MASTER_SPEC v1.0 and create final data model decisions.

Output: monetization/DESIGN_DOC.md

Focus on:
- Wallet/Ledger/ModuleDeposit final schema
- Settlement algorithm validation
- Security checkpoints

Token budget: ~800 tokens max.
```

**STEP 3: Claude Code (Sonnet 4.5)**
```
TASK: Create model skeletons with Copilot instructions.

Files:
- monetization/models.py (Wallet, LedgerEntry, ModuleDeposit)
- monetization/COPILOT_SPEC.md (detailed instructions)

Format: Python skeleton + comment-based specs for Copilot.

Token budget: ~1500 tokens.
```

**STEP 4: VS Code + Copilot**
- Open models.py
- Read COPILOT_SPEC.md
- Implement following Copilot suggestions

**STEP 5: Claude Code**
```
TASK: Review models.py implementation.
Create migrations.
Run tests.

Token budget: ~1000 tokens.
```

---

## 📝 BEST PRACTICES

### Do's ✅

1. **Claude Code** - Strukturált műveletek
   - File creation/editing
   - Multi-step processes
   - Review and testing

2. **VS Code Copilot** - Interaktív fejlesztés
   - Function implementation
   - Code completion
   - Quick iterations

3. **Clear Handoffs**
   - Claude creates specs
   - Copilot implements
   - Claude reviews

4. **Token Awareness**
   - Minimal context in prompts
   - Reference files by path
   - Batch operations

### Don'ts ❌

1. **Ne használj Claude Code-ot:**
   - Egyszerű autocomplete-re
   - Inline suggestions-re
   - Single line edits-re

2. **Ne használj Copilot-ot:**
   - Architektúra döntésekre
   - Multi-file refactoring-ra
   - Complex design patterns-re

3. **Ne ismételd:**
   - File tartalmakat prompt-ban
   - Már létező specifikációkat
   - Context amit Claude láthat

---

**Kész a használatra!**  
**Következő:** `claude code` indítása és monetizáció app setup kezdése.
