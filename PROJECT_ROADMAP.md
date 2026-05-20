# CampusVault Project Roadmap & Status (Detailed)

This document tracks the granular development progress, identifying incomplete modules, missing logic, and unhandled edge cases required for a production-ready system.

## 🏗 Backend Status: Module-by-Module

### 1. Authentication & Security (`/security`, `/auth`)

- **Status**: ✅ 85% Complete
- **Incomplete Logic**:
  - `AuthServiceImpl.java`: Missing password reset flow (token generation + email).
  - `JwtService.java`: Needs token revocation/blacklist (Redis or DB) for logout security.
- **Edge Cases**:
  - **Email Recycle**: Handle cases where a deleted user's email is re-used.
  - **Simultaneous Logins**: Policy on multiple active JWTs for the same user.
  - **OTP Brute Force**: While request limits exist, we need to ensure the `attempts` count in `OtpToken` actually blocks verification after 5 failures.

### 2. User & University Management (`/user`, `/university`)

- **Status**: 🛠 60% Complete
- **Incomplete Files**:
  - `UserServiceImpl.java`: `updateProfile`, `changePassword`, and `getPublicProfile` are skeletal.
  - `UniversityRepository.java`: Needs logic to validate email domains against allowed university domains.
- **Edge Cases**:
  - **Department Update**: Policy on whether a student can change their department after verification.
  - **Multi-Uni Support**: Handling students with multiple institutional affiliations (if applicable).

### 3. Item & Catalog (`/item`)

- **Status**: 🛠 50% Complete
- **Incomplete Files**:
  - `ItemServiceImpl.java`: `getAllItems` (with filtering/search) and `deleteItem` (soft delete) are incomplete.
  - `ItemMapper.java`: Needs to handle deep mapping for `ItemImage` lists.
- **Edge Cases**:
  - **Item Takedown Impact**: If an admin blocks an item, active bookings must be notified/suspended.
  - **Duplicate Prevention**: Prevent users from spamming identical listings.

### 4. Booking & Workflow (`/booking`)

- **Status**: ⏳ 15% Complete
- **Incomplete Files**:
  - `BookingServiceImpl.java`: **CRITICAL SKELETON**. Needs `createBooking` with overlap check, `approve/reject` flow, and status transitions.
- **Edge Cases**:
  - **Race Conditions**: Two renters hitting 'Book' for the same dates simultaneously (SQL row locks needed).
  - **Booking Duration**: Max/Min rental period enforcement.
  - **Availability Sync**: Item status must auto-flip to `RENTED` during active booking slots.

### 5. Payments & Disputes (`/payment`, `/dispute`)

- **Status**: ⏳ 10% Complete
- **Incomplete Files**:
  - `PaymentServiceImpl.java`: Skeleton. Missing IPN/Webhook handlers for external gateways.
  - `DisputeServiceImpl.java`: Skeleton. Missing staff resolution logic.
- **Edge Cases**:
  - **Payment Inconsistency**: Renter pays, but the gateway doesn't notify backend (Cron-based reconciliation needed).
  - **Refund Fractions**: Handling partial refunds for early item returns.

---

## 🎨 Frontend Status: Integration Progress

### 1. Student Portal (`app/(student)`)

- **Borrow Page**: Mostly UI mocks. Needs real search API integration.
- **My Posts**: Creation is wired, but Dashboard stats (Earnings, Requests) are hardcoded.
- **Inbox**: **PURE UI MOCK**. Needs WebSocket (STOMP/SockJS) or Polling service.
- **Booking Flow**: The multi-step checkout/calendar component is not yet connected to the backend.

### 2. Admin Portal (`app/(admin)`)

- **User Management**: Fully functional (Approve/Reject).
- **Item Moderation**: Wired to `blockItem` API.
- **Analytics/Dashboard**: All charts use static data.

---

## 🚨 Critical Edge Cases to Solve (Checklist)

### System-Wide

- [ ] **soft-delete**: Standardizing how we "delete" items and users without breaking foreign key relationships in `Bookings` and `Payments`.
- [ ] **Image Orphanage**: If a user uploads an ID card but never finishes registration, we need a cleanup job for the storage layer.

### Transactional

- [ ] **Calendar Overlaps**: Logic to prevent `Booking B` if any date between `StartA` and `EndA` is taken.
- [ ] **Status Locks**: Prevent an owner from deleting an item while it has `PENDING` payment or `ACTIVE` booking.

### Security

- [ ] **Role Escalation**: Ensure a `Student` cannot access `Admin` logs or trigger `blockItem` calls.
- [ ] **ID Card Privacy**: Ensure ID card URLs are transient or protected by auth (signed URLs).

---

## 🏁 Deployment Ready Requirements

1. **Cloud Service Integration**: Replace local storage with S3/Cloudinary.
2. **Environment Isolation**: Separate `.env` for production (DB credentials, API Keys).
3. **API Documentation**: Generate Swagger (OpenAPI) docs for mobile/external consumers.
4. **Error Boundaries**: Frontend global error handling for "Backend Down" scenarios.
