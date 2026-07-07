# Personal Finance (PFIN) — MVP Development Plan

## Overview

Five-phase build of a personal finance tracking app with expense tracking, budget management, in-app notifications, and reporting. The frontend (React + Vite) deploys to Vercel; the backend (FastAPI) needs a persistent host (Railway/Render/Fly.io).

---

## Phase 0: Project Scaffolding ✅ Done

- Backend directory structure + FastAPI app with config, database, security, models, Alembic
- Frontend Vite + React + TypeScript scaffold with Axios, TanStack Query, Zustand, Tailwind v4
- Docker Compose (PostgreSQL 15, Redis 7, MinIO, backend, frontend)
- `.gitignore`, `.editorconfig`, `.env.example`

---

## Phase 1: Auth & User Management (Epic 5)

**Stories:** PFIN-22 (register/login), PFIN-24 (profile management)

| Task | Backend | Frontend |
|------|---------|----------|
| PFIN-22 | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`; rate limiter (5 attempts → 15 min lock via Redis) | Sign Up page (Zod: min 8 chars, 1 upper, 1 number); Login page; Auth guard; Session persistence via refresh token |
| PFIN-24 | `GET /api/profile`, `PUT /api/profile`, `PUT /api/profile/avatar`, `DELETE /api/profile`; avatar upload to MinIO | Profile Settings page (display name, email, currency selector, avatar upload); Delete Account flow with confirmation |

**Deferred:** Password reset email integration (PFIN-23), currency conversion

---

## Phase 2: Expense Tracking (Epic 1) ✅ Done

**Stories:** PFIN-7 → PFIN-6 → PFIN-8 → PFIN-9 → PFIN-10

| Task | Backend | Frontend |
|------|---------|----------|
| PFIN-7 | Category CRUD; seed 10 predefined categories | Category management page with TanStack Query; inline CRUD |
| PFIN-6 | `POST /api/expenses`; Zod validation (positive amount, category required) | Add Expense form with react-hook-form + Zod validation (error messages: "Amount is required", "Amount must be a number", "Amount must be positive") |
| PFIN-8 | `GET /api/expenses` — fixed composite cursor pagination for all sort orders, filterable (category, date range, amount), sortable | Expense list with `useInfiniteQuery` + IntersectionObserver for infinite scroll; sort/filter controls; expense detail view |
| PFIN-9 | `PUT /api/expenses/:id`, `DELETE /api/expenses/:id` | Edit form (pre-filled with react-hook-form `reset`); Delete with ConfirmDialog |
| PFIN-10 | `POST /api/expenses/:id/receipts`, `DELETE /api/expenses/:id/receipts/:receiptId`; upload to MinIO, return signed URL; file type (JPG/PNG/PDF) + size (5MB) validation | Attach receipt with client-side validation; thumbnail preview; full-screen viewer |

**Refinements:** Custom hooks (`useExpenses`, `useCategories`, `useReceipts`) with TanStack Query; all forms use react-hook-form + Zod v4; receipt client-side validation; receipt `url` field typed; backend integration tests (CRUD, pagination, filters, sorting, auth isolation); frontend unit tests (validation, hooks).

---

## Phase 3: Budget Management (Epic 2)

**Stories:** PFIN-11 → PFIN-12 → PFIN-13

| Task | Backend | Frontend |
|------|---------|----------|
| PFIN-11 | `PUT /api/budgets/overall` — upsert overall monthly budget; validate amount > 0; warn if spending exceeds | Budget Settings page; edit; month carry-over |
| PFIN-12 | `PUT /api/budgets/category/:categoryId` — upsert per-category limit; warn if sum of category limits > overall | Per-category budget inputs; warnings |
| PFIN-13 | Real-time budget progress endpoint (aggregate expenses vs budget); color thresholds (green < 60%, yellow 60–80%, red > 80%) | Dashboard budget card with progress bar; month selector for history |

---

## Phase 4: Notifications & Alerts (Epic 3)

**Stories:** PFIN-17 → PFIN-14 → PFIN-15 → PFIN-16

**Scope:** In-app notifications only (no email, no push service worker).

| Task | Backend | Frontend |
|------|---------|----------|
| PFIN-17 | `NotificationPreference` CRUD; defaults: in-app=true, email=false, push=false, threshold=80%, weekly_summary=true | Settings > Notifications page with toggles + threshold slider |
| PFIN-14 | Celery task: check 80% threshold on expense add; dedup (don't re-fire if already at 80%); category-specific alerts | Notification bell/badge; notification list; mark-as-read |
| PFIN-15 | Celery task: check 100% exceed; immediate in-app alert; re-fires on each new expense with updated overage | Toast on new notification; click navigates to expenses |
| PFIN-16 | Celery Beat: weekly summary every Monday 9 AM; compute total, top category, comparison, remaining budget | Weekly summary card in notifications |

---

## Phase 5: Reporting & Analytics (Epic 4)

**Stories:** PFIN-18 → PFIN-19 → PFIN-21 → PFIN-20

**Scope:** CSV export only (no PDF for MVP).

| Task | Backend | Frontend |
|------|---------|----------|
| PFIN-18 | `GET /api/reports/monthly?month=&year=` — aggregate by category | Dashboard pie chart (Recharts); month selector; empty state |
| PFIN-19 | `GET /api/reports/trends?period=7d|30d|12m` — daily/monthly aggregates; 7-day moving average for 30d | Trends page with period tabs; line/bar charts; per-category toggle |
| PFIN-21 | `GET /api/reports/comparison?monthA=&monthB=` — side-by-side breakdown; highlight >20% changes | Comparison page with month pickers; side-by-side bar chart; drill-down |
| PFIN-20 | `GET /api/reports/export?format=csv&from=&to=` — server-side CSV generation | Export section with date range; CSV download button |

---

## Dependency Graph

```
Phase 1: Auth (no deps)
    ↓
Phase 2: Expense Tracking (depends on Auth → User + Category)
    ↓
Phase 3: Budget Management (depends on Expense → spending aggregates)
    ↓
Phase 4: Notifications (depends on Budget → threshold/exceed checks)
    ↓
Phase 5: Reporting (depends on Expense + Budget → aggregates & comparisons)
```

## Deferred to Post-MVP

- PFIN-23: Password reset email flow
- Email notifications
- Push notifications (service worker)
- PDF export
- Real-time currency conversion
- Account deletion 30-day grace period
