# Personal Finance (PFIN) - System Architecture

## High-Level Architecture

```mermaid
graph TB
    subgraph "Mobile Client (React Native / Expo)"
        UI["UI Layer<br/>Screens & Components"]
        SM["State Management<br/>Zustand + React Query"]
        NAV["Navigation<br/>React Navigation"]
        LS["Local Storage<br/>SQLite / WatermelonDB"]
    end

    subgraph "Backend (Node.js + TypeScript)"
        API["REST API<br/>Express/Fastify"]
        AUTH["Auth Service<br/>JWT + bcrypt"]
        EXP["Expense Service<br/>CRUD + Categorization"]
        BUD["Budget Service<br/>Limits + Calculations"]
        NOTIF["Notification Service<br/>Triggers + Delivery"]
        RPT["Report Service<br/>Aggregations + Export"]
        FILE["File Service<br/>Upload + Signed URLs"]
        BG["Background Jobs<br/>Bull + Redis"]
    end

    subgraph "Data Layer"
        PG[("PostgreSQL<br/>Primary Database")]
        RD[("Redis<br/>Cache + Queue")]
        S3[("S3 / MinIO<br/>Receipt Storage")]
    end

    subgraph "External Services"
        EMAIL["Email Provider<br/>Resend/SendGrid"]
        PUSH["Push Notifications<br/>FCM/APNs"]
    end

    UI --> SM
    SM --> NAV
    SM --> API
    LS --> SM

    API --> AUTH
    API --> EXP
    API --> BUD
    API --> NOTIF
    API --> RPT
    API --> FILE

    AUTH --> PG
    EXP --> PG
    BUD --> PG
    NOTIF --> PG
    RPT --> PG
    FILE --> S3

    BG --> RD
    BG --> EMAIL
    BG --> NOTIF

    NOTIF --> PUSH
    NOTIF --> EMAIL
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
        decimal amount
        date date
        string notes
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
        uuid categoryId FK "nullable; NULL = overall budget"
        decimal amount
        string period "monthly"
        date startDate
        date endDate "nullable"
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
        string type "BUDGET_80PCT | BUDGET_EXCEEDED | WEEKLY_SUMMARY"
        string title
        string body
        boolean read
        datetime createdAt
    }

    Session {
        uuid id PK
        uuid userId FK
        string refreshToken
        string deviceInfo
        datetime expiresAt
        datetime createdAt
    }

    PasswordResetToken {
        uuid id PK
        uuid userId FK
        string token
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
    participant App as Mobile App
    participant API as Backend API
    participant DB as PostgreSQL
    participant S3 as S3 Storage

    User->>App: Enter amount, category, date, notes
    User->>App: Attach receipt image (optional)
    App->>App: Validate form (Zod)
    App->>API: POST /api/expenses
    Note over API: Auth middleware validates JWT
    API->>DB: INSERT expense
    alt Has receipt
        API->>S3: Upload image
        S3-->>API: fileKey
        API->>DB: INSERT receipt
    end
    DB-->>API: expense + receipt
    API-->>App: 201 Created + expense data
    App->>App: Invalidate expense list query
    App->>App: Update budget progress
    App-->>User: Show success + updated list
```

## Data Flow - Budget Alert (80% / 100%)

```mermaid
sequenceDiagram
    actor User
    participant App as Mobile App
    participant API as Backend API
    participant BG as Background Jobs (Bull)
    participant Email as Email Provider
    participant Push as Push Service

    User->>App: Add new expense
    App->>API: POST /api/expenses
    API->>API: Calculate total spending vs budget
    alt Spending >= 80% and not yet notified
        API->>BG: Enqueue BudgetAlertJob
        BG->>App: Send in-app notification
        BG->>Push: Send push notification
        BG->>Email: Send email alert
    end
    alt Spending >= 100%
        API->>BG: Enqueue BudgetExceededJob
        BG->>App: Send urgent notification
        BG->>Push: Send push notification
        BG->>Email: Send over-budget email
    end
    API-->>App: Expense saved
    App-->>User: See alert banner
```

## API Route Map

```
Auth
  POST   /api/auth/register          # User registration
  POST   /api/auth/login             # Login
  POST   /api/auth/refresh           # Refresh JWT
  POST   /api/auth/logout            # Logout (invalidate refresh token)
  POST   /api/auth/forgot-password   # Request password reset email
  POST   /api/auth/reset-password    # Reset password with token

Profile
  GET    /api/profile                # Get current user profile
  PUT    /api/profile                # Update profile
  DELETE /api/profile                # Delete account
  PUT    /api/profile/avatar         # Upload avatar

Expenses
  GET    /api/expenses               # List (paginated, filterable, sortable)
  POST   /api/expenses               # Create expense
  GET    /api/expenses/:id           # Get expense detail
  PUT    /api/expenses/:id           # Update expense
  DELETE /api/expenses/:id           # Delete expense
  POST   /api/expenses/:id/receipts  # Attach receipt
  DELETE /api/expenses/:id/receipts/:receiptId  # Remove receipt

Categories
  GET    /api/categories             # List all categories for user
  POST   /api/categories             # Create custom category
  PUT    /api/categories/:id         # Update category
  DELETE /api/categories/:id         # Delete category (if unused)

Budgets
  GET    /api/budgets                # Get budgets (overall + per-category)
  PUT    /api/budgets/overall        # Set overall monthly budget
  PUT    /api/budgets/category/:id   # Set per-category budget

Reports
  GET    /api/reports/monthly?month=&year=  # Monthly breakdown
  GET    /api/reports/trends?period=7d|30d|12m  # Trend data
  GET    /api/reports/comparison?monthA=&monthB=  # MoM comparison
  GET    /api/reports/export?format=csv|pdf&from=&to=  # Export data

Notifications
  GET    /api/notifications          # List notifications (paginated)
  PUT    /api/notifications/:id/read # Mark as read
  GET    /api/notifications/preferences  # Get preferences
  PUT    /api/notifications/preferences  # Update preferences
```
