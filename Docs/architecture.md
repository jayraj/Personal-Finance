# Personal Finance (PFIN) - System Architecture

## Project Structure

```
personal-fin/
├── backend/
│   ├── app/
│   │   ├── api/              # Route handlers
│   │   ├── core/             # Config, security, deps
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   └── tasks/            # Celery tasks
│   ├── alembic/              # DB migrations
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI
│   │   ├── pages/            # Route pages
│   │   ├── hooks/            # Custom hooks
│   │   ├── stores/           # Zustand
│   │   ├── api/              # Axios + TanStack Query
│   │   └── types/            # TypeScript types
│   ├── package.json
│   └── Dockerfile
├── Spec/                     # Jira story specs
│   ├── 01-Expense-Tracking/
│   ├── 02-Budget-Management/
│   ├── 03-Notifications-Alerts/
│   ├── 04-Reporting-Analytics/
│   └── 05-Auth-User-Management/
├── Docs/                     # Architecture & tech docs
│   ├── architecture.md
│   ├── tech-stack.md
│   └── database.md
├── docker-compose.yml
└── .gitignore
```

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB["React SPA (Vite + TypeScript)"]
        SM["Zustand + TanStack Query"]
    end

    subgraph "API Gateway (FastAPI)"
        API["REST API"]
        AUTH["JWT Auth"]
    end

    subgraph "Service Layer"
        EXP["Expense Service"]
        BUD["Budget Service"]
        NOTIF["Notification Service"]
        RPT["Report Service"]
        FILE["File Service"]
    end

    subgraph "Background Workers"
        CEL["Celery Workers"]
        BEAT["Celery Beat (Scheduler)"]
    end

    subgraph "Data Layer"
        PG[("PostgreSQL")]
        RD[("Redis")]
        S3[("S3 / MinIO")]
    end

    subgraph "External"
        EM["Email (Resend/SendGrid)"]
    end

    WEB --> SM --> API
    API --> AUTH
    AUTH --> EXP & BUD & NOTIF & RPT & FILE
    EXP & BUD & NOTIF & RPT --> PG
    FILE --> S3
    CEL --> RD & EM & NOTIF
    BEAT --> CEL
```

## Entity-Relationship Diagram

```mermaid
erDiagram
    User {
        uuid id PK
        string email UK
        string passwordHash
        string displayName
        string preferredCurrency
        string avatarUrl
        boolean emailVerified
        datetime createdAt
        datetime updatedAt
    }

    Category {
        uuid id PK
        uuid userId FK
        string name
        boolean isPredefined
        datetime createdAt
    }

    Expense {
        uuid id PK
        uuid userId FK
        uuid categoryId FK
        decimal amount "12,2"
        date date
        string notes "nullable"
        datetime createdAt
        datetime updatedAt
    }

    Receipt {
        uuid id PK
        uuid expenseId FK
        string fileKey
        string fileName
        string mimeType
        int fileSize
        datetime createdAt
    }

    Budget {
        uuid id PK
        uuid userId FK
        uuid categoryId FK "nullable, NULL=overall"
        decimal amount "12,2"
        date startDate
        date endDate "nullable"
        boolean rollover
        datetime createdAt
        datetime updatedAt
    }

    NotificationPreference {
        uuid id PK
        uuid userId FK
        boolean inApp
        boolean email
        boolean push
        int thresholdPercent "default 80"
        boolean weeklySummary
        datetime createdAt
        datetime updatedAt
    }

    Notification {
        uuid id PK
        uuid userId FK
        string type "BUDGET_80PCT|EXCEEDED|WEEKLY_SUMMARY"
        string title
        string body
        boolean read
        datetime createdAt
    }

    Session {
        uuid id PK
        uuid userId FK
        string refreshTokenHash
        string deviceInfo
        datetime expiresAt
        datetime createdAt
    }

    PasswordResetToken {
        uuid id PK
        uuid userId FK
        string tokenHash
        datetime expiresAt
        boolean used
        datetime createdAt
    }

    User ||--o{ Expense : "has"
    User ||--o{ Category : "defines"
    User ||--o{ Budget : "sets"
    User ||--o{ NotificationPreference : "configures"
    User ||--o{ Notification : "receives"
    User ||--o{ Session : "has"
    User ||--o{ PasswordResetToken : "requests"
    Category ||--o{ Expense : "categorizes"
    Expense ||--o{ Receipt : "has"
    Budget ||--o| Category : "targets (optional)"
```

## Data Flow - Add Expense

```mermaid
sequenceDiagram
    actor User
    participant App as React SPA
    participant API as FastAPI
    participant DB as PostgreSQL
    participant S3 as S3 Storage

    User->>App: Enter amount, category, date, notes
    User->>App: Attach receipt (optional)
    App->>App: Validate form (Zod)
    App->>API: POST /api/expenses
    API->>API: Auth middleware (JWT)
    API->>DB: INSERT expense
    alt Has receipt
        API->>S3: Upload image
        S3-->>API: fileKey
        API->>DB: INSERT receipt
    end
    DB-->>API: expense + receipt
    API-->>App: 201 Created
    App->>App: Invalidate expense list query
    App->>App: Update budget progress
    App-->>User: Show success
```

## Data Flow - Budget Alert

```mermaid
sequenceDiagram
    actor User
    participant App as React SPA
    participant API as FastAPI
    participant CEL as Celery Worker
    participant EM as Email

    User->>App: Add expense
    App->>API: POST /api/expenses
    API->>API: Calculate total vs budget
    alt Spending >= threshold
        API->>CEL: Enqueue alert job
        CEL->>App: In-app notification
        CEL->>EM: Send email
        CEL->>CEL: Log notification (dedup)
    end
    API-->>App: Expense saved
    App-->>User: See alert (if triggered)
```

## API Route Map

```
Auth
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/refresh
  POST   /api/auth/logout
  POST   /api/auth/forgot-password
  POST   /api/auth/reset-password

Profile
  GET    /api/profile
  PUT    /api/profile
  DELETE /api/profile
  PUT    /api/profile/avatar

Expenses
  GET    /api/expenses              # Paginated, filterable, sortable
  POST   /api/expenses
  GET    /api/expenses/:id
  PUT    /api/expenses/:id
  DELETE /api/expenses/:id
  POST   /api/expenses/:id/receipts
  DELETE /api/expenses/:id/receipts/:receiptId

Categories
  GET    /api/categories
  POST   /api/categories
  PUT    /api/categories/:id
  DELETE /api/categories/:id

Budgets
  GET    /api/budgets
  PUT    /api/budgets/overall
  PUT    /api/budgets/category/:categoryId

Reports
  GET    /api/reports/monthly?month=&year=
  GET    /api/reports/trends?period=7d|30d|12m
  GET    /api/reports/comparison?monthA=&monthB=
  GET    /api/reports/export?format=csv|pdf&from=&to=

Notifications
  GET    /api/notifications
  PUT    /api/notifications/:id/read
  GET    /api/notifications/preferences
  PUT    /api/notifications/preferences
```
