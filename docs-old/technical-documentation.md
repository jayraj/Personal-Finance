# Personal Finance (PFIN) - Technical Documentation

## Project Overview

Personal Finance is a mobile application for tracking daily expenses, managing budgets, receiving spending alerts, and visualizing financial data through interactive reports.

**Jira Project Key:** PFIN
**Platform:** iOS + Android (React Native)

---

## Epic 1: Expense Tracking (PFIN-1)

Log, categorize, and manage daily expenses with receipt attachments and smart categorization.

### Stories

#### PFIN-6: Add Expense
- **Fields:** amount (required, numeric, positive), category (required, dropdown + custom), date (defaults today), notes (optional)
- **Validation:** Zod schema enforced client-side before API call
- **API:** `POST /api/expenses` returns created expense
- **UI:** Form screen with category picker, date picker, numeric input

#### PFIN-7: Categorize Expenses
- **Predefined categories:** Food, Transport, Utilities, Entertainment, Shopping, Healthcare, Education, Rent, Salary, Other
- **Custom categories:** Created on-the-fly via the category dropdown
- **Category deletion:** Only allowed when no expenses reference the category
- **Filtering:** Expense list supports category filter chips

#### PFIN-8: View Expense List
- **Default sort:** Date descending (newest first)
- **Sortable columns:** Date, Amount, Category
- **Filters:** Real-time search by category, amount range, date range
- **Pagination:** Infinite scroll with cursor-based pagination (20 items per page)
- **Detail view:** Tap row → full expense detail with receipt thumbnails

#### PFIN-9: Edit & Delete Expenses
- **Edit:** Pre-filled form with all current values; optimistic UI update via React Query
- **Delete:** Confirmation dialog ("Are you sure you want to delete this expense?")
- **Soft delete consideration:** Use hard delete for MVP; soft delete with 30-day recovery window for v2

#### PFIN-10: Attach Receipt Images
- **Supported formats:** JPG, PNG, PDF
- **Max file size:** 5MB per file
- **Storage:** Uploaded to S3 via pre-signed URL; thumbnail generated on server
- **Viewing:** Full-screen image viewer with swipe navigation between receipts

---

## Epic 2: Budget Management (PFIN-2)

Set monthly spending limits at the overall and per-category level with real-time progress tracking.

### Stories

#### PFIN-11: Set Overall Monthly Budget
- **API:** `PUT /api/budgets/overall` accepts `{ amount, month, year }`
- **Validation:** Amount must be > 0; warning if current spending already exceeds new budget
- **Carry-over:** Budget auto-carries each month; user can manually change

#### PFIN-12: Set Per-Category Spending Limits
- **API:** `PUT /api/budgets/category/:id` accepts `{ amount }`
- **Validation:** Warns if sum of category limits exceeds overall budget
- **Dashboard:** Each category shows its remaining budget

#### PFIN-13: Real-Time Budget Progress
- **Progress bar color coding:**
  - Green: < 60% used
  - Yellow: 60-80% used
  - Red: > 80% used
- **Updates:** After every expense add/edit/delete, budget state recalculates
- **Month selector:** Historical month budget/spending view

---

## Epic 3: Notifications & Alerts (PFIN-3)

Timely alerts via in-app, push, and email when spending approaches or exceeds budget limits.

### Stories

#### PFIN-14: 80% Threshold Alert
- **Trigger:** When total expenses cross exactly 80% of the monthly budget
- **Deduplication:** Alert fires only once per threshold crossing (re-arms if spending drops below 80%)
- **Category alerts:** Separate 80% alerts per-category when category budget is configured

#### PFIN-15: Budget Exceeded Alert
- **Trigger:** Immediate when new expense causes spending > 100% of budget
- **Channels:** In-app + push + email (based on user preferences)
- **Repeat behavior:** Fires on every new expense that exceeds the budget; shows updated overage amount

#### PFIN-16: Weekly Summary
- **Schedule:** Every Monday 9:00 AM local time
- **Content:** Total spent, top category, week-over-week comparison, remaining budget
- **Implementation:** Bull cron job checks user timezone and preferences

#### PFIN-17: Notification Preferences
- **Channels:** In-app toggle, email toggle, push toggle
- **Threshold:** Customizable percentage (default 80%)
- **Weekly summary:** On/off toggle
- **First-time defaults:** All channels enabled

---

## Epic 4: Reporting & Analytics (PFIN-4)

Visual dashboards, spending trends, month-over-month comparison, and data export.

### Stories

#### PFIN-18: Monthly Dashboard (Pie Chart)
- **Data source:** `GET /api/reports/monthly?month=&year=`
- **Chart type:** Interactive pie chart by category
- **Interaction:** Tap slice → exact amount + percentage
- **Empty state:** "No expenses recorded this month" prompt

#### PFIN-19: Spending Trends
- **Data source:** `GET /api/reports/trends?period=7d|30d|12m`
- **7 days:** Line chart, daily data points
- **30 days:** Line chart with 7-day moving average overlay
- **12 months:** Bar chart, monthly totals
- **Toggle:** Total spending vs. per-category trend view

#### PFIN-20: Export CSV/PDF
- **CSV columns:** Date, Category, Amount, Notes, Receipt URLs
- **PDF:** Formatted report with summary dashboard + expense table
- **Date filter:** Optional `from` and `to` parameters
- **Implementation:** Server generates file, uploads to S3, returns signed download URL

#### PFIN-21: Month-over-Month Comparison
- **Data source:** `GET /api/reports/comparison?monthA=&monthB=`
- **Visualization:** Side-by-side bar chart by category
- **Highlighting:** Categories with >20% change are highlighted
- **Detail drill-down:** Tap category → individual expense breakdown for both months

---

## Epic 5: Authentication & User Management (PFIN-5)

Secure access, profile management, and session handling.

### Stories

#### PFIN-22: Registration & Login
- **Password rules:** Min 8 characters, 1 uppercase, 1 number
- **Rate limiting:** 5 failed attempts → 15-minute lockout
- **Session:** JWT access token (15min) + refresh token (30 days) stored in expo-secure-store
- **Auto-login:** On successful registration, user is logged in immediately

#### PFIN-23: Password Reset
- **Flow:** Email → reset link (1-hour expiry) → new password form
- **Link expiry:** Show "expired" page if link > 1 hour old
- **In-app change:** Settings → current password → new password

#### PFIN-24: Profile Management
- **Fields:** Display name, email (verify on change), preferred currency, avatar
- **Currency change:** Updates all displayed monetary values; stored per-user
- **Account deletion:** 30-day soft delete with data export option before final deletion
- **Avatar:** Upload via `PUT /api/profile/avatar`; stored in S3; 2MB max

---

## Database Schema (Prisma)

```prisma
model User {
  id              String   @id @default(uuid())
  email           String   @unique
  passwordHash    String
  displayName     String?
  preferredCurrency String @default("USD")
  avatarUrl       String?
  emailVerified   Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  expenses              Expense[]
  categories            Category[]
  budgets               Budget[]
  notifications         Notification[]
  notificationPref      NotificationPreference?
  sessions              Session[]
  passwordResetTokens   PasswordResetToken[]
}

model Category {
  id           String   @id @default(uuid())
  userId       String
  name         String
  isPredefined Boolean  @default(false)
  createdAt    DateTime @default(now())

  user     User      @relation(fields: [userId], references: [id])
  expenses Expense[]

  @@unique([userId, name])
}

model Expense {
  id         String   @id @default(uuid())
  userId     String
  categoryId String
  amount     Decimal  @db.Decimal(12, 2)
  date       DateTime
  notes      String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user     User      @relation(fields: [userId], references: [id])
  category Category  @relation(fields: [categoryId], references: [id])
  receipts Receipt[]

  @@index([userId, date])
}

model Receipt {
  id        String   @id @default(uuid())
  expenseId String
  fileKey   String
  fileName  String
  mimeType  String
  fileSize  Int
  createdAt DateTime @default(now())

  expense Expense @relation(fields: [expenseId], references: [id], onDelete: Cascade)
}

model Budget {
  id         String   @id @default(uuid())
  userId     String
  categoryId String?  // null = overall budget
  amount     Decimal  @db.Decimal(12, 2)
  period     String   @default("monthly")
  startDate  DateTime
  endDate    DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user     User      @relation(fields: [userId], references: [id])
  category Category? @relation(fields: [categoryId], references: [id])

  @@unique([userId, categoryId, period])
}

model NotificationPreference {
  id               String  @id @default(uuid())
  userId           String  @unique
  inApp            Boolean @default(true)
  email            Boolean @default(true)
  push             Boolean @default(true)
  thresholdPercent Int     @default(80)
  weeklySummary    Boolean @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  type      String   // BUDGET_80PCT | BUDGET_EXCEEDED | WEEKLY_SUMMARY
  title     String
  body      String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId, createdAt])
}

model Session {
  id           String   @id @default(uuid())
  userId       String
  refreshToken String   @unique
  deviceInfo   String?
  expiresAt    DateTime
  createdAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}

model PasswordResetToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}
```

## Folder Structure

```
├── mobile/                          # React Native (Expo) app
│   ├── app/                         # Expo Router pages
│   │   ├── (auth)/                  # Login, Register, Forgot Password
│   │   ├── (tabs)/                  # Main tab navigation
│   │   │   ├── dashboard/
│   │   │   ├── expenses/
│   │   │   ├── budgets/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   └── _layout.tsx
│   ├── components/                  # Reusable UI components
│   ├── hooks/                       # Custom React hooks
│   ├── api/                         # API client (Axios instance + interceptors)
│   ├── stores/                      # Zustand stores (auth, preferences)
│   ├── types/                       # Shared TypeScript types
│   ├── utils/                       # Helpers (formatting, validation schemas)
│   └── app.json
│
├── server/                          # Backend (Node.js + TypeScript)
│   ├── src/
│   │   ├── routes/                  # Express/Fastify route handlers
│   │   ├── controllers/            # Request validation + response formatting
│   │   ├── services/               # Business logic
│   │   ├── middleware/             # Auth, rate limiting, error handling
│   │   ├── jobs/                   # Bull job processors (weekly summary, alerts)
│   │   ├── utils/                  # Email, file upload, token helpers
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── docker-compose.yml              # PostgreSQL + Redis + server
├── docs/                           # This documentation
└── README.md
```

## Security Considerations

1. **Authentication:** JWT stored in expo-secure-store (Keychain/Keystore); refresh tokens rotated on use
2. **Rate Limiting:** 5 login attempts per 15 minutes; 100 API requests per minute per user
3. **File Uploads:** Validate MIME type server-side; scan for malware (ClamAV integration for v2)
4. **Data Isolation:** All queries scoped by `userId`; never leak data across users
5. **SQL Injection:** Prevented by Prisma parameterized queries
6. **HTTPS:** Enforce TLS for all API communication
7. **Input Validation:** Zod schemas on both client and server
