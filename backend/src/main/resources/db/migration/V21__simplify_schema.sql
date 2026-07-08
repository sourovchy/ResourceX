-- =========================================================
-- V21 — Schema simplification pass
-- Implements the ResourceX Database Refactoring Summary plus the follow-on
-- normalization captured in database/schema.sql:
--   * Remove audit system
--   * Remove optimistic locking (version columns)
--   * Drop derivable / unused columns (created_at where not needed, update tracking)
--   * Natural / shared primary keys for dependent + junction tables
--   * ENUM tightening (users.status, suspension_type)
-- Greenfield: direct DDL, no data migration. Never edit existing V1–V20 migrations.
-- =========================================================

-- ---------------------------------------------------------
-- Audit system removed
-- ---------------------------------------------------------
DROP TABLE IF EXISTS audit_logs;

-- ---------------------------------------------------------
-- universities — drop unused created_at
-- ---------------------------------------------------------
ALTER TABLE universities
    DROP COLUMN created_at;

-- ---------------------------------------------------------
-- users — drop update tracking; tighten status to an ENUM (default PENDING).
--   Rejection/suspension live elsewhere (student_profiles.rejection_reason,
--   student_restrictions), so user status is just ACTIVE / PENDING / DELETED.
-- ---------------------------------------------------------
ALTER TABLE users
    DROP COLUMN updated_at,
    MODIFY status ENUM('ACTIVE','PENDING','DELETED') NOT NULL DEFAULT 'PENDING';

-- ---------------------------------------------------------
-- student_profiles — drop reviewer tracking, trust-level cache, update/creation
--   timestamps. Trust level is derivable from trust_score; keep rejection_reason.
-- ---------------------------------------------------------
ALTER TABLE student_profiles
    DROP FOREIGN KEY fk_student_profiles_reviewed_by;
ALTER TABLE student_profiles
    DROP INDEX idx_student_profiles_reviewed_by;
ALTER TABLE student_profiles
    DROP COLUMN reviewed_by_user_id,
    DROP COLUMN reviewed_at,
    DROP COLUMN trust_level,
    DROP COLUMN last_trust_update_at,
    DROP COLUMN updated_at,
    DROP COLUMN created_at;

-- ---------------------------------------------------------
-- student_restrictions — shared PK redesign + slim columns.
--   Greenfield: drop and recreate with student_user_id as the natural PK.
-- ---------------------------------------------------------
DROP TABLE IF EXISTS student_restrictions;
CREATE TABLE student_restrictions (
    -- Shared primary key: a restriction is a dependent 0..1 extension of a student profile.
    student_user_id       BIGINT       PRIMARY KEY,
    suspension_type       ENUM('7_DAYS','15_DAYS','PERMANENT') NULL,
    suspension_reason     VARCHAR(500) NULL,
    suspended_at          DATETIME     NULL,
    suspended_until       DATETIME     NULL,
    scheduled_deletion_at DATETIME     NULL,
    CONSTRAINT fk_student_restrictions_student
        FOREIGN KEY (student_user_id) REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    INDEX idx_student_restrictions_suspended_until       (suspended_until),
    INDEX idx_student_restrictions_scheduled_deletion_at (scheduled_deletion_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- otp_tokens — drop derivable status + optimistic locking + verified_at + created_at;
--   rename attempt_count → resend_count (resend cooldown counter, not failure counter).
--   Greenfield: drop and recreate.
-- ---------------------------------------------------------
DROP TABLE IF EXISTS otp_tokens;
CREATE TABLE otp_tokens (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(150) NOT NULL,
    token_purpose VARCHAR(50)  NOT NULL DEFAULT 'EMAIL_VERIFICATION',
    resend_count  INT          NOT NULL DEFAULT 0,
    otp_hash      VARCHAR(255) NOT NULL,
    expires_at    DATETIME     NOT NULL,
    used_at       DATETIME     NULL,
    last_sent_at  DATETIME     NULL,
    INDEX idx_otp_email_purpose (email, token_purpose),
    INDEX idx_otp_expires_at    (expires_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- categories — drop unused created_at
-- ---------------------------------------------------------
ALTER TABLE categories
    DROP COLUMN created_at;

-- ---------------------------------------------------------
-- items — remove optimistic locking + update tracking
-- ---------------------------------------------------------
ALTER TABLE items
    DROP COLUMN updated_at,
    DROP COLUMN version;

-- ---------------------------------------------------------
-- bookings — remove approval timestamp, update tracking, optimistic locking
-- ---------------------------------------------------------
ALTER TABLE bookings
    DROP COLUMN approved_at,
    DROP COLUMN updated_at,
    DROP COLUMN version;

-- ---------------------------------------------------------
-- reviews — drop reviewee_id (owner reputation derived from average item rating)
-- ---------------------------------------------------------
ALTER TABLE reviews
    DROP FOREIGN KEY fk_reviews_reviewee;
ALTER TABLE reviews
    DROP INDEX idx_reviews_reviewee_id;
ALTER TABLE reviews
    DROP COLUMN reviewee_id;

-- ---------------------------------------------------------
-- trust_events — old_score derivable, events are system-generated
-- ---------------------------------------------------------
ALTER TABLE trust_events
    DROP FOREIGN KEY fk_trust_events_created_by;
ALTER TABLE trust_events
    DROP INDEX idx_trust_events_created_by_user_id;
ALTER TABLE trust_events
    DROP COLUMN old_score,
    DROP COLUMN created_by_user_id;

-- ---------------------------------------------------------
-- notifications — creator identity dropped (system-generated)
-- ---------------------------------------------------------
ALTER TABLE notifications
    DROP FOREIGN KEY fk_notifications_created_by;
ALTER TABLE notifications
    DROP INDEX idx_notifications_created_by_user_id;
ALTER TABLE notifications
    DROP COLUMN created_by_user_id;

-- ---------------------------------------------------------
-- conversations — clearing feature removed; keep delete flags + update tracking dropped
-- ---------------------------------------------------------
ALTER TABLE conversations
    DROP COLUMN updated_at,
    DROP COLUMN participant_one_cleared_at,
    DROP COLUMN participant_two_cleared_at;

-- ---------------------------------------------------------
-- messages — editing unsupported
-- ---------------------------------------------------------
ALTER TABLE messages
    DROP COLUMN updated_at;

-- ---------------------------------------------------------
-- files — drop unused created_at
-- ---------------------------------------------------------
ALTER TABLE files
    DROP COLUMN created_at;

-- ---------------------------------------------------------
-- user_blocks — natural composite PK (blocker_id, blocked_id); drop surrogate id +
--   created_at. Greenfield: drop and recreate.
-- ---------------------------------------------------------
DROP TABLE IF EXISTS user_blocks;
CREATE TABLE user_blocks (
    blocker_id BIGINT NOT NULL,
    blocked_id BIGINT NOT NULL,
    PRIMARY KEY (blocker_id, blocked_id),
    CONSTRAINT chk_user_blocks_distinct CHECK (blocker_id <> blocked_id),
    CONSTRAINT fk_user_block_blocker FOREIGN KEY (blocker_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_block_blocked FOREIGN KEY (blocked_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_block_blocked (blocked_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- wishlist_items — natural composite PK (user_id, item_id); drop surrogate id +
--   created_at. Greenfield: drop and recreate.
-- ---------------------------------------------------------
DROP TABLE IF EXISTS wishlist_items;
CREATE TABLE wishlist_items (
    user_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, item_id),
    CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_item FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
    INDEX idx_wishlist_item (item_id)
) ENGINE=InnoDB;
