-- Phase 1: Flyway migration + schema
-- Add review-metadata columns to student_profiles
ALTER TABLE student_profiles
    ADD COLUMN reviewed_by_user_id BIGINT NULL,
    ADD COLUMN reviewed_at DATETIME NULL,
    ADD COLUMN rejection_reason TEXT NULL;

-- Add FK and index for reviewed_by_user_id
ALTER TABLE student_profiles
    ADD CONSTRAINT fk_student_profiles_reviewed_by
    FOREIGN KEY (reviewed_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL;

CREATE INDEX idx_student_profiles_reviewed_by ON student_profiles(reviewed_by_user_id);

-- Drop pending_users FKs first, then DROP TABLE pending_users
ALTER TABLE pending_users DROP FOREIGN KEY fk_pending_users_university;
ALTER TABLE pending_users DROP FOREIGN KEY fk_pending_users_reviewed_by;
ALTER TABLE pending_users DROP FOREIGN KEY fk_pending_users_id_card;

DROP TABLE pending_users;
