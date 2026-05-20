# CampusVault Project Roadmap & Status (Detailed)

This document tracks the granular development progress, identifying incomplete modules, missing logic, and unhandled edge cases required for a production-ready system. The tasks are serialized strictly by **Implementation Priority**.

---

## 🔥 Priority 0: Critical System Fixes & Foundations

**Status**: 🚨 Blocker
**What needs to be done first before any further feature development.**

- [ ] **Database Schema Fixes (Backend)**:
  - **Issue**: Hibernate `ddl-auto=update` is causing application startup crashes throwing Foreign Key incompatibility exceptions (`bookings_ibfk_1`, `FKc52o2b1jkxttngufqp3t7jr3h`, etc.) due to mismatch between BigInt vs Int columns or constraints.
  - **Action**: Fix Entity definitions to perfectly match the raw `schema.sql` standard, or clean the DB and rebuild it.
- [x] **Remove Mock Data (Frontend)**:
  - **Action**: Transitioned `/borrow`, `/my-bookings`, and `/borrow/item/[id]` pages from hardcoded `MOCK_ITEMS`/`MOCK_BOOKINGS` to real API calls using `lib/api.ts`.
  - **Backend Support**: Implemented `ItemServiceImpl` and `BookingServiceImpl` stubs to fetch data from repositories.

---

## 🛠 Priority 1: Core Booking Engine

**Status**: ✅ 100% Complete
The heart of CampusVault. It is mandatory for the system to be minimally viable.

- **Completed Features**:
  - [x] `BookingServiceImpl.java`: Implement `createBooking` logic, `approve/reject` flow, and status transitions (`PENDING -> ACTIVE -> COMPLETED -> CANCELLED`) instead of returning empty responses.
  - [x] **Frontend Integration**: Hook up `app/(student)/my-bookings/page.tsx` tabs (Active, Pending, Completed, Cancelled) to the `/api/bookings` lifecycle endpoints.
- **Edge Cases Solved**:
  - [x] **Race Conditions**: Two renters hitting 'Book' for the same dates simultaneously (SQL row locks or constraint checks needed).
  - [x] **Status Auto-Transitions**: A scheduled Cron-job to automatically flag a booking as `ACTIVE` when the start date reaches today.
  - [x] **Item Availability Sync**: Auto-flip Item status to `UNAVAILABLE` (or RENTED) during active slots.

---

## 📦 Priority 2: Item & Catalog System

**Status**: 🛠 40% Complete
Basic creation exists, but listing and modifying items is heavily incomplete.

- **Incomplete Features**:
  - `ItemServiceImpl.java`: Implement `getAllItems(category, searchQuery)` with dynamic filtering.
  - Logic for `updateItem` and `deleteItem` stubs.
  - **Frontend Integration**: Connect the "Browse Items" search bar and category pills in `BorrowPage.tsx` to the API.
- **Edge Cases to Solve**:
  - **Status Locks**: Prevent an owner from deleting an item (`soft-delete`) while it has `PENDING` payments or an `ACTIVE` booking.
  - **Image Mapping**: `ItemMapper.java` needs deep mapping support to attach/detach images continuously.

---

## 💰 Priority 3: Payment & Dispute Engine

**Status**: ⏳ 5% Complete (Skeletons Only)

- **Missing Features**:
  - `PaymentServiceImpl.java`: Missing Integration with a real payment gateway (SSLCommerz/Stripe). Missing Webhooks/IPN handlers to verify payment execution.
  - `DisputeServiceImpl.java`: Missing staff resolution APIs and dispute logging logic.
- **Edge Cases to Solve**:
  - **Payment Reconciliation**: If a renter pays but the gateway doesn't notify the backend via Webhook, the DB will get out of sync. Needs a background worker sync.
  - **Refund Fractions**: Handling partial logic if an item gets returned early due to being faulty.

---

## 🔐 Priority 4: Authentication & User Accounts

**Status**: ✅ 75% Complete
Login/Register is implemented, but profile operations and advanced security are missing.

- **Incomplete / Missing Features**:
  - `AuthServiceImpl.java`: Needs a 'Forgot Password' / Password reset flow logic out via email links.
  - `UserServiceImpl.java`: `updateProfile`, `changePassword`, and `getPublicProfile` are empty skeletons.
  - **Logout Security**: `JwtService.java` needs a token revocation/blacklist map (via Redis or DB check) as currently JWTs are valid infinitely until expiry.
- **Edge Cases to Solve**:
  - **OTP Brute Force**: Ensuring the `attempts` count in `OtpToken` actually blocks verification and invalidates correctly after `5` fails.
  - **Orphaned Uploads**: Clean up `idCardDataUrl` files periodically if the student drops off at email verification and never finishes registration.

---

## 💬 Priority 5: Messaging & Real-Time Inbox

**Status**: 🚧 0% Complete (UI Mock Only)

- **Missing Features**:
  - Backend needs a WebSocket implementation (using STOMP/SockJS or pure Socket.io) to support chat rooms per Booking.
  - Frontend `Inbox` needs to connect to the backend WebSocket layer to facilitate Live Messaging between Owner and Renter.

---

## 📊 Priority 6: Admin Analytics & Trust Scores

**Status**: 🛠 30% Complete

- **Incomplete Features**:
  - `AnalyticsController.java` is returning static outputs. Need analytical aggregation queries in JPA repositories to power the Admin Dashboard charts.
- **Edge Cases to Solve**:
  - **Role Escalation Preventions**: Ensuring Spring Security explicitly rejects regular `STUDENT` tokens from hitting any `/api/admin/**` endpoints.

---

## 🚀 Priority 7: Pre-Deployment & Cloud

- [ ] **Storage Migration**: Migrate local multipart `File` uploads inside the Spring Boot container to AWS S3 or Cloudinary.
- [ ] **Error Boundaries (Frontend)**: Catch random 500 error API responses gracefully rather than crashing Next.js.
- [ ] **OpenAPI / Swagger Docs**: Generate out-of-the-box API endpoints manual map for mobile-dev consumption.
