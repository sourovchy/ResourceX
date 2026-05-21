# ResourceX Folder Structure

This document summarizes the current backend, frontend, and database organization of the ResourceX project. Generated dependency/build folders are listed separately at the end so the source structure stays readable.

## Project Root

```text
ResourceX/
|-- .gitignore
|-- README.md
|-- PROJECT_ROADMAP.md
|-- PROJECT_STRUCTURE.md
|-- OTP_SYSTEM_CHANGES.md
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
    |   |               |-- CampusvaultApplication.java
    |   |               |-- config/
    |   |               |   |-- MailConfig.java
    |   |               |   `-- WebConfig.java
    |   |               |-- controller/
    |   |               |   |-- AdminController.java
    |   |               |   |-- AnalyticsController.java
    |   |               |   |-- AuthController.java
    |   |               |   |-- BookingController.java
    |   |               |   |-- DisputeController.java
    |   |               |   |-- ItemController.java
    |   |               |   |-- OtpController.java
    |   |               |   |-- PaymentController.java
    |   |               |   |-- ReviewController.java
    |   |               |   `-- UserController.java
    |   |               |-- dto/
    |   |               |   |-- request/
    |   |               |   |   |-- CreateBookingRequest.java
    |   |               |   |   |-- CreateDisputeRequest.java
    |   |               |   |   |-- CreateItemRequest.java
    |   |               |   |   |-- CreateReviewRequest.java
    |   |               |   |   |-- LoginRequest.java
    |   |               |   |   |-- OtpRequest.java
    |   |               |   |   |-- OtpVerifyRequest.java
    |   |               |   |   |-- PaymentRequest.java
    |   |               |   |   |-- PenaltyRequest.java
    |   |               |   |   |-- RegisterRequest.java
    |   |               |   |   |-- ResolutionRequest.java
    |   |               |   |   |-- UpdateItemRequest.java
    |   |               |   |   `-- UpdateUserRequest.java
    |   |               |   `-- response/
    |   |               |       |-- AnalyticsResponse.java
    |   |               |       |-- ApiResponse.java
    |   |               |       |-- AuthResponse.java
    |   |               |       |-- BookingResponse.java
    |   |               |       |-- DashboardStatsResponse.java
    |   |               |       |-- DisputeResponse.java
    |   |               |       |-- ItemResponse.java
    |   |               |       |-- OtpResponse.java
    |   |               |       |-- PaymentResponse.java
    |   |               |       |-- PendingUserResponse.java
    |   |               |       |-- ReviewResponse.java
    |   |               |       `-- UserResponse.java
    |   |               |-- entity/
    |   |               |   |-- AuditLog.java
    |   |               |   |-- Booking.java
    |   |               |   |-- Dispute.java
    |   |               |   |-- Item.java
    |   |               |   |-- ItemImage.java
    |   |               |   |-- OtpStatus.java
    |   |               |   |-- OtpToken.java
    |   |               |   |-- Payment.java
    |   |               |   |-- Penalty.java
    |   |               |   |-- PendingUser.java
    |   |               |   |-- Report.java
    |   |               |   |-- Review.java
    |   |               |   |-- Role.java
    |   |               |   |-- Staff.java
    |   |               |   |-- StudentVerification.java
    |   |               |   |-- TrustEvent.java
    |   |               |   |-- University.java
    |   |               |   |-- User.java
    |   |               |   |-- UserRole.java
    |   |               |   `-- UserStatus.java
    |   |               |-- exception/
    |   |               |   |-- BadRequestException.java
    |   |               |   |-- ConflictException.java
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
    |   |               |   |-- DisputeMapper.java
    |   |               |   |-- ItemMapper.java
    |   |               |   |-- PaymentMapper.java
    |   |               |   |-- ReviewMapper.java
    |   |               |   `-- UserMapper.java
    |   |               |-- repository/
    |   |               |   |-- AuditLogRepository.java
    |   |               |   |-- BookingRepository.java
    |   |               |   |-- DisputeRepository.java
    |   |               |   |-- ItemImageRepository.java
    |   |               |   |-- ItemRepository.java
    |   |               |   |-- OtpRepository.java
    |   |               |   |-- PaymentRepository.java
    |   |               |   |-- PenaltyRepository.java
    |   |               |   |-- PendingUserRepository.java
    |   |               |   |-- ReviewRepository.java
    |   |               |   |-- RoleRepository.java
    |   |               |   |-- StaffRepository.java
    |   |               |   |-- StudentVerificationRepository.java
    |   |               |   |-- TrustEventRepository.java
    |   |               |   |-- UniversityRepository.java
    |   |               |   |-- UserRepository.java
    |   |               |   `-- UserRoleRepository.java
    |   |               |-- security/
    |   |               |   |-- CustomUserDetailsServiceImpl.java
    |   |               |   |-- JwtService.java
    |   |               |   `-- SecurityConfig.java
    |   |               |-- service/
    |   |               |   |-- AdminService.java
    |   |               |   |-- AnalyticsService.java
    |   |               |   |-- AuthService.java
    |   |               |   |-- BookingService.java
    |   |               |   |-- DisputeService.java
    |   |               |   |-- EmailService.java
    |   |               |   |-- ItemService.java
    |   |               |   |-- OtpService.java
    |   |               |   |-- PaymentService.java
    |   |               |   |-- ReviewService.java
    |   |               |   |-- TrustService.java
    |   |               |   |-- UserService.java
    |   |               |   `-- impl/
    |   |               |       |-- AdminServiceImpl.java
    |   |               |       |-- AnalyticsServiceImpl.java
    |   |               |       |-- AuthServiceImpl.java
    |   |               |       |-- BookingServiceImpl.java
    |   |               |       |-- DisputeServiceImpl.java
    |   |               |       |-- EmailServiceImpl.java
    |   |               |       |-- ItemServiceImpl.java
    |   |               |       |-- OtpServiceImpl.java
    |   |               |       |-- PaymentServiceImpl.java
    |   |               |       |-- ReviewServiceImpl.java
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
    |   |                   |-- ItemValidator.java
    |   |                   |-- PaymentValidator.java
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

| Folder | Purpose |
| --- | --- |
| `config/` | Spring configuration such as CORS/web and mail setup. |
| `controller/` | REST API endpoints for auth, users, items, bookings, payments, disputes, reviews, admin, analytics, and OTP. |
| `dto/request/` | Request payload models received from the frontend/API clients. |
| `dto/response/` | Response payload models returned by the API. |
| `entity/` | JPA entity models representing database tables and domain records. |
| `exception/` | Global and custom API exception handling. |
| `filter/` | Request-level filters such as logging. |
| `mapper/` | Entity-to-DTO and DTO-to-entity conversion helpers. |
| `repository/` | Spring Data JPA repositories for database access. |
| `security/` | JWT, Spring Security configuration, and user-details integration. |
| `service/` | Service interfaces for business logic contracts. |
| `service/impl/` | Concrete service implementations. |
| `util/` | Shared utility classes for dates, files, JWT, password, response, currency, pagination, and email. |
| `util/constants/` | Centralized constants for app values, messages, regex, roles, and error codes. |
| `validator/` | Request/domain validation helpers. |

## Frontend

The main frontend is a Next.js 14 application using React 18, TypeScript, Tailwind CSS, Axios, and Lucide React icons.

```text
frontend/
|-- Arif/
|   `-- index.html
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
    |   |   |-- verify-email/
    |   |   |   `-- page.tsx
    |   |   `-- verify-phone/
    |   |       `-- page.tsx
    |   |-- (admin)/
    |   |   |-- layout.tsx
    |   |   |-- AdminLogin/
    |   |   |   `-- page.tsx
    |   |   |-- adminProfile/
    |   |   |   `-- page.tsx
    |   |   |-- analytics/
    |   |   |   `-- page.tsx
    |   |   |-- announcements/
    |   |   |   `-- page.tsx
    |   |   |-- bookings/
    |   |   |   `-- page.tsx
    |   |   |-- categories/
    |   |   |   `-- page.tsx
    |   |   |-- disputesAdmin/
    |   |   |   `-- page.tsx
    |   |   |-- home/
    |   |   |   `-- page.tsx
    |   |   |-- items/
    |   |   |   |-- page.tsx
    |   |   |   `-- [id]/
    |   |   |       `-- page.tsx
    |   |   |-- penalties/
    |   |   |   `-- page.tsx
    |   |   |-- trust-scores/
    |   |   |   `-- page.tsx
    |   |   `-- users/
    |   |       |-- page.tsx
    |   |       `-- [id]/
    |   |           `-- page.tsx
    |   `-- (student)/
    |       |-- layout.tsx
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
    |       |-- dashboard/
    |       |   `-- page.tsx
    |       |-- disputes/
    |       |   |-- page.tsx
    |       |   |-- my/
    |       |   |   `-- page.tsx
    |       |   `-- raise/
    |       |       `-- page.tsx
    |       |-- history/
    |       |   `-- page.tsx
    |       |-- inbox/
    |       |   |-- page.tsx
    |       |   |-- components/
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
    |       |-- my-bookings/
    |       |   `-- page.tsx
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
    |       `-- profile/
    |           |-- page.tsx
    |           |-- edit/
    |           |   `-- page.tsx
    |           `-- my-reviews/
    |               `-- page.tsx
    |-- components/
    |   |-- COMPONENTS_CHANGELOG.md
    |   |-- Navbar.tsx
    |   |-- TrustBadge.tsx
    |   |-- UnderConstruction.tsx
    |   |-- cards/
    |   |   |-- ActionCard.tsx
    |   |   |-- BookingCard.tsx
    |   |   |-- ItemCard.tsx
    |   |   `-- StatCard.tsx
    |   |-- layout/
    |   |   `-- AppShell.tsx
    |   `-- misc/
    |       |-- NotifBell.tsx
    |       `-- ResolveModal.tsx
    |-- context/
    |   `-- ThemeContext.tsx
    |-- hooks/
    |   `-- useChat.ts
    |-- lib/
    |   |-- api.ts
    |   |-- approvalRequests.ts
    |   |-- auth.ts
    |   |-- dateUtils.ts
    |   |-- mocks/
    |   |   `-- dummyData.ts
    |   `-- services/
    |       `-- chatService.ts
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
        |-- booking.ts
        |-- chat.ts
        |-- item.ts
        |-- payment.ts
        |-- review.ts
        `-- user.ts
```

### Frontend Folder Responsibilities

| Folder | Purpose |
| --- | --- |
| `app/` | Next.js App Router pages, layouts, route groups, and global CSS. |
| `app/auth/` | Authentication pages such as login, register, verification, pending approval, and password reset. |
| `app/(admin)/` | Admin dashboard routes for analytics, announcements, bookings, disputes, items, users, categories, penalties, trust scores, and profile. |
| `app/(student)/` | Student routes for dashboard, borrowing, bookings, history, disputes, inbox, notifications, profile, and posts. |
| `components/` | Shared reusable UI components. |
| `components/cards/` | Card components for actions, bookings, items, and stats. |
| `components/layout/` | Layout-level components such as the app shell. |
| `components/misc/` | Small supporting UI components such as modals and notifications. |
| `context/` | React context providers, currently including theme state. |
| `hooks/` | Shared custom React hooks. |
| `lib/` | API clients, auth helpers, date utilities, approval requests, services, and mock data. |
| `public/` | Static frontend assets such as the logo. |
| `theme/` | Design tokens for colors, spacing, typography, radius, shadows, and light/dark themes. |
| `types/` | Shared TypeScript domain types. |

## Database

```text
database/
|-- entity_breakdown.md
|-- er_diagram.pdf
|-- er_diagram.png
|-- er_diagram.sql
|-- er_diagram.svg
|-- queries.sql
|-- schema.sql
|-- seed_data.sql
|-- triggers.sql
`-- views.sql
```

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
