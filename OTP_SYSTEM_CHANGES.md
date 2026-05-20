# OTP System Improvements

I have implemented the following changes to the OTP (Email Verification) system to meet the requirements and handle edge cases.

## Backend Changes

### 1. Rate Limiting & Cooldown

- **Cooldown Period**: Increased the resend cooldown from 1 minute to **5 minutes** (`RESEND_COOLDOWN_SECONDS = 300`).
- **Detailed Error Messages**: When a user requests an OTP during the cooldown period, the system now returns a precise message indicating exactly how many minutes and seconds they must wait.

### 2. Request Limit

- **Max Requests**: Implemented a limit of **5 OTP requests per user** (`MAX_OTP_REQUESTS = 3`).
- **Tracking**: The system counts the number of `OtpToken` records associated with the user's email in the database.
- **Enforcement**: If the limit is reached, further requests are blocked with the message: _"Maximum OTP request limit reached (3). Please contact support."_

### 3. Edge Case Handling

- **Already Verified Check**: Added a check to prevent sending OTPs to emails that are already verified.
- **Email Normalization**: Improved email normalization to handle leading/trailing spaces and case-insensitivity consistently.
- **Pessimistic Locking**: Maintained pessimistic locking on active tokens during verification to prevent race conditions.
- **Attempt Locking**: Tokens are still locked after 5 failed verification attempts to prevent brute-forcing.

### 4. Code Robustness

- Updated `OtpRepository` to include `countByEmailIgnoreCase`.
- Fixed potential null pointer or missing method issues in `OtpServiceImpl`.

## Frontend Changes

### 1. Countdown Timer

- **Visual Feedback**: Added a countdown timer to the "Resend code" button on the Email Verification page.
- **State Persistence**: The timer state is persisted in `localStorage` (`campusvault_otp_last_send`). This ensures that even if the user refreshes the page, the 5-minute cooldown is still respected and visually shown.
- **Dynamic Button State**: The "Resend code" button is automatically disabled while the timer is active.

### 2. User Experience

- The button now shows exactly how much time is left (e.g., _"Resend in 4:32"_).
- Improved error handling to show specific backend messages (like the cooldown or limit reached messages).

## File Modifications

- **Backend**:
  - `OtpServiceImpl.java`
  - `OtpRepository.java`
- **Frontend**:
  - `verify-email/page.tsx`
