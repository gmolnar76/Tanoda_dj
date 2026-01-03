👉 Cél:
strukturált projektinformáció kinyerése
👉 Forma: pontos, gépileg feldolgozható válasz
👉 NEM cél: kódírás, refaktor, javaslat

You are acting as a project analysis assistant.

Your task is NOT to generate code.
Your task is to extract structured information about the existing Django project
to support the integration of a simulated monetization system later.

Please ask for and/or infer the following information.
Respond ONLY in structured Markdown sections.
Do NOT invent missing data.
If something is unknown, explicitly mark it as UNKNOWN.

────────────────────────────
SECTION 1 — PROJECT STRUCTURE
────────────────────────────

Provide the Django project directory tree from the project root.
- Include apps
- Exclude virtualenv, node_modules, static build artifacts

Expected format:

ProjectRoot/
├── app_name/
│   ├── models.py
│   ├── views.py
│   └── ...
├── config/
└── manage.py

────────────────────────────
SECTION 2 — USER / AUTH MODEL
────────────────────────────

Describe the user authentication model:

- User base class:
  - AbstractUser
  - AbstractBaseUser
  - Custom (describe)
- User identifier (username / email)
- Existing user roles (student, teacher, admin, other)
- Related profile models (if any)
- Soft delete or deactivation mechanism (yes/no)

Expected format:

UserModel:
  base_class:
  identifier:
  roles:
  profile_model:
  soft_delete:

────────────────────────────
SECTION 3 — LEARNING DOMAIN MODEL
────────────────────────────

Describe what represents a "learning unit" in the system.

- Model name(s) used for learning units
- Hierarchy (Course → Module → Lesson → Exercise, if any)
- How performance is measured:
  - points
  - percentage
  - pass/fail
- Existing result / score / attempt models
- Can a learner retry? (yes/no)

Expected format:

LearningUnit:
  primary_model:
  hierarchy:
  scoring_type:
  result_models:
  retry_allowed:

────────────────────────────
SECTION 4 — DATA & TRANSACTIONS
────────────────────────────

Describe the database and transaction environment:

- Database engine (SQLite / PostgreSQL / other)
- Are transactions used? (atomic blocks)
- Existing financial or point-based ledgers (if any)

Expected format:

Database:
  engine:
  transactions:
  existing_ledgers:

────────────────────────────
SECTION 5 — ASYNC / SCHEDULING
────────────────────────────

Describe asynchronous capabilities:

- Celery / Redis present?
- Cron jobs?
- Management commands?

Expected format:

Async:
  celery:
  redis:
  cron:
  management_commands:

────────────────────────────
SECTION 6 — CONSTRAINTS & RULES
────────────────────────────

List any known constraints that must NOT be violated:

- Naming conventions
- App boundaries
- Regulatory / educational rules
- Backward compatibility requirements

Expected format:

Constraints:
  - item 1
  - item 2

────────────────────────────
FINAL INSTRUCTION
────────────────────────────

Do not generate solutions.
Do not propose new models.
Do not refactor anything.

Your output will be used as input for a higher-level system design process.
Accuracy is more important than completeness.
