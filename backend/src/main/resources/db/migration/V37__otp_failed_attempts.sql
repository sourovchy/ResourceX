-- =========================================================
-- V37 — OTP brute-force lockout
-- Track wrong-guess attempts per token so a code can be invalidated
-- after a small number of failures, independent of IP rate limiting.
-- =========================================================

ALTER TABLE otp_tokens
    ADD COLUMN failed_attempts INT NOT NULL DEFAULT 0 AFTER resend_count;
