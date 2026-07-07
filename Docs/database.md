# Personal Finance (PFIN) - Database Schema

## Naming Conventions

- All tables use **snake_case** plural names
- All primary keys are **UUID** (generated server-side via `uuidgen`)
- Foreign keys follow `{referenced_table_singular}_id`
- Timestamps: `created_at`, `updated_at`
- Soft deletes are **not** used — records are hard-deleted

---

## Tables

### User

Stores registered user accounts and profile information.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, default gen_random_uuid() | |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User's login email |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hash |
| display_name | VARCHAR(100) | NOT NULL | |
| preferred_currency | VARCHAR(3) | NOT NULL, DEFAULT 'USD' | ISO 4217 |
| avatar_url | VARCHAR(500) | NULLABLE | S3 signed URL |
| email_verified | BOOLEAN | NOT NULL, DEFAULT FALSE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:** `idx_users_email` UNIQUE on `(email)`

---

### Category

Predefined and user-created expense categories.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| user_id | UUID | FK → User(id), NOT NULL | Owner |
| name | VARCHAR(50) | NOT NULL | e.g. "Food", "Transport" |
| is_predefined | BOOLEAN | NOT NULL, DEFAULT FALSE | Seeded by system |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:** `idx_categories_user` on `(user_id)`, UNIQUE `(user_id, name)`

**Seed Data:** Food, Transport, Utilities, Entertainment, Shopping, Healthcare, Education, Rent, Salary, Other

---

### Expense

Core table for all expense entries.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| user_id | UUID | FK → User(id), NOT NULL | |
| category_id | UUID | FK → Category(id), NOT NULL | |
| amount | DECIMAL(12,2) | NOT NULL, CHECK (amount > 0) | Positive decimal |
| date | DATE | NOT NULL, DEFAULT CURRENT_DATE | |
| notes | TEXT | NULLABLE | Optional user notes |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_expenses_user_date` on `(user_id, date DESC)`
- `idx_expenses_user_category` on `(user_id, category_id)`
- `idx_expenses_user_amount` on `(user_id, amount)`

---

### Receipt

Attached receipt images for expense entries.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| expense_id | UUID | FK → Expense(id), ON DELETE CASCADE | |
| file_key | VARCHAR(500) | NOT NULL | S3 object key |
| file_name | VARCHAR(255) | NOT NULL | Original filename |
| mime_type | VARCHAR(50) | NOT NULL | image/jpeg, image/png, application/pdf |
| file_size | INTEGER | NOT NULL | In bytes, max 5MB |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:** `idx_receipts_expense` on `(expense_id)`

---

### Budget

Monthly budget limits — overall and per-category.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| user_id | UUID | FK → User(id), NOT NULL | |
| category_id | UUID | FK → Category(id), NULLABLE | NULL = overall budget |
| amount | DECIMAL(12,2) | NOT NULL, CHECK (amount > 0) | |
| start_date | DATE | NOT NULL | Usually 1st of month |
| end_date | DATE | NULLABLE | NULL = ongoing |
| rollover | BOOLEAN | NOT NULL, DEFAULT FALSE | Carry unused to next month |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_budgets_user` on `(user_id)`
- UNIQUE `(user_id, category_id, start_date)` — one budget per category per month

---

### Notification Preference

Per-user notification channel configuration.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| user_id | UUID | FK → User(id), UNIQUE, NOT NULL | One row per user |
| in_app | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| email | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| push | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| threshold_percent | INTEGER | NOT NULL, DEFAULT 80, CHECK (1-100) | |
| weekly_summary | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:** `idx_notif_prefs_user` UNIQUE on `(user_id)`

---

### Notification

Stored in-app notifications for users.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| user_id | UUID | FK → User(id), NOT NULL | |
| type | VARCHAR(30) | NOT NULL | BUDGET_80PCT, BUDGET_EXCEEDED, WEEKLY_SUMMARY |
| title | VARCHAR(200) | NOT NULL | |
| body | TEXT | NOT NULL | |
| read | BOOLEAN | NOT NULL, DEFAULT FALSE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_notifications_user_read` on `(user_id, read, created_at DESC)`
- `idx_notifications_user_type_created` on `(user_id, type, created_at)`

---

### Session

Refresh token sessions for multi-device support.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| user_id | UUID | FK → User(id), NOT NULL | |
| refresh_token_hash | VARCHAR(255) | NOT NULL | SHA-256 hash of token |
| device_info | VARCHAR(255) | NULLABLE | User-agent / device name |
| expires_at | TIMESTAMPTZ | NOT NULL | 30 days from creation |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:**
- `idx_sessions_user` on `(user_id)`
- `idx_sessions_token` on `(refresh_token_hash)`

---

### Password Reset Token

One-time password reset tokens.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| user_id | UUID | FK → User(id), NOT NULL | |
| token_hash | VARCHAR(255) | NOT NULL | SHA-256 hash |
| expires_at | TIMESTAMPTZ | NOT NULL | 1 hour from creation |
| used | BOOLEAN | NOT NULL, DEFAULT FALSE | |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

**Indexes:** `idx_reset_tokens_hash` on `(token_hash)`, `idx_reset_tokens_user` on `(user_id)`

---

## Index Strategy Summary

| Purpose | Columns |
|---------|---------|
| Expense list (chronological) | `(user_id, date DESC)` |
| Expense filter by category | `(user_id, category_id)` |
| Expense filter by amount | `(user_id, amount)` |
| Unread notifications | `(user_id, read, created_at DESC)` |
| Budget lookup per month | `(user_id, category_id, start_date)` UNIQUE |
| Unique category names | `(user_id, name)` UNIQUE |

## Migrations

Alembic manages all schema changes.

- `alembic revision --autogenerate -m "message"` to create migrations
- `alembic upgrade head` to apply
- All seeds (predefined categories) go in a dedicated migration or `seed.py` script
