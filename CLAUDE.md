# ResourceX — Developer Guide for Claude Code

## Project Overview

ResourceX is a cross-campus resource sharing platform where students can list items for short-term rental and borrow from each other. It is composed of:

- **Backend** — Spring Boot 3 REST API (`backend/`)
- **Frontend** — Next.js 14 App Router SPA (`frontend/web/`)
- **Database** — MySQL 8+ managed by Flyway migrations

---

## Quick Start

### Prerequisites
- Java 21, Maven 3.9+
- Node.js 20+, npm
- MySQL 8+

### Environment Variables
Copy `.env.example` to `.env` at the repository root and fill in all `REQUIRED` fields before starting anything. Both the backend and frontend load from this file.

```sh
cp .env.example .env
# Edit .env — fill in DB_PASSWORD, JWT_SECRET, MAIL_USERNAME, MAIL_APP_PASSWORD
```

### Backend
```sh
cd backend
mvn spring-boot:run
# API is available at http://localhost:8082
# Swagger UI at http://localhost:8082/swagger-ui/index.html
```

### Frontend
```sh
cd frontend/web
npm install
npm run dev
# App is available at http://localhost:3000
```

---

## Architecture

### Backend (`backend/src/main/java/com/resourcex/resourcex/`)

```
controller/    HTTP endpoints
service/       Interfaces
service/impl/  Business logic implementations
repository/    Spring Data JPA repositories
entity/        JPA entities (Booking, Item, User, Dispute, Review, …)
dto/           Request/Response DTOs
mapper/        Entity ↔ DTO converters (static methods)
security/      JWT auth, cookie extraction, STOMP channel interceptor
config/        Security, CORS, WebSocket, rate limiting config
```

Key conventions:
- All controllers have `@RequestMapping("/api/…")` — every endpoint is under `/api`.
- JWT is stored in an **httpOnly cookie** named `resourcex_token`. The `JwtAuthenticationFilter` checks both `Authorization: Bearer` header and this cookie.
- WebSocket auth: `JwtHandshakeInterceptor` extracts the cookie during handshake; `JwtChannelInterceptor` validates it on STOMP frames.
- Use `@Version Long version` on entities that need optimistic locking (currently Booking and Item).
- Schema is managed by **Flyway** (`db/migration/V*.sql`). Never use `ddl-auto=update` — it is set to `validate`.

### Frontend (`frontend/web/`)

```
app/
  (main)/        Public landing page and terms
  (dashboard)/   All authenticated app pages
    layout.tsx   Dashboard shell with sidebar + top nav
  auth/          Login, register, OTP verify, forgot/reset password
  layout.tsx     Root layout — wraps ThemeProvider, AuthProvider, ToastProvider
components/
  ui/            Reusable primitives (ConfirmModal, PageEmpty, Toast, Pagination, …)
  cards/         ItemCard, BookingCard, StatCard, ActionCard
  layout/        AppShell, Footer
context/         AuthContext, ThemeContext, ToastContext
lib/
  api.ts         Axios instance (withCredentials: true, 401 redirects to /auth/login)
  auth.ts        hasRole() utility — JWT is a cookie, no localStorage
  dateUtils.ts   formatShortDate / formatDateRange / formatRelativeTime
  validation.ts  validateEmail, validatePhone, validatePasswordChecks
hooks/
  useImageUpload.ts  Reusable multi-file upload with preview + delete
  useRoleSwitch.ts   Returns { isPrivileged, loading } based on auth role
__tests__/lib/   Unit tests (Jest)
```

Key conventions:
- All API calls use `@/lib/api` (Axios with `baseURL = NEXT_PUBLIC_API_BASE_URL + "/api"`).
- The browser sends the httpOnly cookie automatically via `withCredentials: true` — never add `Authorization` headers manually.
- Toast notifications: import `useToast` from `@/context/ToastContext`, call `toast("message")` or `toast("message", "error")`.
- Destructive actions must use `ConfirmModal` from `@/components/ui/ConfirmModal`.
- Empty states must use `PageEmpty` from `@/components/ui/PageEmpty`.
- Dates must use `formatShortDate` / `formatDateRange` from `@/lib/dateUtils` — never `new Date().toLocaleDateString()` inline.

---

## Auth Flow

1. User logs in via `POST /api/auth/login` — backend sets `resourcex_token` httpOnly cookie.
2. On every page load, `AuthContext` calls `GET /api/auth/me` to hydrate user state.
3. On logout, `AuthContext` calls `POST /api/auth/logout` — backend expires the cookie.
4. 401 responses in `lib/api.ts` auto-redirect to `/auth/login` after calling `/api/auth/logout`.

---

## Testing

### Frontend (Jest)
```sh
cd frontend/web
npm test           # run all tests
npm run test:watch # watch mode
npm run test:coverage
```

Tests live in `__tests__/`. Currently covers `lib/auth.ts` and `lib/dateUtils.ts`.

### Backend (JUnit 5 + Mockito)
```sh
cd backend
mvn test
```

Unit tests live in `src/test/java/…/service/`. Integration test (`ResourceXApplicationTests`) requires `@ActiveProfiles("test")` — add an `application-test.properties` with an in-memory H2 or test MySQL database if needed.

---

## Common Tasks

### Add a new page
1. Create `app/(dashboard)/your-page/page.tsx`.
2. Add a link in `components/layout/AppShell.tsx` (sidebar nav).
3. Guard with role check if admin-only (`useRoleSwitch` hook or `AuthGuard`).

### Add a new backend endpoint
1. Create DTO in `dto/request/` and `dto/response/`.
2. Add method to the service interface and implement in `service/impl/`.
3. Add `@RestController` with `@RequestMapping("/api/…")`.
4. Update Flyway migration if schema changes (`V{next}__description.sql`).

### Add a database column
1. Write a new migration `Vn__add_column_name.sql` in `backend/src/main/resources/db/migration/`.
2. Update the JPA entity.
3. Update the mapper and DTOs.
4. Never modify existing migration files — always add a new version.
