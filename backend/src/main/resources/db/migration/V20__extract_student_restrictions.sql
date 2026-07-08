-- =========================================================
-- ResourceX — V20: Extract restrictions into student_restrictions
-- =========================================================
-- student_profiles had grown to mix identity + verification + trust + moderation.
-- Move the suspension/restriction subsystem (added to student_profiles in V16) into
-- its own table. Relationship: Student_Profile (1) ── has ── Student_Restriction (0..1).
-- A profile may have no restriction row; a restricted student has exactly one.
-- =========================================================

-- 1. New table owning all moderation/suspension state.
CREATE TABLE student_restrictions (
    restriction_id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_user_id               BIGINT       NOT NULL,
    suspension_type               VARCHAR(30)  NULL,
    suspension_reason             VARCHAR(500) NULL,
    suspended_at                  DATETIME     NULL,
    suspended_until               DATETIME     NULL,
    suspended_by_user_id          BIGINT       NULL,
    scheduled_deletion_at         DATETIME     NULL,
    suspension_count              INT          NOT NULL DEFAULT 0,
    trust_warning_sent            BOOLEAN      NOT NULL DEFAULT FALSE,
    automatic_restriction_enabled BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at                    DATETIME     NOT NULL,
    updated_at                    DATETIME     NOT NULL,
    -- 0..1 per student → one restriction row at most.
    CONSTRAINT uk_student_restrictions_student UNIQUE (student_user_id),
    CONSTRAINT fk_student_restrictions_student
        FOREIGN KEY (student_user_id) REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_student_restrictions_suspended_by
        FOREIGN KEY (suspended_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_student_restrictions_suspended_until       (suspended_until),
    INDEX idx_student_restrictions_scheduled_deletion_at (scheduled_deletion_at),
    INDEX idx_student_restrictions_suspended_by          (suspended_by_user_id)
) ENGINE=InnoDB;

-- 2. Backfill — only profiles that actually carry restriction state get a row.
INSERT INTO student_restrictions (
    student_user_id, suspension_type, suspension_reason, suspended_at, suspended_until,
    suspended_by_user_id, scheduled_deletion_at, suspension_count, trust_warning_sent,
    automatic_restriction_enabled, created_at, updated_at)
SELECT sp.user_id, sp.suspension_type, sp.suspension_reason, sp.suspended_at, sp.suspended_until,
       sp.suspended_by_user_id, sp.scheduled_deletion_at, sp.suspension_count, sp.trust_warning_sent,
       sp.automatic_restriction_enabled, NOW(), NOW()
FROM student_profiles sp
WHERE sp.suspension_type            IS NOT NULL
   OR sp.suspended_at               IS NOT NULL
   OR sp.suspended_until            IS NOT NULL
   OR sp.scheduled_deletion_at      IS NOT NULL
   OR sp.suspension_count            <> 0
   OR sp.trust_warning_sent          <> FALSE
   OR sp.automatic_restriction_enabled <> FALSE;

-- 3. Drop the moved columns (and their index/FK) from student_profiles.
ALTER TABLE student_profiles DROP FOREIGN KEY fk_student_profiles_suspended_by;
ALTER TABLE student_profiles
    DROP INDEX idx_student_profiles_suspended_until,
    DROP INDEX idx_student_profiles_scheduled_deletion_at,
    DROP COLUMN suspension_type,
    DROP COLUMN suspension_reason,
    DROP COLUMN suspended_at,
    DROP COLUMN suspended_until,
    DROP COLUMN suspended_by_user_id,
    DROP COLUMN scheduled_deletion_at,
    DROP COLUMN suspension_count,
    DROP COLUMN trust_warning_sent,
    DROP COLUMN automatic_restriction_enabled;
