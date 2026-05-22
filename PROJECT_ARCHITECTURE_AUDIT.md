# Project Architecture Audit

## 1. Executive summary

ResourceX currently has a working skeleton, but the architecture is inconsistent and insecure across authentication, authorization, database design, frontend routing, and API contracts.

Critical findings:

- duplicate admin auth flow and frontend-only admin gating
- backend role handling split between `users`, `staff`, and `roles`
- backend/frontend contract mismatches for auth endpoints and token fields
- redundant and conflicting onboarding schema (`users`, `pending_users`, `student_verifications`)
- major security issues from `fakeAdminAccess`, local storage JWT persistence, and weak middleware guards

This audit documents exact issues found in the current branch, explains the risks, and defines a refactor strategy that makes auth and RBAC consistent, removes dead schema, and aligns frontend and backend behavior.

## 2. Overall architecture evaluation

The architecture is partially built but not coherent.

- Backend: Spring Boot with JWT-based security and method-level roles, but auth logic only supports `users` even though the schema has a separate `staff` table.
- Frontend: Next.js app with two auth flows, one for student login and one for admin login, but the admin route is protected by a fake bypass and cookie-parsed roles.
- Database: partially normalized, but contains duplicate lifecycle states and unused tables.
- API: structural contract mismatches between backend routes and frontend calls.

Overall, ResourceX is currently more of a proof-of-concept than a production-ready full-stack architecture.

## 3. Critical issues

### 3.1 Duplicate admin authentication flow

Evidence:

- `frontend/web/app/(admin)/AdminLogin/page.tsx`
- `frontend/web/app/auth/login/page.tsx`
- `frontend/web/app/(admin)/layout.tsx`
- `frontend/web/middleware.ts`
- `frontend/web/context/AuthContext.tsx`
- `backend/src/main/java/com/resourcex/resourcex/controller/AuthController.java`

Issue:

- the project exposes two login flows for the same backend endpoint.
- admin login is implemented solely in the frontend by inspecting the auth response and storing role state locally.
- there is no dedicated backend admin login flow.

Why it is wrong:

- separation of frontend and backend auth logic creates a security gap.
- it leads to duplicated route logic, duplicate session storage, and inconsistent routing.

Risk:

- unauthorized admin access
- inconsistent experience when roles change
- hidden bugs when the auth contract changes

Fix:

- remove separate admin login page and replace with one shared `/auth/login`
- use backend to authenticate credentials and return role-aware JWT
- redirect users after login based on role
- centralize authorization in backend and use frontend only for navigation

### 3.2 `staff` table vs `users` auth mismatch

Evidence:

- `database/schema.sql` contains `staff` table
- `backend/src/main/java/com/resourcex/resourcex/security/CustomUserDetailsServiceImpl.java`
- `backend/src/main/java/com/resourcex/resourcex/service/impl/SuperAdminServiceImpl.java`

Issue:

- the database defines staff with `staff_id`, `email`, `role`, `password_hash`, but auth code never loads staff.
- `CustomUserDetailsServiceImpl` only searches `UserRepository`.
- `SuperAdminServiceImpl` promotes admin roles on `User`, not `Staff`.

Why it is wrong:

- the schema claims separate staff accounts, but the code ignores them.
- this is a broken architectural contract between DB and backend.

Risk:

- dangerous assumptions by future developers
- misleading audit logs and foreign key references
- inability to correctly implement staff-level RBAC

Fix:

- decide between one of these two models:
  - single account model: remove `staff`, keep `roles` + `user_roles` for admin/moderator/superadmin
  - separate staff model: implement staff authentication and unify token handling across both account types

### 3.3 Auth endpoint / permissions mismatch

Evidence:

- `backend/src/main/java/com/resourcex/resourcex/security/SecurityConfig.java`
- `frontend/web/context/AuthContext.tsx`
- `backend/src/main/java/com/resourcex/resourcex/controller/AuthController.java`

Issue:

- security config permits `/api/auth/current-user`
- controller exposes `/api/auth/me`
- frontend refresh uses `/auth/me`

Why it is wrong:

- authorization rules and public endpoint allowances do not match actual routes.

Risk:

- refresh calls fail unexpectedly
- broken auth persistence
- inconsistent user experience

Fix:

- align backend permit list with actual endpoints
- choose a canonical auth endpoint path, preferably `/api/auth/me`
- remove dead permission route definitions

### 3.4 JWT missing embedded roles

Evidence:

- `backend/src/main/java/com/resourcex/resourcex/security/JwtService.java`
- `frontend/web/components/auth/AuthGuard.tsx`
- `frontend/web/app/(admin)/AdminLogin/page.tsx`

Issue:

- `JwtService.generateToken` stores only email in the subject.
- roles are not stored in JWT claims.
- frontend uses localStorage roles to enforce routing.

Why it is wrong:

- the token lacks the metadata needed to validate roles independently.
- frontend route guards are not backed by token semantics.

Risk:

- stale or tampered role state can allow incorrect routing
- backend may still be secure, but frontend unnecessarily depends on client state

Fix:

- add roles claim to JWT at generation time
- use JWT claims to build `UserDetails` and perform auth checks
- use token-backed role info instead of separate local storage values

### 3.5 Fake admin access bypass

Evidence:

- `frontend/web/app/(admin)/layout.tsx`
- `frontend/web/middleware.ts`

Issue:

- the admin layout has `fakeAdminAccess = true`.
- this bypasses the `AuthGuard` entirely for admin routes.

Why it is wrong:

- it effectively disables frontend auth enforcement.
- it indicates a development-only hack left in source.

Risk:

- any frontend user can load the admin shell without authentication.
- the admin experience is not representative of actual security.

Fix:

- remove the fake bypass immediately
- protect admin layout with `AuthGuard` or server-side session checks
- ensure UI access matches backend RBAC

## 4. Medium-priority issues

### 4.1 Redundant onboarding schema

Evidence:

- `database/schema.sql`
- `backend/src/main/java/com/resourcex/resourcex/service/impl/AuthServiceImpl.java`
- `backend/src/main/java/com/resourcex/resourcex/service/impl/AdminServiceImpl.java`

Issue:

- `users.status` contains `PENDING_VERIFICATION`, `PENDING_APPROVAL`, `REJECTED`, yet `pending_users` duplicates these states.
- `student_verifications` stores a review record after approval, which partially duplicates `pending_users` and `users`.

Why it is wrong:

- there are multiple overlapping representations of the same workflow.
- audit and approval logic must traverse several tables.

Risk:

- inconsistent user lifecycle states
- complicated approval/rejection edge cases

Fix:

- choose a single onboarding model:
  - if `pending_users` remains, use it only for unapproved registrations and keep `users` for active accounts
  - if not, collapse into `users` with status fields and store verification records separately
- keep `student_verifications` as a review history, not a duplicate state store

### 4.2 Unused `staff` table and role duplication

Evidence:

- `database/schema.sql`
- `backend/src/main/java/com/resourcex/resourcex/service/impl/SuperAdminServiceImpl.java`

Issue:

- the schema creates `staff` and `roles`, but `Staff` is not authenticated.
- roles in `staff.role` and `user_roles.role_id` are conceptually duplicated.

Why it is wrong:

- it produces an inconsistent RBAC model.

Risk:

- confusing admin developer workflows
- broken staff auditing and authorization assumptions

Fix:

- align schema with auth by removing unused tables or wiring them correctly

### 4.3 Naming and route inconsistency

Evidence:

- `frontend/web/app/(admin)/AdminLogin/page.tsx`
- `frontend/web/app/(admin)/layout.tsx`
- `frontend/web/middleware.ts`
- `frontend/web/app/auth/login/page.tsx`
- `frontend/web/app/(admin)/adminProfile/page.tsx`

Issue:

- mixed casing in routes: `/AdminLogin`, `/adminlogin`, `disputesAdmin`, `trust-scores`, `adminProfile`.
- inconsistent route naming between student and admin sections.

Why it is wrong:

- inconsistent route patterns are harder to maintain and fragile in middleware matching.

Fix:

- adopt lowercase kebab-case for routes
- rename pages to match route conventions
- use route constants for middleware matching

### 4.4 Duplicate client-side auth storage

Evidence:

- `frontend/web/lib/auth.ts`
- `frontend/web/app/(admin)/AdminLogin/page.tsx`
- `frontend/web/context/AuthContext.tsx`

Issue:

- the admin login page duplicates session persistence logic.
- token storage is repeated in localStorage and cookies.

Why it is wrong:

- duplicate code increases risk when session storage changes.
- storing JWT in both localStorage and cookies increases attack surface.

Fix:

- centralize session persistence in one utility
- avoid duplicate calls in pages
- prefer secure cookie storage if the backend can support it

## 5. Low-priority cleanup issues

### 5.1 Mock or temporary admin logic left in production

Evidence:

- `frontend/web/app/(admin)/layout.tsx`

Issue:

- a development bypass remains in source.

Fix:

- remove fake auth flag
- lock down admin UI until auth works

### 5.2 Unused auth response fields

Evidence:

- `frontend/web/app/(admin)/AdminLogin/page.tsx`
- `backend/src/main/java/com/resourcex/resourcex/dto/response/AuthResponse.java`

Issue:

- frontend expects `accessToken` / `refreshToken` and nested `user.role` fields.
- backend returns `token`, `user`, and `roles` only.

Fix:

- standardize the response contract
- remove stale frontend expectations

### 5.3 Redundant route guards

Evidence:

- `frontend/web/components/auth/AuthGuard.tsx`
- `frontend/web/middleware.ts`

Issue:

- both client-side guard and middleware are present but not consistently used.

Fix:

- define a single guard strategy per route type
- avoid overlapping auth control unless intentional

## 6. Database audit

### 6.1 Duplicate user lifecycle tables

Current design:

- `users` stores active accounts with status
- `pending_users` stores pre-approved registrations
- `student_verifications` stores verification review records

Problem:

- `pending_users` duplicates `users.status` semantics
- `student_verifications` duplicates state and is not clearly tied to a separate workflow

Recommendation:

- if onboarding staging is desired, keep `pending_users` for unapproved registrations only
- keep `users` for authenticated accounts
- store `student_verifications` as a history record linked to `users` only after approval

### 6.2 `staff` table mismatch

Current design:

- `staff` table exists with admin roles, but auth code ignores it.

Problem:

- DB schema claims a staff domain, but the code does not use it.

Recommendation:

- remove `staff` if unused or implement a staff auth flow that matches the schema
- if removed, update `audit_logs.created_by`, `bookings.approved_by`, `reports.reviewed_by`, `penalties.issued_by`, and `notifications.created_by` to use a consistent actor model

### 6.3 Polymorphic reference fields

Current design:

- `reports.entity_type`, `notifications.related_entity_type`, `audit_logs.entity_type`

Problem:

- no referential integrity for polymorphic relationships

Recommendation:

- normalize by splitting into typed notification/report tables or
- enforce object relationships with application-level constraints

### 6.4 Inconsistent university relation

Current design:

- `universities` table exists
- `users.university` is a VARCHAR string

Problem:

- string-based university references are inconsistent with normalized DB design

Recommendation:

- add `university_id` foreign key to `users`
- remove free-form `users.university` if the goal is relational integrity

### 6.5 Missing performance indexes

Observed gaps:

- no index on `bookings.approved_by`
- no index on `penalties.issued_by`
- no index on `trust_events.created_by`
- no compound index on `notifications(related_entity_type, related_entity_id)`

Recommendation:

- add indexes on these foreign keys
- add compound indexes for polymorphic lookup fields used in reporting

## 7. Backend audit

### 7.1 Security config problems

Evidence:

- `backend/src/main/java/com/resourcex/resourcex/security/SecurityConfig.java`

Problem:

- permit list contains stale route `/api/auth/current-user`
- `@EnableMethodSecurity` is enabled but route-level auth is still coarse-grained for many resources

Recommendation:

- keep public auth routes explicit
- tighten permissions on `/api/users/**`, `/api/bookings/**`, `/api/disputes/**`, and `/api/payments/**`
- add logging for unauthorized attempts

### 7.2 JWT payload and user resolution

Evidence:

- `backend/src/main/java/com/resourcex/resourcex/security/JwtService.java`
- `backend/src/main/java/com/resourcex/resourcex/service/impl/AuthServiceImpl.java`
- `backend/src/main/java/com/resourcex/resourcex/security/CustomUserDetailsServiceImpl.java`

Problem:

- JWT token does not include roles.
- `loadUserByUsername` uses the `users` table only.
- if a user has no roles, default `ROLE_USER` is assigned implicitly.

Recommendation:

- embed `roles` claim in JWT
- build `UserDetails` consistently from token claims and DB
- consider a custom `UserPrincipal` type for richer identity data

### 7.3 Redundant role logic

Evidence:

- `backend/src/main/java/com/resourcex/resourcex/service/impl/SuperAdminServiceImpl.java`
- `backend/src/main/java/com/resourcex/resourcex/service/impl/AuthServiceImpl.java`

Problem:

- role promotion and default role resolution are scattered across services.

Recommendation:

- centralize role assignment and lookup in a dedicated RBAC service
- remove scattered role string logic where possible

### 7.4 Controller + DTO mismatch

Evidence:

- `backend/src/main/java/com/resourcex/resourcex/controller/AuthController.java`
- `backend/src/main/java/com/resourcex/resourcex/dto/response/AuthResponse.java`
- `frontend/web/types/auth.ts`

Problem:

- backend response contract does not fully match frontend expectations
- backend returns `token`, while frontend admin page also expects `accessToken` and `refreshToken`

Recommendation:

- maintain a single documented auth contract
- update frontend types to match backend or vice versa

## 8. Frontend audit

### 8.1 Route structure inconsistency

Evidence:

- `frontend/web/app/(admin)/layout.tsx`
- `frontend/web/middleware.ts`
- `frontend/web/app/auth/login/page.tsx`

Problem:

- inconsistent route naming and legacy path matching
- admin routes use mixed case and nonstandard path elements

Recommendation:

- normalize to lowercase, kebab-case routes
- align folder names with route names
- use centralized route constants for auth/middleware

### 8.2 Auth state fragmentation

Evidence:

- `frontend/web/context/AuthContext.tsx`
- `frontend/web/components/auth/AuthGuard.tsx`
- `frontend/web/app/(admin)/AdminLogin/page.tsx`

Problem:

- auth logic is split between context and page-level code
- admin login bypasses shared auth context

Recommendation:

- unify auth flows into `AuthContext`
- use shared login and refresh logic for both student and admin

### 8.3 API integration duplication

Evidence:

- `frontend/web/lib/api.ts`
- `frontend/web/app/(admin)/AdminLogin/page.tsx`

Problem:

- separate axios clients and request logic exist
- auth retry / error handling is duplicated

Recommendation:

- use one API client for all app requests
- share auth interceptors and request metadata

### 8.4 Unstable naming and terminology

Evidence:

- `frontend/web/types/auth.ts`
- `frontend/web/lib/auth.ts`
- `frontend/web/app/(admin)/page.tsx`

Problem:

- role strings mix `ROLE_USER`, `ROLE_ADMIN`, and free-form string types
- UI uses `student` and `user` interchangeably

Recommendation:

- standardize on one domain vocabulary: `user` for general accounts, `admin` for privileged accounts, `moderator` for staff-like admin roles
- ensure frontend role checks use normalized constants

## 9. Authentication audit

### 9.1 Duplicate auth systems

- student login and admin login are implemented separately in the UI
- backend uses a single auth controller, but frontend treats them as different flows

Ideal architecture:

- one login page
- backend authenticates and issues role-aware JWT
- frontend redirects by role

### 9.2 Insecure session persistence

- tokens are stored in localStorage and cookies
- no HttpOnly secure cookie mechanism is used

Recommendation:

- prefer secure cookies if the server can manage session or JWT storage
- if localStorage is used, avoid dual storage in cookies unless strictly needed

## 10. Authorization audit

### 10.1 Role-based access control

Current state:

- backend protects `/api/admin/**`, `/api/superadmin/**`, and many resources by roles
- admin route protection is also attempted in frontend middleware

Problems:

- frontend middleware role parsing is not authoritative
- admin access is bypassed by false frontend state
- backend role definitions are split between `RoleConstants` and schema `staff.role`

Recommendation:

- enforce RBAC in backend only
- treat frontend route guards as UX convenience, not security
- centralize permission checks in an RBAC service

### 10.2 Missing super admin consistency

- `SecurityConfig` allows `/api/superadmin/**` for `SUPER_ADMIN`
- no explicit superadmin login path exists

Recommendation:

- clearly define superadmin responsibilities and routes
- ensure superadmin role is set in the same auth model as other roles

## 11. API consistency audit

Observations:

- backend uses `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- frontend uses `api.post('/auth/login')` and `api.get('/auth/me')`
- security config uses `/api/auth/current-user`

Mismatch:

- `/api/auth/current-user` is stale
- admin frontend expects `accessToken` and `refreshToken`
- token format is inconsistent across components

Fix:

- define a consistent auth API contract
- align backend and frontend naming exactly
- remove obsolete response fields and endpoints

## 12. Naming consistency audit

Bad naming patterns found:

- `AdminLogin` vs `/auth/login`
- `disputesAdmin` vs `disputes`
- `trust-scores` vs `trust_scores` vs `trustScores`
- `users` vs `student`
- `role` vs `roles` vs `ROLE_ADMIN`

Recommendation:

- adopt a single naming standard for routes and API paths
- prefer lowercase, kebab-case for frontend URLs
- prefer `ROLE_*` values in backend role strings consistently

## 13. Security audit

### 13.1 Hardcoded insecure admin bypass

- `frontend/web/app/(admin)/layout.tsx` uses `fakeAdminAccess = true`
- remove immediately from production code

### 13.2 Client-side-only role enforcement

- `frontend/web/middleware.ts` trusts cookie-parsed roles
- cookies are client-controlled and not JWT-validated

### 13.3 Missing JWT claim entropy

- `JwtService` uses only email subject
- no role or session metadata is embedded

### 13.4 Token storage risk

- token stored in localStorage and cookie with `SameSite=Lax`
- no secure or HttpOnly flags

Fix:

- centralize token issuance and claims
- use secure cookie policy or a short-lived JWT with refresh
- never trust frontend-only role metadata for security decisions

## 14. Scalability audit

### 14.1 Service layer cleanliness

- auth and RBAC logic are spread across services
- role resolution, promotion, and authorization are not centralized

Recommendation:

- create a dedicated auth/RBAC module in backend
- separate user management, booking, dispute, and notification services into clear domains

### 14.2 Frontend modularity

- auth logic is fragmented across `AuthContext`, `AuthGuard`, and individual pages
- admin UI is partially decoupled from the shared auth experience

Recommendation:

- unify auth state management in one context/hook
- use shared components for login, redirect, and error handling

## 15. Technical debt audit

High debt items:

- `fakeAdminAccess` bypass
- stale auth endpoint `/api/auth/current-user`
- unused `staff` schema table
- duplicated session persistence logic
- mixed route naming and layout structure

Immediate cleanup:

- remove stale code and simplify auth paths
- document the auth contract clearly
- remove schema tables or wire them properly

## 16. Refactor roadmap

1. Fix backend auth route contract and JWT payload.
2. Remove or restructure `staff` table and unify RBAC.
3. Refactor frontend to one login page and central auth context.
4. Remove fake admin bypass and implement server-backed admin guard.
5. Normalize route names and middleware matching.
6. Consolidate auth storage into a shared utility.
7. Add missing DB indexes and clean polymorphic schema fields.

## 17. Migration strategy

### Step 1: Auth contract cleanup

- update `SecurityConfig` to permit `/api/auth/me`
- verify `/api/auth/login` and `/api/auth/register`
- standardize `AuthResponse`

### Step 2: RBAC normalization

- choose between single account or separate staff model
- migrate roles into `user_roles` if using single account
- remove or deprecate `staff` if unused

### Step 3: Frontend consolidation

- merge admin / student login into one page
- remove `fakeAdminAccess`
- use shared route constants and auth client

### Step 4: Database normalization

- refactor `users.university` to `university_id` if using `universities`
- simplify onboarding tables
- add missing indexes for admin queries

## 18. Recommended future architecture

The ideal architecture for ResourceX is:

- backend: domain modules with explicit auth/RBAC service, entity-only user model, and secure JWT auth
- frontend: one shared auth layer, role-based redirect, and separate student/admin route groups
- database: normalized user roles, staging tables only for registration, and coherent actor/notification references

## 19. Recommended folder structure

### Backend

- `backend/src/main/java/com/resourcex/resourcex/auth/`
  - security config, filters, jwt, auth service, auth controller
- `backend/src/main/java/com/resourcex/resourcex/user/`
  - user entity, user service, user controller
- `backend/src/main/java/com/resourcex/resourcex/admin/`
  - admin controllers, services, DTOs
- `backend/src/main/java/com/resourcex/resourcex/booking/`
- `backend/src/main/java/com/resourcex/resourcex/dispute/`
- `backend/src/main/java/com/resourcex/resourcex/notification/`

### Frontend

- `frontend/web/lib/` for shared API and auth utilities
- `frontend/web/context/` for auth state
- `frontend/web/app/(student)/` for student routes
- `frontend/web/app/(admin)/` for admin routes
- `frontend/web/components/` for shared UI components

## 20. Recommended RBAC architecture

- use one RBAC source of truth: `roles` + `user_roles`
- store role strings as `ROLE_USER`, `ROLE_ADMIN`, `ROLE_MODERATOR`, `ROLE_SUPER_ADMIN`
- enforce roles in backend with `@PreAuthorize` or route matchers
- keep frontend role checks as UX guards only

## 21. Recommended auth flow

1. User submits credentials to `/api/auth/login`
2. Backend verifies credentials and status
3. Backend issues JWT with subject + roles + expiry
4. Frontend stores token safely and redirects based on role
5. frontend refreshes session via `/api/auth/me`
6. backend validates token and returns current user + roles

## 22. Recommended database improvements

- remove `staff` or wire it into auth
- simplify onboarding tables
- store `university_id` as a foreign key
- normalize polymorphic entity references or use typed child tables
- add missing indexes for admin action lookups

## 23. Recommended frontend architecture

- one auth page with role redirect
- one shared axios client and auth interceptor
- shared `AuthContext` for user, roles, refresh, logout
- role-specific route groups under `/student` and `/admin`
- remove `fakeAdminAccess` and use actual guard components

## 24. Recommended backend architecture

- central auth module with `JwtService`, `AuthService`, `CustomUserDetailsService`, and RBAC utilities
- route-based security config with exact public paths
- explicit admin and superadmin controllers for admin-only operations
- remove dead SQL artifacts or transition them cleanly

## 25. Immediate fixes vs long-term refactors

### Immediate fixes

- fix `/api/auth/me` / `/current-user` mismatch
- remove `fakeAdminAccess`
- remove duplicate admin login page behavior
- align auth response fields
- fix token storage duplication

### Long-term refactors

- choose one RBAC model and remove unused `staff`
- normalize onboarding schema and verification tables
- redesign frontend route naming and layout grouping
- centralize backend RBAC service
- implement secure token handling with refresh or secure cookies
