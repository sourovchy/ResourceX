-- =========================================================
-- ResourceX — V16: Move trust/suspension/restriction to the student domain
-- =========================================================
-- Business rule: trust scores, restrictions, and suspensions apply ONLY to
-- student marketplace participants — not to admins/moderators/super-admins,
-- who are removed directly. `users` keeps only general account info + `status`
-- (ACTIVE/INACTIVE/DELETED apply to everyone). All suspension/restriction
-- attributes move to `student_profiles`, and `trust_events` now hangs off the
-- student profile rather than the generic user.
--
-- NOTE: all suspension columns move together (including suspended_by_user_id and
-- scheduled_deletion_at) — splitting them from suspended_at would leave incoherent
-- suspension metadata on `users`.
-- =========================================================

-- 1. Add the suspension/restriction columns to student_profiles.
ALTER TABLE student_profiles
    ADD COLUMN suspension_type               VARCHAR(30)  NULL,
    ADD COLUMN suspension_reason             VARCHAR(500) NULL,
    ADD COLUMN suspended_at                  DATETIME     NULL,
    ADD COLUMN suspended_until               DATETIME     NULL,
    ADD COLUMN suspended_by_user_id          BIGINT       NULL,
    ADD COLUMN scheduled_deletion_at         DATETIME     NULL,
    ADD COLUMN suspension_count              INT          NOT NULL DEFAULT 0,
    ADD COLUMN trust_warning_sent            BOOLEAN      NOT NULL DEFAULT FALSE,
    ADD COLUMN automatic_restriction_enabled BOOLEAN      NOT NULL DEFAULT FALSE;

-- 2. Backfill from users for existing student rows (admin rows have no profile, so
--    their suspension data is intentionally dropped).
UPDATE student_profiles sp
JOIN users u ON u.user_id = sp.user_id
SET sp.suspension_type               = u.suspension_type,
    sp.suspension_reason             = u.suspension_reason,
    sp.suspended_at                  = u.suspended_at,
    sp.suspended_until               = u.suspended_until,
    sp.suspended_by_user_id          = u.suspended_by_user_id,
    sp.scheduled_deletion_at         = u.scheduled_deletion_at,
    sp.suspension_count              = u.suspension_count,
    sp.trust_warning_sent            = u.trust_warning_sent,
    sp.automatic_restriction_enabled = u.automatic_restriction_enabled;

-- 3. Indexes + FK on the new home (mirrors what users had; scheduler queries these).
ALTER TABLE student_profiles
    ADD INDEX idx_student_profiles_suspended_until      (suspended_until),
    ADD INDEX idx_student_profiles_scheduled_deletion_at (scheduled_deletion_at),
    ADD CONSTRAINT fk_student_profiles_suspended_by
        FOREIGN KEY (suspended_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL;

-- 4. Remove the columns (and their index/FK) from users.
ALTER TABLE users DROP FOREIGN KEY fk_users_suspended_by;
ALTER TABLE users
    DROP INDEX idx_users_suspended_until,
    DROP INDEX idx_users_scheduled_deletion_at,
    DROP COLUMN suspension_type,
    DROP COLUMN suspension_reason,
    DROP COLUMN suspended_at,
    DROP COLUMN suspended_until,
    DROP COLUMN suspended_by_user_id,
    DROP COLUMN scheduled_deletion_at,
    DROP COLUMN suspension_count,
    DROP COLUMN trust_warning_sent,
    DROP COLUMN automatic_restriction_enabled;

-- 5. Re-point trust_events at the student profile (trust events only exist for students).
--    Column stays user_id (== student_profiles PK); only the FK target changes.
ALTER TABLE trust_events DROP FOREIGN KEY fk_trust_events_user;
ALTER TABLE trust_events
    ADD CONSTRAINT fk_trust_events_student_profile
        FOREIGN KEY (user_id) REFERENCES student_profiles(user_id) ON DELETE CASCADE;
