-- =========================================================
-- ResourceX — V9: Trust Score & Reputation System
-- =========================================================
-- Extends the existing trust scaffolding so that
-- student_profiles.trust_score is the single source of truth
-- (clamped 0..200) with full, idempotent history in trust_events,
-- dynamic trust levels, automated warnings/restrictions, and
-- escalating automatic suspensions.

-- 1. Link trust events to the booking/review that produced them
--    (enables idempotency + analytics).
ALTER TABLE trust_events
    ADD COLUMN related_booking_id BIGINT NULL,
    ADD COLUMN related_review_id  BIGINT NULL,
    ADD INDEX idx_trust_events_booking (related_booking_id),
    ADD INDEX idx_trust_events_review  (related_review_id),
    ADD CONSTRAINT fk_trust_events_booking
        FOREIGN KEY (related_booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_trust_events_review
        FOREIGN KEY (related_review_id)  REFERENCES reviews(review_id)   ON DELETE SET NULL;

-- 2. Cache the dynamic trust level + last update timestamp on the profile.
ALTER TABLE student_profiles
    ADD COLUMN trust_level          VARCHAR(30) NOT NULL DEFAULT 'STANDARD',
    ADD COLUMN last_trust_update_at DATETIME    NULL;

-- 3. Trust-driven enforcement state on the user.
ALTER TABLE users
    ADD COLUMN suspension_count              INT     NOT NULL DEFAULT 0,
    ADD COLUMN trust_warning_sent            BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN automatic_restriction_enabled BOOLEAN NOT NULL DEFAULT FALSE;
