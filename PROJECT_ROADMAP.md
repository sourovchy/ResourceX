# CampusVault Project Roadmap & Status

This document outlines the current state of the CampusVault project and the steps required to make it production-ready.

## Project Structure Overview

### Backend (`/backend`)

- **Core Strategy**: Spring Boot with JPA, MySQL, and JWT Security.
- **Key Modules**:
  - `entity/`: Database models matching the new schema.
  - `repository/`: Data access layer.
  - `service/`: Business logic (many are currently skeletons).
  - `controller/`: REST endpoints.
  - `security/`: JWT authentication and authorization.

### Frontend (`/frontend/web`)

- **Core Technology**: Next.js 14+ (App Router), TailwindCSS (Custom Design System).
- **Key Directories**:
  - `app/(student)`: Student portal features (Borrow, My Posts, Inbox).
  - `app/(admin)`: Admin management panel.
  - `app/auth`: Authentication flows (Login, Register, verification).
  - `components/`: Reusable UI components.

---

## Current Status & Progress

### 1. Authentication & Identity ✅ (80% Complete)

- [x] User Registration with Email Verification (OTP).
- [x] Multi-step Approval Flow (Pending users table).
- [x] Admin Approval/Rejection logic.
- [x] JWT Login.
- [ ] Profile editing and password reset.
- [ ] University-specific domain validation.

### 2. Item Management 🛠 (40% Complete)

- [x] Schema sync (Auto-approval enabled).
- [x] Admin "Take down" logic (Backend ready).
- [x] Frontend "My Posts" UI.
- [ ] **TODO**: Implement real backend logic for `ItemService` (currently skeletons).
- [ ] **TODO**: Image upload integration (Cloudinary or local storage).
- [ ] **TODO**: Search and Category filtering logic.

### 3. Booking & Workflow ⏳ (20% Complete)

- [x] Schema defined.
- [ ] **TODO**: Booking request flow (Renter request -> Owner approve).
- [ ] **TODO**: Calendar conflict management.
- [ ] **TODO**: Real-time availability status updates (`AVAILABLE` -> `RENTED`).

### 4. Payments & Trust ⏳ (10% Complete)

- [x] Schema defined.
- [ ] **TODO**: SSLCommerz or Stripe integration skeleton.
- [ ] **TODO**: Trust score calculation logic (based on reviews/penalties).
- [ ] **TODO**: Penalty issuance system.

### 5. Communication (Inbox) 🛠 (30% Complete)

- [x] Frontend UI.
- [ ] **TODO**: Backend WebSocket or polling-based messaging API.

---

## Deployment Checklist (Phase by Phase)

### Phase 1: Core Functionality (Next Steps)

1. **[Backend]** Complete `ItemServiceImpl` and `BookingServiceImpl`.
2. **[Frontend]** Connect Item Creation form to backend.
3. **[Backend]** Implement `FileStorageService` for ID cards and Item images.
4. **[Backend]** Implement Audit Logging for all major actions.

### Phase 2: Refinement

1. **[Security]** Add Rate Limiting and CSRF protection.
2. **[Testing]** Unit tests for `AuthService` and `BookingService`.
3. **[Frontend]** Implement real stats for Admin/Student dashboards.

### Phase 3: Production Prep

1. **[DevOps]** Set up Docker Compose or CI/CD pipelines.
2. **[Database]** Finalize seed data for universities and categories.
3. **[Monitoring]** Integrate basic logging (Sentry or similar).

---

## Ongoing Improvements

- **Null Safety**: Address remaining lint warnings in backend service layer.
- **Edge Cases**: Handle "Item Deleted while booked" or "User Banned while having active rentals".
- **Aesthetics**: Continue polishing micro-animations and loading states in the frontend.
