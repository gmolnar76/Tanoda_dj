────────────────────────────
SECTION 1 — PROJECT STRUCTURE
────────────────────────────

tanoda/
├── account/
│ ├── models.py
│ ├── views.py
│ └── ...
├── blockly/
│ ├── models.py
│ ├── views.py
│ └── ...
├── egesz_szamok/
│ ├── models.py
│ ├── views.py
│ └── ...
├── kerdoiv/
│ ├── models.py
│ ├── views.py
│ └── ...
├── mathsolver/
│ ├── models.py
│ ├── views.py
│ └── ...
├── navbar/
│ ├── models.py
│ ├── views.py
│ └── ...
├── plotly_chart/
│ ├── models.py
│ ├── views.py
│ └── ...
├── pont/
│ ├── models.py
│ ├── views.py
│ └── ...
├── reg_1/
│ ├── models.py
│ ├── views.py
│ └── ...
├── statisztika/
│ ├── models.py
│ ├── views.py
│ └── ...
├── tanoda/
│ ├── models.py
│ ├── views.py
│ ├── settings.py
│ ├── urls.py
│ └── ...
├── threejs_app/
│ ├── models.py
│ ├── views.py
│ └── ...
├── TRON_Bit/
│ ├── models.py
│ ├── views.py
│ └── ...
├── manage.py

────────────────────────────
SECTION 2 — USER / AUTH MODEL
────────────────────────────

UserModel:
base_class: Custom (AbstractBaseUser + PermissionsMixin)
identifier: email
roles: UNKNOWN (no explicit roles, but is_staff, is_superuser present)
profile_model: NONE (no related profile model found)
soft_delete: no

────────────────────────────
SECTION 3 — LEARNING DOMAIN MODEL
────────────────────────────

LearningUnit:
primary_model: Kerdoiv, SzorzasGyakorlatSession, Pontszam, Kihivas
hierarchy: Kerdoiv → Kerdes → Valaszlehetoseg; SzorzasGyakorlatSession for practice sessions
scoring_type: points, percentage (Pontszam, KerdoivKitoltes, hatekonysag)
result_models: Pontszam, OsszesitettPontszam, Kihivas, KerdoivKitoltes, HibasValasz
retry_allowed: yes

────────────────────────────
SECTION 4 — DATA & TRANSACTIONS
────────────────────────────

Database:
engine: SQLite
transactions: UNKNOWN (no explicit atomic blocks found)
existing_ledgers: Pontszam, OsszesitettPontszam, UserLevel, Badge, UserBadge, Streak

────────────────────────────
SECTION 5 — ASYNC / SCHEDULING
────────────────────────────

Async:
celery: no
redis: no
cron: UNKNOWN
management_commands: UNKNOWN

────────────────────────────
SECTION 6 — CONSTRAINTS & RULES
────────────────────────────

Constraints:

AUTH_USER_MODEL is account.CustomUser (email-based)
SQLite is used by default
App boundaries as per Django conventions
No explicit financial ledgers present
No Celery/Redis integration
────────────────────────────
FINAL INSTRUCTION
────────────────────────────

No code generated. No refactor or proposal included. All unknowns are marked.