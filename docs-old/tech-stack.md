# Personal Finance (PFIN) - Technology Stack

## Frontend

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | **React Native** (Expo) | Cross-platform iOS/Android from a single codebase; large ecosystem; hot-reload for rapid iteration |
| Language | **TypeScript** | Type safety, better IDE support, fewer runtime errors |
| State Management | **Zustand** + **React Query (TanStack Query)** | Zustand for client state (auth, preferences); React Query for server state (expenses, budgets) with caching, pagination, and optimistic updates |
| Navigation | **React Navigation** | Industry standard for RN; supports stack, tab, and drawer navigators |
| Charts | **Victory Native** or **react-native-chart-kit** | Pie/bar/line charts for dashboards and trends |
| Forms | **React Hook Form** + **Zod** | Performant forms with schema-based validation |
| HTTP Client | **Axios** | Interceptors for JWT refresh, request/response transformation |
| File Upload | **expo-image-picker** + **expo-file-system** | Camera/gallery selection and image handling |
| Push Notifications | **Expo Notifications** / **Firebase Cloud Messaging** | Cross-platform push notification delivery |
| Offline Support | **WatermelonDB** or **SQLite (expo-sqlite)** | Local-first data for offline expense entry |

## Backend

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Runtime | **Node.js** | JavaScript/TypeScript across the stack; fast I/O for API requests |
| Framework | **Express.js** or **Fastify** | Mature, well-documented; Fastify offers better performance |
| Language | **TypeScript** | Shared types with frontend; strict type checking |
| API Style | **REST** (with optional GraphQL later) | Simpler to start; clear resource mapping for expenses, budgets, categories |
| Auth | **JWT** (access + refresh tokens) | Stateless auth; 15min access + 30-day refresh |
| Password Hashing | **bcrypt** | Industry standard; salt + hash |
| Email Service | **Resend** or **SendGrid** | Transactional emails (password reset, weekly summary, alerts) |
| File Storage | **AWS S3** (or MinIO for self-hosted) | Receipt image storage with signed URLs |
| Background Jobs | **Bull** (Redis-backed) | Weekly summaries, email notifications |

## Database

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Primary DB | **PostgreSQL** | Relational integrity; excellent JSON support; rich indexing for date-range queries |
| ORM | **Prisma** | Type-safe queries; auto-generated TypeScript types; migrations |
| Caching | **Redis** | Session store; rate limiting; Bull job queue |
| Search | Built-in PostgreSQL **full-text search** | Sufficient for expense notes/categories search |

## DevOps & Infrastructure

| Component | Technology |
|-----------|-----------|
| Containerization | Docker + Docker Compose |
| Cloud | AWS (ECS Fargate or EC2) / Railway / Render |
| CI/CD | GitHub Actions |
| Monitoring | Sentry (error tracking) + Grafana/Prometheus |
| CDN | CloudFront (for receipt images) |

## Mobile-Specific

| Component | Technology |
|-----------|-----------|
| Secure Storage | expo-secure-store (JWT tokens) |
| Biometrics | expo-local-authentication (Face ID / Fingerprint) |
| Image Handling | expo-image (performant image loading/caching) |

## Development Tools

| Tool | Purpose |
|------|---------|
| ESLint + Prettier | Code quality and formatting |
| Jest + React Native Testing Library | Unit and component testing |
| Detox | E2E mobile testing |
| Husky + lint-staged | Pre-commit hooks |
| Storybook | Component development and documentation |
