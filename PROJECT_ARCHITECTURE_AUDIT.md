# ResourceX — Project Architecture Audit

> **Audit Date:** 2026-05-25  
> **Auditor:** Senior Engineering Review  
> **Version:** 2.0 (Full Rewrite — supersedes v1.0)

---

## 1. Executive Summary

ResourceX has completed its first major consolidation refactor: four separate role-specific frontends have been merged into a single unified dashboard. The backend has a well-structured service/controller/repository layering with proper DTO patterns and centralized exception handling. The design system is clean and dark-mode-ready.

However, the project has **critical routing bugs that silently break admin login**, **dead code that should have been removed**, **security vulnerabilities from credential exposure**, and **a missing REST controller** that leaves an entire feature non-functional.

This audit covers:
- **8 Critical Issues** (break functionality or pose security risk)
- **12 High-Priority Issues** (production blockers)
- **9 Medium-Priority Issues** (quality concerns)
- **Reusability analysis** across frontend components
- **Scalability concerns** for production workloads
- **Phased refactor recommendations** ordered by risk and dependency

---

## 2. Architecture Overview

### 2.1 Current Architecture

```
┌─────────────────────────────────────────────┐
│                  FRONTEND                    │
│  Next.js 14 App Router (TypeScript + Tailwind)│
│                                             │
│  app/page.tsx (Landing)                     │
│  app/auth/* (Login, Register, OTP, Reset)   │
│  app/(dashboard)/* (Shared for all roles)   │
│  app/terms/* (Terms & Conditions)           │
│                                             │
│  Shared: AuthContext, ThemeContext          │
│  API Layer: Single Axios client (api.ts)    │
│  Auth Layer: auth.ts utility + AuthGuard    │
│  AppShell: Collapsible sidebar + header     │
└─────────────────────────────────────────────┘
                     │ HTTP/HTTPS
                     │ Bearer JWT
                     ▼
┌─────────────────────────────────────────────┐
│                  BACKEND                     │
│  Spring Boot 3 (Java 21)                    │
│                                             │
│  Auth: JWT (roles + userId embedded)        │
│  Security: Spring Security + @PreAuthorize  │
│  Controllers: 11 REST controllers           │
│  Services: 13 service interfaces + impls    │
│  Repositories: 17 JPA repositories         │
│  DTOs: Typed request/response models       │
│  Exception: GlobalExceptionHandler          │
└─────────────────────────────────────────────┘
                     │ JPA/JDBC
                     ▼
┌─────────────────────────────────────────────┐
│                  DATABASE                    │
│  MySQL (InnoDB)                             │
│  16 tables, proper FK constraints           │
│  Indexes on lookup columns                  │
│  Schema: universities, users, roles,        │
│  student_profiles, pending_users, items,    │
│  bookings, payments, reviews, reports,      │
│  disputes, penalties, trust_events,         │
│  audit_logs, notifications,                 │
│  conversations, messages                    │
└─────────────────────────────────────────────┘
```

### 2.2 Role Architecture (Current State)

| Backend Role | Frontend Alias | Access Level |
|-------------|---------------|-------------|
| `ROLE_USER` | `"student"` | Own data only |
| `ROLE_MODERATOR` | `"moderator"` | Moderation tools |
| `ROLE_ADMIN` | `"admin"` | Platform management |
| `ROLE_SUPER_ADMIN` | `"super_admin"` | Full unrestricted access |

**Assessment:** The role hierarchy is correctly implemented in the backend with `@PreAuthorize`. The frontend role aliasing (`student` → `ROLE_USER`) is semantically inconsistent but functionally correct.

---

## 3. Critical Issues

### 3.1 Admin/Moderator Redirected to Non-Existent Route

**Severity:** 🔴 CRITICAL  
**Impact:** Any user with `ROLE_ADMIN`, `ROLE_MODERATOR`, or `ROLE_SUPER_ADMIN` is redirected to `/home` after login — a route that does not exist in the current `(dashboard)` group.

**Root Cause:**
```typescript
// frontend/web/context/AuthContext.tsx
function getHomeRoute(roles: UserRole[]) {
  return roles.some((role) =>
    ["ROLE_ADMIN", "ROLE_SUPER_ADMIN", "ROLE_MODERATOR"].includes(role),
  )
    ? "/home"      // ← This route does not exist
    : "/dashboard";
}
```

**Also affected:** `AuthGuard.tsx:27` — `router.replace(role === "student" ? "/home" : "/dashboard")` redirects non-student access violations to `/home`.

**Fix:** Change both references to `/dashboard`. The dashboard page already renders role-appropriate content via `AdminDashboard.tsx` vs `StudentDashboard.tsx`.

---

### 3.2 Middleware Protects Stale Routes, Misses Current Ones

**Severity:** 🔴 CRITICAL  
**Files:** `frontend/web/middleware.ts`

The middleware matcher list was never updated after the consolidation refactor. It still references routes from the old admin/student split (`/disputesAdmin`, `/adminProfile`, `/home`, `/announcements`) while missing routes that now exist (`/staff-management`, `/categories`, `/trust-scores`).

**Security consequence:** Routes like `/staff-management` and `/trust-scores` are NOT matched by the middleware token check. A user without a token who knows the URL could potentially access these routes if the client-side `AuthGuard` fails to load (e.g., JavaScript error).

**Fix:** Replace middleware path lists with the actual current route set from `(dashboard)/layout.tsx`.

---

### 3.3 Plaintext Credentials in Source Code

**Severity:** 🔴 CRITICAL  
**File:** `backend/src/main/resources/application.properties`

```properties
spring.datasource.password=[REDACTED_DB_PASSWORD]
spring.mail.password=[REDACTED_GMAIL_APP_PASSWORD]
jwt.secret=QresourceXv7rV8vNQ6r6GJv2qYxkJm9p...
```

All three secrets are committed in plaintext. If this repository is ever shared or made public, these credentials are immediately compromised.

**Fix:** Use environment variable substitution:
```properties
spring.datasource.password=${DB_PASSWORD}
spring.mail.password=${MAIL_APP_PASSWORD}
jwt.secret=${JWT_SECRET}
```

---

### 3.4 SuperAdminController Does Not Exist

**Severity:** 🔴 CRITICAL (Feature completely non-functional)  
**Files:** `SuperAdminService.java`, `SuperAdminServiceImpl.java` — complete, well-written service layer.  
**Missing:** `SuperAdminController.java`

The entire staff management feature (create admin, create moderator, promote, demote, delete privileged users, list staff) has a fully implemented service layer but no REST endpoint to reach it. The `staff-management` frontend page cannot function.

---

### 3.5 Base64 Images Stored in MySQL

**Severity:** 🔴 CRITICAL (Data architecture problem)  
**File:** `pending_users.id_card_data_url LONGTEXT`

Student registration uploads an ID card image which is converted to a base64 data URL and stored in a `LONGTEXT` MySQL column. A 2MB image → ~2.7MB of base64 text in a single database row.

**Consequences:**
- Each `SELECT * FROM pending_users` transfers megabytes of image data
- InnoDB row overflow if multiple images per row
- Database backup size bloats dramatically
- Cannot serve images via CDN
- Cannot apply image optimization

---

### 3.6 Dual JWT Token Storage

**Severity:** 🔴 CRITICAL (Security)  
**File:** `frontend/web/lib/auth.ts:storeSession()`

```typescript
localStorage.setItem(AUTH_TOKEN_KEY, token);       // XSS accessible
document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; max-age=86400; SameSite=Lax`; // Also XSS accessible (not HttpOnly)
```

The token is written to both `localStorage` AND a non-HttpOnly cookie. This does not improve security — it doubles the attack surface for XSS without providing the benefits of HttpOnly cookies.

---

### 3.7 N+1 Query in getAllPrivilegedUsers()

**Severity:** 🔴 CRITICAL (Performance)  
**File:** `backend/.../service/impl/SuperAdminServiceImpl.java:130`

```java
return userRepository.findAll().stream()  // Query 1: all users
  .filter(u -> {
    List<String> roleNames = userRoleRepository.findAllByUser(u)  // Query N: per user
      .stream().map(ur -> ur.getRole().getName()).toList();
    return roleNames.contains(ROLE_ADMIN) || ...;
  })
```

With 1,000 users → 1,001 database queries. This will time out in production.

---

### 3.8 OTP Endpoints Fully Public Without Rate Limiting

**Severity:** 🔴 CRITICAL (Security)  
**File:** `SecurityConfig.java:59`

```java
.requestMatchers("/api/otp/**").permitAll()
```

Any actor can send unlimited OTP requests for any email address, causing email spam and potentially triggering email service rate limits/bans.

---

## 4. High-Priority Issues

### 4.1 Dead Code — Frontend

| File | Size | Issue |
|------|------|-------|
| `frontend/web/test.css` | 58KB | Orphan — not imported anywhere |
| `frontend/Arif/index.html` | Unknown | Abandoned prototype |
| `frontend/web/lib/mocks/dummyData.ts` | — | Mock data in production source |
| `frontend/web/lib/approvalRequests.ts` | — | No known consumers |
| `frontend/web/hooks/useChat.ts` | — | Duplicate of `inbox/hooks/useChat.ts` |
| `frontend/web/lib/services/chatService.ts` | — | Duplicate of `inbox/services/chatService.ts` |

### 4.2 Dead Code — Backend

| File | Issue |
|------|-------|
| `Staff.java` + `StaffRepository.java` | Entity for an unused table — nothing authenticates as staff |
| `StudentVerification.java` + repository | Entity references a table that doesn't exist in `schema.sql` |

### 4.3 Console Debug Logging in Production

**Files:** `api.ts`, `auth.ts`  
`console.debug()` calls expose internal auth state (token present/absent, roles, API calls) to the browser DevTools in production. Replace with environment-gated logger.

### 4.4 Register Page Bypasses Design System

**File:** `app/auth/register/page.tsx`  
Uses raw Tailwind `dark:` variants (`dark:border-white/10`, `dark:bg-white/5`) instead of the CSS variable tokens used by the rest of the app. This breaks dark mode consistency.

### 4.5 `navItems: any[]` in AppShell

**File:** `components/layout/AppShell.tsx:23`  
Loses type safety on the entire navigation system. Should use the `NavItem` type already defined in `(dashboard)/layout.tsx`.

### 4.6 Login Page Missing Terms Notice

The register page correctly requires a Terms & Conditions checkbox. The login page has no mention of terms. At minimum, a link to `/terms` should be visible on the login page.

### 4.7 No Pagination on List Endpoints

`getAllBookings()`, `getAllUsers()`, `getAllPrivilegedUsers()`, and others return unbounded `List<T>`. As data grows, these will exhaust memory and timeout.

### 4.8 No Soft Delete Strategy

Hard deletes are used throughout. Booking/item/user data deleted by a bug or accidental action cannot be recovered.

### 4.9 Categories Not in Database

The frontend has `/categories` as a route with full management UI, but no `categories` table exists in `schema.sql`. The `items.category` field is a free-text `VARCHAR(50)`.

### 4.10 History Route in Middleware But Not in Dashboard

`/history` is listed in the middleware matcher but no `history` directory exists under `(dashboard)`.

### 4.11 Analytics Chart Colors Not Design System Aware

`DonutChart` in analytics page hardcodes hex values (`"#3b82f6"`, `"#12a37a"`) that don't follow CSS variable tokens and won't change with dark mode.

### 4.12 Repeated Role Switch Pattern (4+ Pages)

Every unified page duplicates this pattern:
```tsx
const { roles, loading } = useAuth();
const isPrivileged = hasRole(roles, "admin") || hasRole(roles, "moderator") || hasRole(roles, "super_admin");
return isPrivileged ? <AdminVersion /> : <StudentVersion />;
```
Should be extracted to a `useRoleSwitch()` hook.

---

## 5. Medium-Priority Issues

### 5.1 Missing Database Indexes

```sql
-- These compound/single indexes are missing:
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_created_at ON items(created_at);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_date ON bookings(start_date);
CREATE INDEX idx_disputes_status ON disputes(status);
```

### 5.2 University Datalist Hardcoded

**File:** `register/page.tsx`  
University suggestions are hardcoded in the HTML `<datalist>`. Should be loaded from `/api/universities` to stay in sync with the `universities` table.

### 5.3 Phone Number Hardcoded to Bangladesh

**File:** `register/page.tsx`  
The `+880` prefix is hardcoded in the UI and phone validation enforces Bangladeshi format. This should be configurable if the platform expands.

### 5.4 Missing `@ResponseStatus` on POST Endpoints

`createBooking`, `register`, and similar creation endpoints return `200 OK` where they should return `201 Created`.

### 5.5 `JpaRepository.count()` in DashboardStats

```java
.totalUsers(userRepository.count())
```
This counts ALL users including banned/suspended. Should filter by `status = 'ACTIVE'`.

### 5.6 `AuditLog.actorType` Always `SYSTEM`

In `AdminServiceImpl`, all audit logs set `actorType = SYSTEM` even when a human admin performs the action. Should record the actual admin's userId.

### 5.7 Missing Password Reset Token Table in Schema

`PasswordResetToken` entity exists in code and is used, but `password_reset_tokens` is not in `schema.sql`. The table is created by Hibernate `ddl-auto=update` but not documented.

### 5.8 `application.properties` — `spring.jpa.show-sql=true`

SQL logging is enabled in what appears to be a production config file. This should be disabled in production for performance.

### 5.9 Email Sender Still Uses Personal-Style Address

`spring.mail.username=students.reform2.0@gmail.com` — using a Gmail account for transactional email is fragile (subject to Gmail sending limits, account suspension). Should use a transactional email service (SendGrid, Mailgun, SES).

---

## 6. API Contract Analysis

### 6.1 Auth Contract (Correct)

| Endpoint | Method | Auth | Notes |
|----------|--------|------|-------|
| `/api/auth/login` | POST | Public | Returns `{token, user, roles, message}` |
| `/api/auth/register` | POST | Public | Returns `{message, token: null}` |
| `/api/auth/me` | GET | Bearer | Returns `{user, roles}` |
| `/api/auth/forgot-password` | POST | Public | Sends reset email |
| `/api/auth/reset-password` | POST | Public | Resets password with token |

**Frontend alignment:** `AuthContext` calls `/auth/login` and `/auth/me` — these match the controller.  
**Previously stale:** `/api/auth/current-user` referenced in old audit — this has been removed.

### 6.2 Missing API Endpoints (Frontend Pages with No Backend)

| Frontend Page | Expected Endpoint | Backend Status |
|---------------|------------------|----------------|
| `/staff-management` | `/api/superadmin/**` | ❌ Controller missing |
| `/categories` | `/api/categories/**` | ❌ Not implemented |
| `/trust-scores` | `/api/trust/**` | ⚠️ Service exists, check controller |
| `/penalties` (admin) | `/api/penalties/**` (admin view) | ⚠️ Check |

### 6.3 Inconsistent Response Wrapping

Some endpoints return bare objects (`BookingResponse`), others return `ResponseEntity<Void>`. The `AuthController` returns `Map.of("message", ...)` for password reset — inconsistent with `ApiResponse<T>` used in exception handler. Standardize all endpoints to wrap in `ApiResponse<T>`.

---

## 7. Security Scoring

| Threat | Backend Protection | Frontend Protection | Overall |
|--------|-------------------|--------------------|---------| 
| Unauthorized access | ✅ JWT + @PreAuthorize | ⚠️ AuthGuard (stale middleware) | 7/10 |
| RBAC enforcement | ✅ Method-level | ✅ Role-filtered nav | 8/10 |
| Ownership enforcement | ✅ resolveCurrentUser() pattern | N/A | 8/10 |
| XSS | ✅ React escapes JSX | ⚠️ Token in localStorage | 6/10 |
| CSRF | ✅ Disabled (stateless JWT) | N/A | 9/10 |
| SQL injection | ✅ JPA parameterized | N/A | 10/10 |
| Brute force | ❌ No rate limiting | ❌ No captcha | 2/10 |
| Credential exposure | ❌ Plaintext in config | ✅ Env var for API URL | 3/10 |
| Sensitive data in DB | ❌ Base64 images | N/A | 2/10 |
| **Overall** | | | **6.1/10** |

---

## 8. Frontend Component Reusability Analysis

### 8.1 Patterns That Should Be Shared Components

| Pattern | Current | Should Be |
|---------|---------|-----------|
| Loading spinner | Inline in 10+ pages | `<PageLoader />` |
| Error message | Inline inconsistent | `<PageError />` |
| Empty state | Inline inconsistent | `<PageEmpty />` |
| Status badge | Inline color logic | `<StatusBadge status={...} />` |
| Role switch | Repeated in 4 pages | `useRoleSwitch()` hook |
| Data table | Full reimplementation in 3 pages | `<DataTable columns={...} data={...} />` |
| Confirm dialog | Inline in multiple admin actions | `<ConfirmModal />` |

### 8.2 Correctly Shared (Keep As Is)

- `AuthContext` — single source of truth for auth state ✅
- `api.ts` — single Axios client with interceptors ✅
- `auth.ts` — single auth utility (token, session, role checks) ✅
- `AppShell` — single layout component ✅
- `AuthGuard` — single route guard component ✅
- `ThemeContext` — single theme context ✅
- `globals.css` — CSS variable design tokens ✅

### 8.3 Pattern: Unified Pages with Role Rendering

The pattern of `page.tsx` + `AdminVersion.tsx` + `StudentVersion.tsx` is good. Keep this pattern. The only improvement is extracting the common boilerplate into `useRoleSwitch()`.

---

## 9. Scalability Assessment

### 9.1 Backend Scalability

| Concern | Current State | Risk at Scale |
|---------|--------------|---------------|
| Un-paginated lists | All list endpoints | 🔴 High — OOM at 10K+ records |
| N+1 queries | `getAllPrivilegedUsers` | 🔴 High |
| No caching | Every request hits DB | 🟡 Medium |
| Image storage in DB | `LONGTEXT` base64 | 🔴 High — DB size explosion |
| Email sending synchronous | Blocks request thread | 🟡 Medium |
| No background jobs | Trust score recalc on-demand | 🟡 Medium |

### 9.2 Frontend Scalability

| Concern | Current State | Risk at Scale |
|---------|--------------|---------------|
| No virtual scrolling | `users/page.tsx` loads all | 🟡 Medium |
| No pagination UI | Admin tables load all items | 🔴 High |
| Analytics: no date range | Fixed window | 🟡 Medium |
| No memoization on heavy components | AdminDashboard re-renders | 🟢 Low |

---

## 10. Maintainability Scoring

| Category | Score | Notes |
|----------|-------|-------|
| Code organization | 7/10 | Good layer separation; some dead code |
| Naming consistency | 6/10 | `student` vs `user` alias; mixed casing historically |
| TypeScript coverage | 7/10 | Some `any` types; types dir is good |
| Error handling | 7/10 | Backend excellent; frontend inconsistent |
| Documentation | 4/10 | Minimal inline docs; good project-level docs |
| Test coverage | 1/10 | Only boilerplate test exists |
| Dead code | 4/10 | Multiple dead files need cleanup |
| Consistency | 6/10 | Design system good; some bypasses |
| **Overall** | **5.3/10** | |

---

## 11. Production Readiness Scoring

| Category | Score | Notes |
|----------|-------|-------|
| Auth & Security | 5/10 | JWT good; no rate limiting; plaintext creds |
| Data Architecture | 4/10 | Base64 images critical; pagination missing |
| Error Handling | 7/10 | Backend GlobalExceptionHandler excellent |
| Logging | 3/10 | Debug logs in production; no structured logging |
| Configuration | 3/10 | Plaintext secrets; show-sql=true |
| Performance | 4/10 | N+1 queries; no caching; no pagination |
| Monitoring | 1/10 | None |
| Testing | 1/10 | None beyond boilerplate |
| Deployment | 3/10 | No CI/CD; no Docker; no env separation |
| **Overall** | **3.4/10** | Requires work before production |

---

## 12. Recommended Architecture Improvements

### 12.1 Immediate (Phase 0–1)

1. Fix `getHomeRoute()` → always return `/dashboard`
2. Fix `AuthGuard` redirect from `/home` → `/dashboard`
3. Sync middleware matcher to current route list
4. Move credentials to environment variables
5. Fix N+1 query in `getAllPrivilegedUsers()`
6. Remove dual token storage (pick one)
7. Create `SuperAdminController`

### 12.2 Short Term (Phase 2–4)

1. Delete all dead code files
2. Remove `Staff` and `StudentVerification` entities
3. Add `PageLoader`, `PageError`, `PageEmpty`, `StatusBadge` shared components
4. Extract `useRoleSwitch()` hook
5. Add `DataTable` shared component
6. Add `categories` table and controller

### 12.3 Medium Term (Phase 5–6)

1. Add pagination to all list endpoints
2. Replace base64 images with file upload system
3. Add OTP rate limiting
4. Add missing DB indexes
5. Disable `show-sql` in production profile
6. Add soft delete to core entities

### 12.4 Long Term

1. Migrate email to transactional service (SendGrid/Mailgun)
2. Add Redis caching for analytics and session
3. Implement WebSocket messaging
4. Add structured logging (SLF4J + ELK or Datadog)
5. Add comprehensive test suite
6. Set up CI/CD pipeline

---

## 13. Folder Structure Assessment

### 13.1 Backend — Current Structure ✅ Acceptable

The backend is organized by technical layer (`controller/`, `service/`, `repository/`, `entity/`, `dto/`, `mapper/`) rather than by domain module. This is acceptable for the current scale. For a larger team or microservices migration, domain-driven structure would be preferred.

**Action required:** Remove `Staff.java`, `StaffRepository.java`, `StudentVerification.java`, `StudentVerificationRepository.java`.

### 13.2 Frontend — Current Structure ✅ Good With Gaps

The `(dashboard)` route group is a solid architecture. The `components/ui/` directory exists but is empty — this is where shared UI components should live.

**Key gap:** `components/ui/` is empty. All shared UI components should live here.

---

## 14. Refactor Priority Matrix

```
                    HIGH IMPACT
                         │
          Phase 0        │      Phase 3
    (Auth routing fix)   │  (SuperAdmin API)
                         │
    ─────────────────────┼─────────────────────
    LOW EFFORT           │              HIGH EFFORT
                         │
          Phase 1        │      Phase 6
    (Security cleanup)   │  (File upload arch)
                         │
                    LOW IMPACT
```

---

## 15. Conclusion

ResourceX is an architecturally sound project that made the right call consolidating four separate frontend systems into one. The backend service layer is well-structured and the database schema is clean and properly indexed.

The primary blockers before this can be considered a production-grade system are:

1. **Fix the broken admin login redirect** (Phase 0 — 30 minutes of work)
2. **Secure credentials using environment variables** (Phase 1 — 1 hour)
3. **Create the missing SuperAdminController** (Phase 3 — 2-3 hours)
4. **Replace base64 image storage** (Phase 6 — most complex, multiple days)

Everything else is important but not a blocker for basic functional correctness.

The engineering roadmap at `ENGINEERING_ROADMAP.md` provides the complete phased implementation plan with dependency ordering, effort estimates, and risk analysis.

---

*End of Architecture Audit v2.0*
