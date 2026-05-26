# ResourceX Folder Structure

This document summarizes the current backend, frontend, and database organization of the ResourceX project. Generated dependency/build folders are listed separately at the end so the source structure stays readable.

## Project Root

```text
ResourceX/
|-- .gitignore
|-- README.md
|-- ENGINEERING_ROADMAP.md
|-- PROJECT_ARCHITECTURE_AUDIT.md
|-- PROJECT_STRUCTURE.md
|-- WorkToDO.md
|-- next.config.mjs
|-- backend/
|-- frontend/
`-- database/
```

## Backend

The backend is a Java 21 Spring Boot 3 application using Maven, Spring Web, Spring Data JPA, Spring Security, JWT, Mail, MySQL, and H2 for tests.

```text
backend/
|-- HELP.md
|-- mvnw
|-- mvnw.cmd
|-- pom.xml
|-- test_db.py
|-- update_schema.py
|-- .mvn/
|   `-- wrapper/
|       `-- maven-wrapper.properties
`-- src/
    |-- main/
    |   |-- java/
    |   |   `-- com/
    |   |       `-- resourcex/
    |   |           `-- resourcex/
    |   |               |-- ResourceXApplication.java
    |   |               |-- config/
    |   |               |   |-- CorsConfig.java
    |   |               |   `-- MailConfig.java
    |   |               |-- controller/
    |   |               |   |-- AdminController.java
    |   |               |   |-- AdminReportsController.java
    |   |               |   |-- AnalyticsController.java
    |   |               |   |-- AuthController.java
    |   |               |   |-- BookingController.java
    |   |               |   |-- CategoryController.java
    |   |               |   |-- ConversationController.java
    |   |               |   |-- DisputeController.java
    |   |               |   |-- ItemController.java
    |   |               |   |-- MessageController.java
    |   |               |   |-- NotificationController.java
    |   |               |   |-- OtpController.java
    |   |               |   |-- PaymentController.java
    |   |               |   |-- PenaltyController.java
    |   |               |   |-- ReviewController.java
    |   |               |   |-- SuperAdminController.java
    |   |               |   |-- TrustController.java
    |   |               |   `-- UserController.java
    |   |               |-- dto/
    |   |               |   |-- request/
    |   |               |   |   |-- ConversationRequest.java
    |   |               |   |   |-- CreateBookingRequest.java
    |   |               |   |   |-- CreateDisputeRequest.java
    |   |               |   |   |-- CreateItemRequest.java
    |   |               |   |   |-- CreatePrivilegedUserRequest.java
    |   |               |   |   |-- CreateReviewRequest.java
    |   |               |   |   |-- ForgotPasswordRequest.java
    |   |               |   |   |-- LoginRequest.java
    |   |               |   |   |-- MessageRequest.java
    |   |               |   |   |-- NotificationRequest.java
    |   |               |   |   |-- OtpRequest.java
    |   |               |   |   |-- OtpVerifyRequest.java
    |   |               |   |   |-- PaymentRequest.java
    |   |               |   |   |-- PenaltyRequest.java
    |   |               |   |   |-- RegisterRequest.java
    |   |               |   |   |-- RejectUserRequest.java
    |   |               |   |   |-- ResetPasswordRequest.java
    |   |               |   |   |-- ResolutionRequest.java
    |   |               |   |   |-- UpdateItemRequest.java
    |   |               |   |   `-- UpdateUserRequest.java
    |   |               |   `-- response/
    |   |               |       |-- AdminTrustUserResponse.java
    |   |               |       |-- AnalyticsResponse.java
    |   |               |       |-- ApiResponse.java
    |   |               |       |-- AuthResponse.java
    |   |               |       |-- BookingResponse.java
    |   |               |       |-- CategoryResponse.java
    |   |               |       |-- ConversationResponse.java
    |   |               |       |-- CurrentUserResponse.java
    |   |               |       |-- DashboardStatsResponse.java
    |   |               |       |-- DisputeResponse.java
    |   |               |       |-- ItemResponse.java
    |   |               |       |-- MessageResponse.java
    |   |               |       |-- NotificationResponse.java
    |   |               |       |-- OtpResponse.java
    |   |               |       |-- PaymentResponse.java
    |   |               |       |-- PenaltyResponse.java
    |   |               |       |-- PendingUserResponse.java
    |   |               |       |-- ReviewResponse.java
    |   |               |       |-- SimpleReportResponse.java
    |   |               |       |-- StudentProfileResponse.java
    |   |               |       |-- TrustAuditResponse.java
    |   |               |       |-- TrustEventResponse.java
    |   |               |       `-- UserResponse.java
    |   |               |-- entity/
    |   |               |   |-- AuditLog.java
    |   |               |   |-- Booking.java
    |   |               |   |-- Category.java
    |   |               |   |-- Conversation.java
    |   |               |   |-- Dispute.java
    |   |               |   |-- Item.java
    |   |               |   |-- ItemImage.java
    |   |               |   |-- Message.java
    |   |               |   |-- Notification.java
    |   |               |   |-- OtpStatus.java
    |   |               |   |-- OtpToken.java
    |   |               |   |-- PasswordResetToken.java
    |   |               |   |-- Payment.java
    |   |               |   |-- Penalty.java
    |   |               |   |-- PendingUser.java
    |   |               |   |-- PendingUserStatus.java
    |   |               |   |-- Report.java
    |   |               |   |-- Review.java
    |   |               |   |-- Role.java
    |   |               |   |-- StudentProfile.java
    |   |               |   |-- TrustEvent.java
    |   |               |   |-- University.java
    |   |               |   |-- User.java
    |   |               |   |-- UserRole.java
    |   |               |   `-- UserStatus.java
    |   |               |-- exception/
    |   |               |   |-- BadRequestException.java
    |   |               |   |-- ConflictException.java
    |   |               |   |-- EmailDeliveryException.java
    |   |               |   |-- ForbiddenException.java
    |   |               |   |-- GlobalExceptionHandler.java
    |   |               |   |-- InternalServerException.java
    |   |               |   |-- ResourceNotFoundException.java
    |   |               |   |-- UnauthorizedException.java
    |   |               |   `-- custom/
    |   |               |       |-- DuplicateResourceException.java
    |   |               |       |-- InvalidTokenException.java
    |   |               |       `-- ValidationException.java
    |   |               |-- filter/
    |   |               |   `-- RequestLoggingFilter.java
    |   |               |-- mapper/
    |   |               |   |-- BookingMapper.java
    |   |               |   |-- ConversationMapper.java
    |   |               |   |-- DisputeMapper.java
    |   |               |   |-- ItemMapper.java
    |   |               |   |-- MessageMapper.java
    |   |               |   |-- NotificationMapper.java
    |   |               |   |-- PaymentMapper.java
    |   |               |   |-- PenaltyMapper.java
    |   |               |   |-- ReviewMapper.java
    |   |               |   `-- UserMapper.java
    |   |               |-- repository/
    |   |               |   |-- AuditLogRepository.java
    |   |               |   |-- BookingRepository.java
    |   |               |   |-- CategoryRepository.java
    |   |               |   |-- ConversationRepository.java
    |   |               |   |-- DisputeRepository.java
    |   |               |   |-- ItemImageRepository.java
    |   |               |   |-- ItemRepository.java
    |   |               |   |-- MessageRepository.java
    |   |               |   |-- NotificationRepository.java
    |   |               |   |-- OtpRepository.java
    |   |               |   |-- PasswordResetTokenRepository.java
    |   |               |   |-- PaymentRepository.java
    |   |               |   |-- PenaltyRepository.java
    |   |               |   |-- PendingUserRepository.java
    |   |               |   |-- ReportRepository.java
    |   |               |   |-- ReviewRepository.java
    |   |               |   |-- RoleRepository.java
    |   |               |   |-- StudentProfileRepository.java
    |   |               |   |-- TrustEventRepository.java
    |   |               |   |-- UniversityRepository.java
    |   |               |   |-- UserRepository.java
    |   |               |   `-- UserRoleRepository.java
    |   |               |-- scheduler/
    |   |               |   `-- AutomationScheduler.java
    |   |               |-- security/
    |   |               |   |-- CustomUserDetailsServiceImpl.java
    |   |               |   |-- JwtAuthenticationFilter.java
    |   |               |   |-- JwtService.java
    |   |               |   `-- SecurityConfig.java
    |   |               |-- service/
    |   |               |   |-- AdminService.java
    |   |               |   |-- AnalyticsService.java
    |   |               |   |-- AuthService.java
    |   |               |   |-- BookingService.java
    |   |               |   |-- ConversationService.java
    |   |               |   |-- DisputeService.java
    |   |               |   |-- EmailService.java
    |   |               |   |-- ItemService.java
    |   |               |   |-- MessageService.java
    |   |               |   |-- NotificationService.java
    |   |               |   |-- OtpService.java
    |   |               |   |-- PaymentService.java
    |   |               |   |-- PenaltyService.java
    |   |               |   |-- ReviewService.java
    |   |               |   |-- SuperAdminService.java
    |   |               |   |-- TrustService.java
    |   |               |   |-- UserService.java
    |   |               |   `-- impl/
    |   |               |       |-- AdminServiceImpl.java
    |   |               |       |-- AnalyticsServiceImpl.java
    |   |               |       |-- AuthServiceImpl.java
    |   |               |       |-- BookingServiceImpl.java
    |   |               |       |-- ConversationServiceImpl.java
    |   |               |       |-- DisputeServiceImpl.java
    |   |               |       |-- EmailServiceImpl.java
    |   |               |       |-- ItemServiceImpl.java
    |   |               |       |-- MessageServiceImpl.java
    |   |               |       |-- NotificationServiceImpl.java
    |   |               |       |-- OtpServiceImpl.java
    |   |               |       |-- PaymentServiceImpl.java
    |   |               |       |-- PenaltyServiceImpl.java
    |   |               |       |-- ReviewServiceImpl.java
    |   |               |       |-- SuperAdminServiceImpl.java
    |   |               |       |-- TrustServiceImpl.java
    |   |               |       `-- UserServiceImpl.java
    |   |               |-- util/
    |   |               |   |-- CurrencyUtil.java
    |   |               |   |-- DateUtil.java
    |   |               |   |-- EmailUtil.java
    |   |               |   |-- FileUtil.java
    |   |               |   |-- JwtUtil.java
    |   |               |   |-- KeysUtil.java
    |   |               |   |-- PaginationUtil.java
    |   |               |   |-- PasswordHashGenerator.java
    |   |               |   |-- PasswordUtil.java
    |   |               |   |-- ResponseUtil.java
    |   |               |   `-- constants/
    |   |               |       |-- AppConstants.java
    |   |               |       |-- ErrorCodeConstants.java
    |   |               |       |-- MessageConstants.java
    |   |               |       |-- RegexConstants.java
    |   |               |       `-- RoleConstants.java
    |   |               `-- validator/
    |   |                   |-- BookingValidator.java
    |   |                   |-- ConversationValidator.java
    |   |                   |-- ItemValidator.java
    |   |                   |-- MessageValidator.java
    |   |                   |-- NotificationValidator.java
    |   |                   |-- PaymentValidator.java
    |   |                   |-- TrustValidator.java
    |   |                   `-- UserValidator.java
    |   `-- resources/
    |       `-- application.properties
    `-- test/
        |-- java/
        |   `-- com/
        |       `-- resourcex/
        |           `-- resourcex/
        |               `-- CampusvaultApplicationTests.java
        `-- resources/
            `-- application-test.properties
```

### Backend Package Responsibilities

| Folder            | Purpose                                                                                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `config/`         | Spring configuration: CORS/web (`CorsConfig`) and mail setup (`MailConfig`).                                                                                                  |
| `controller/`     | REST API endpoints for auth, users, items, bookings, payments, disputes, reviews, categories, conversations, messages, penalties, trust scores, admin, analytics, and OTP.    |
| `dto/request/`    | Request payload models received from frontend/API clients. Includes conversation, message, privileged-user creation, forgot/reset-password, and reject-user payloads.         |
| `dto/response/`   | Response payload models returned by the API. Includes category, conversation, message, penalty, student profile, trust audit/event, and current-user response shapes.         |
| `entity/`         | JPA entity models representing database tables. Includes `Category`, `Conversation`, `Message`, `PasswordResetToken`, `PendingUserStatus`, and `StudentProfile` additions.    |
| `exception/`      | Global and custom API exception handling. Added `EmailDeliveryException` for mail-send failures.                                                                              |
| `filter/`         | Request-level filters such as logging (`RequestLoggingFilter`).                                                                                                               |
| `mapper/`         | Entity-to-DTO converters. Extended with `ConversationMapper`, `MessageMapper`, and `PenaltyMapper`.                                                                           |
| `repository/`     | Spring Data JPA repositories. Extended with `CategoryRepository`, `ConversationRepository`, `MessageRepository`, `PasswordResetTokenRepository`, `ReportRepository`, and `StudentProfileRepository`. |
| `scheduler/`      | Spring `@Scheduled` background jobs (`AutomationScheduler`): booking expiry, OTP cleanup, dispute auto-escalation, trust recalculation, and notification pruning.             |
| `security/`       | JWT, Spring Security configuration, and user-details integration. Added `JwtAuthenticationFilter` for stateless filter chain wiring.                                          |
| `service/`        | Service interfaces for business logic contracts. Added `ConversationService`, `MessageService`, `PenaltyService`, and `SuperAdminService`.                                    |
| `service/impl/`   | Concrete service implementations. Extended with `ConversationServiceImpl`, `MessageServiceImpl`, `PenaltyServiceImpl`, and `SuperAdminServiceImpl`.                           |
| `util/`           | Shared utility classes. Added `PasswordHashGenerator` for BCrypt hash generation during dev/seeding.                                                                          |
| `util/constants/` | Centralized constants for app values, messages, regex, roles, and error codes.                                                                                                |
| `validator/`      | Request/domain validation helpers. Extended with `ConversationValidator`, `MessageValidator`, and `TrustValidator`.                                                           |

## Frontend

The main frontend is a Next.js 14 application using React 18, TypeScript, Tailwind CSS, Axios, and Lucide React icons. The previous two separate route groups `(admin)` and `(student)` have been consolidated into a single unified `(dashboard)` route group with role-aware rendering per page.

```text
frontend/
`-- web/
    |-- .eslintrc.json
    |-- CONSOLIDATION_REPORT.md
    |-- middleware.ts
    |-- next-env.d.ts
    |-- next.config.mjs
    |-- package-lock.json
    |-- package.json
    |-- postcss.config.js
    |-- tailwind.config.ts
    |-- test.css
    |-- tsconfig.json
    |-- app/
    |   |-- globals.css
    |   |-- layout.tsx
    |   |-- page.tsx
    |   |-- auth/
    |   |   |-- forgot-password/
    |   |   |   `-- page.tsx
    |   |   |-- login/
    |   |   |   `-- page.tsx
    |   |   |-- pending/
    |   |   |   `-- page.tsx
    |   |   |-- pending-approval/
    |   |   |   `-- page.tsx
    |   |   |-- register/
    |   |   |   `-- page.tsx
    |   |   |-- reset-password/
    |   |   |   `-- page.tsx
    |   |   |-- verify-email/
    |   |   |   `-- page.tsx
    |   |   `-- verify-phone/
    |   |       `-- page.tsx
    |   |-- terms/
    |   |   `-- page.tsx
    |   `-- (dashboard)/
    |       |-- layout.tsx
    |       |-- analytics/
    |       |   `-- page.tsx
    |       |-- bookings/
    |       |   |-- page.tsx
    |       |   |-- AdminBookings.tsx
    |       |   `-- StudentBookings.tsx
    |       |-- borrow/
    |       |   |-- page.tsx
    |       |   |-- book/
    |       |   |   `-- [id]/
    |       |   |       `-- page.tsx
    |       |   |-- deposit-tracker/
    |       |   |   `-- page.tsx
    |       |   |-- item/
    |       |   |   `-- [id]/
    |       |   |       `-- page.tsx
    |       |   |-- review/
    |       |   |   `-- [bookingId]/
    |       |   |       `-- page.tsx
    |       |   `-- wishlist/
    |       |       `-- page.tsx
    |       |-- categories/
    |       |   `-- page.tsx
    |       |-- dashboard/
    |       |   `-- page.tsx
    |       |-- disputes/
    |       |   |-- page.tsx
    |       |   |-- AdminDisputes.tsx
    |       |   |-- StudentDisputes.tsx
    |       |   |-- my/
    |       |   |   `-- page.tsx
    |       |   `-- raise/
    |       |       `-- page.tsx
    |       |-- history/
    |       |   `-- page.tsx
    |       |-- inbox/
    |       |   |-- page.tsx
    |       |   |-- components/
    |       |   |   |-- ChatSidebar.tsx
    |       |   |   |-- ChatWindow.tsx
    |       |   |   |-- ConversationItem.tsx
    |       |   |   |-- ConversationList.tsx
    |       |   |   |-- MessageBubble.tsx
    |       |   |   |-- MessageInput.tsx
    |       |   |   |-- SearchBar.tsx
    |       |   |   `-- UserInfoModal.tsx
    |       |   |-- hooks/
    |       |   |   `-- useChat.ts
    |       |   |-- services/
    |       |   |   `-- chatService.ts
    |       |   |-- types/
    |       |   |   `-- chat.ts
    |       |   `-- utils/
    |       |       `-- dummyData.ts
    |       |-- items/
    |       |   |-- page.tsx
    |       |   `-- [id]/
    |       |       `-- page.tsx
    |       |-- my-posts/
    |       |   |-- page.tsx
    |       |   |-- active-rentals/
    |       |   |   `-- page.tsx
    |       |   |-- add/
    |       |   |   `-- page.tsx
    |       |   |-- condition-report/
    |       |   |   `-- [bookingId]/
    |       |   |       `-- page.tsx
    |       |   |-- earnings/
    |       |   |   `-- page.tsx
    |       |   |-- edit/
    |       |   |   `-- [id]/
    |       |   |       `-- page.tsx
    |       |   |-- penalty/
    |       |   |   `-- [bookingId]/
    |       |   |       `-- page.tsx
    |       |   `-- requests/
    |       |       `-- page.tsx
    |       |-- notifications/
    |       |   `-- page.tsx
    |       |-- penalties/
    |       |   `-- page.tsx
    |       |-- profile/
    |       |   |-- page.tsx
    |       |   |-- AdminProfile.tsx
    |       |   |-- StudentProfile.tsx
    |       |   |-- edit/
    |       |   |   `-- page.tsx
    |       |   `-- my-reviews/
    |       |       `-- page.tsx
    |       |-- staff-management/
    |       |   `-- page.tsx
    |       |-- trust-scores/
    |       |   `-- page.tsx
    |       `-- users/
    |           |-- page.tsx
    |           `-- [id]/
    |               `-- page.tsx
    |-- components/
    |   |-- COMPONENTS_CHANGELOG.md
    |   |-- Navbar.tsx
    |   |-- TrustBadge.tsx
    |   |-- UnderConstruction.tsx
    |   |-- auth/
    |   |   `-- AuthGuard.tsx
    |   |-- cards/
    |   |   |-- ActionCard.tsx
    |   |   |-- BookingCard.tsx
    |   |   |-- ItemCard.tsx
    |   |   `-- StatCard.tsx
    |   |-- layout/
    |   |   `-- AppShell.tsx
    |   |-- misc/
    |   |   |-- NotifBell.tsx
    |   |   `-- ResolveModal.tsx
    |   `-- ui/
    |-- context/
    |   `-- ThemeContext.tsx
    |-- hooks/
    |   `-- useChat.ts
    |-- lib/
    |   |-- api.ts
    |   |-- auth.ts
    |   |-- dateUtils.ts
    |   |-- errorUtils.ts
    |   `-- services/
    |       |-- analyticsService.ts
    |       |-- bookingService.ts
    |       |-- chatService.ts
    |       |-- disputeService.ts
    |       |-- penaltyService.ts
    |       |-- reviewService.ts
    |       |-- trustService.ts
    |       `-- userService.ts
    |-- public/
    |   `-- logo.png
    |-- theme/
    |   |-- colors.ts
    |   |-- dark.ts
    |   |-- index.ts
    |   |-- light.ts
    |   |-- radius.ts
    |   |-- shadows.ts
    |   |-- spacing.ts
    |   `-- typography.ts
    `-- types/
        |-- analytics.ts
        |-- auth.ts
        |-- booking.ts
        |-- chat.ts
        |-- dispute.ts
        |-- item.ts
        |-- payment.ts
        |-- penalty.ts
        |-- review.ts
        |-- trust.ts
        `-- user.ts
```

### Frontend Folder Responsibilities

| Folder                       | Purpose                                                                                                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/`                       | Next.js App Router pages, layouts, route groups, and global CSS.                                                                                                             |
| `app/auth/`                  | Authentication pages: login, register, OTP/email verification, pending approval, password forgot/reset. Added `reset-password` route.                                        |
| `app/terms/`                 | Terms & conditions static page.                                                                                                                                              |
| `app/(dashboard)/`           | Unified dashboard route group (replaces former `(admin)` + `(student)` split). Single `layout.tsx` renders the correct shell based on the authenticated user's role.        |
| `app/(dashboard)/analytics/` | Analytics dashboard — admin-only charts and KPI summaries.                                                                                                                   |
| `app/(dashboard)/bookings/`  | Role-aware bookings page: `AdminBookings.tsx` and `StudentBookings.tsx` co-located and selected at runtime by `page.tsx`.                                                    |
| `app/(dashboard)/borrow/`    | Item browsing and borrowing flow: listing, item detail, booking form, deposit tracker, review submission, and wishlist.                                                      |
| `app/(dashboard)/categories/`| Category management page (admin).                                                                                                                                            |
| `app/(dashboard)/dashboard/` | Student/admin landing dashboard with key stats and quick actions.                                                                                                            |
| `app/(dashboard)/disputes/`  | Role-aware disputes page: `AdminDisputes.tsx` and `StudentDisputes.tsx` co-located. Sub-routes for raising and viewing personal disputes.                                    |
| `app/(dashboard)/history/`   | Rental history page for students.                                                                                                                                            |
| `app/(dashboard)/inbox/`     | Real-time peer-to-peer messaging. Self-contained module with its own `components/`, `hooks/`, `services/`, `types/`, and `utils/` sub-folders. Added `ChatSidebar.tsx`.      |
| `app/(dashboard)/items/`     | Browse all listed items with dynamic `[id]` detail view.                                                                                                                     |
| `app/(dashboard)/my-posts/`  | Lender management: posted items list, add/edit, active rentals, incoming requests, earnings, condition reports, and penalty views.                                            |
| `app/(dashboard)/notifications/` | Notification centre for students.                                                                                                                                        |
| `app/(dashboard)/penalties/` | Penalty management page (admin).                                                                                                                                             |
| `app/(dashboard)/profile/`   | Role-aware profile page: `AdminProfile.tsx` and `StudentProfile.tsx` co-located. Sub-routes for editing and viewing own reviews.                                             |
| `app/(dashboard)/staff-management/` | Super-admin staff management (create/deactivate admin and staff accounts).                                                                                          |
| `app/(dashboard)/trust-scores/` | Trust score dashboard and audit log viewer (admin).                                                                                                                       |
| `app/(dashboard)/users/`     | User directory with dynamic `[id]` detail view (admin).                                                                                                                      |
| `components/auth/`           | Auth-related components: `AuthGuard.tsx` for route protection.                                                                                                               |
| `components/cards/`          | Card components for actions, bookings, items, and stats.                                                                                                                     |
| `components/layout/`         | Layout-level components such as the app shell (`AppShell.tsx`).                                                                                                              |
| `components/misc/`           | Small supporting UI components such as modals and notification bell.                                                                                                         |
| `components/ui/`             | Primitive UI component library (reserved/empty — for future headless components).                                                                                            |
| `context/`                   | React context providers, currently including theme state (`ThemeContext`).                                                                                                   |
| `hooks/`                     | Shared custom React hooks (e.g., `useChat`).                                                                                                                                 |
| `lib/`                       | API client (`api.ts`), auth helpers (`auth.ts`), date utilities, error utilities, and domain service modules.                                                                |
| `lib/services/`              | Typed API service modules: analytics, booking, chat, dispute, penalty, review, trust, and user services.                                                                     |
| `public/`                    | Static frontend assets (logo, images).                                                                                                                                       |
| `theme/`                     | Design tokens for colors, spacing, typography, radius, shadows, and light/dark themes.                                                                                       |
| `types/`                     | Shared TypeScript domain types. Added `auth.ts`, `dispute.ts`, `penalty.ts`, and `trust.ts`.                                                                                 |

## Database

```text
database/
|-- queries.sql
|-- schema.sql
|-- seed_data.sql
|-- triggers.sql
`-- views.sql
```

### Database File Responsibilities

| File            | Purpose                                                                             |
| --------------- | ----------------------------------------------------------------------------------- |
| `schema.sql`    | Full DDL — all table definitions, indexes, and foreign keys.                        |
| `seed_data.sql` | Reference/demo data for roles, universities, categories, and sample users.          |
| `queries.sql`   | Ad-hoc and diagnostic SQL queries used during development.                          |
| `triggers.sql`  | MySQL triggers for automated side-effects (e.g., trust-event side-effects).        |
| `views.sql`     | Reusable SQL views for reporting and analytics queries.                              |

## Generated Or Local-Only Folders

These folders are useful locally but should not be treated as source architecture:

```text
backend/target/              # Maven build artifacts
frontend/web/.next/          # Next.js build/dev output
frontend/web/node_modules/   # Installed frontend dependencies
frontend/web/tsconfig.tsbuildinfo
.vscode/                     # Local editor settings
backend/.idea/               # Local IDE settings
frontend/.idea/              # Local IDE settings
database/.idea/              # Local IDE settings
.DS_Store                    # macOS metadata files
```
