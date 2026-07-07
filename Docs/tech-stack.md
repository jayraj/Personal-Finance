# Personal Finance (PFIN) - Technology Stack

## Frontend

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | React 18 + TypeScript | Component-based UI; type safety |
| Bundler | Vite | Fast HMR, optimized builds |
| Routing | React Router v6 | Standard SPA routing |
| State (Client) | Zustand | Lightweight; auth/preferences only |
| State (Server) | TanStack Query (React Query) | Caching, pagination, optimistic updates |
| Forms | React Hook Form + Zod | Performant forms with schema validation |
| Styling | Tailwind CSS | Utility-first; minimal CSS files |
| Charts | Recharts | Declarative SVG charts (pie, bar, line) |
| HTTP Client | Axios | JWT interceptors, request/response transforms |
| Testing | Vitest + React Testing Library | Fast vitest runner, component tests |
| Linting | ESLint + Prettier | Code quality and formatting |

## Backend

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Runtime | Python 3.11+ | Modern Python, type hints |
| Framework | FastAPI | Async, auto-generated OpenAPI/Swagger, Pydantic validation |
| ASGI Server | Uvicorn | Production-ready async server |
| ORM | SQLAlchemy 2.0 + asyncpg | Async PostgreSQL driver; type-safe queries |
| Migrations | Alembic | Auto-generate migrations from models |
| Validation | Pydantic v2 | Request/response schemas, strict validation |
| Auth | FastAPI OAuth2 + python-jose (JWT) | Stateless JWT with access + refresh tokens |
| Password Hashing | passlib[bcrypt] | Salted bcrypt hashing |
| File Uploads | python-multipart + boto3 | Receipt images to S3/MinIO |
| Background Tasks | Celery + Redis | Async: emails, notifications, PDF exports |
| Scheduler | Celery Beat | Weekly summaries, recurring budget checks |
| Testing | pytest + httpx | Async test client for FastAPI |
| Linting | Ruff | Fast Python linter + formatter |

## Database & Cache

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Primary DB | PostgreSQL 15 | ACID, JSONB, full-text search, rich indexing |
| ORM | SQLAlchemy 2.0 | Mature, async, Alembic integration |
| Cache | Redis 7 | Session store, Celery broker, rate limiting |
| File Storage | AWS S3 (or MinIO) | Durable, signed URLs for receipts |

## Infrastructure

| Component | Technology |
|-----------|-----------|
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Error Tracking | Sentry (Python + JS SDK) |
| Email | Resend / SendGrid |

## Development Tools

| Tool | Purpose |
|------|---------|
| Ruff | Python linting + formatting |
| ESLint + Prettier | JS/TS linting + formatting |
| Husky + lint-staged | Pre-commit hooks |
| VS Code | Recommended editor |
| .editorconfig | Cross-editor consistency |
