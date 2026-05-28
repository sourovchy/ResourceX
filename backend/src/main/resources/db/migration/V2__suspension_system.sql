-- =========================================================
-- ResourceX — V2: Suspension System + Role Seed Fix
-- =========================================================

-- 1. Add suspension fields to users table
ALTER TABLE users
    ADD COLUMN suspension_type          VARCHAR(30)  NULL,
    ADD COLUMN suspension_reason        VARCHAR(500) NULL,
    ADD COLUMN suspended_at             DATETIME     NULL,
    ADD COLUMN suspended_until          DATETIME     NULL,
    ADD COLUMN suspended_by_user_id     BIGINT       NULL,
    ADD COLUMN scheduled_deletion_at    DATETIME     NULL,
    ADD INDEX  idx_users_suspended_until        (suspended_until),
    ADD INDEX  idx_users_scheduled_deletion_at  (scheduled_deletion_at),
    ADD CONSTRAINT fk_users_suspended_by
        FOREIGN KEY (suspended_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL;

-- 2. Seed all required roles (INSERT IGNORE is safe to re-run)
INSERT IGNORE INTO roles (name) VALUES
    ('ROLE_USER'),
    ('ROLE_ADMIN'),
    ('ROLE_MODERATOR'),
    ('ROLE_SUPER_ADMIN');
