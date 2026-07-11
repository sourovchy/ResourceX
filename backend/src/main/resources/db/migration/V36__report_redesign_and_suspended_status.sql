-- =========================================================
-- V36 — Report table redesign + SUSPENDED user status
-- =========================================================

-- 1. Add SUSPENDED to users.status ENUM
ALTER TABLE users
    MODIFY status ENUM('ACTIVE','PENDING','DELETED','SUSPENDED') NOT NULL DEFAULT 'PENDING';

-- 2. Redesign reports table
--    Drop old FK and polymorphic columns
ALTER TABLE reports
    DROP FOREIGN KEY fk_reports_reporter,
    DROP INDEX idx_reports_entity,
    DROP COLUMN entity_type,
    DROP COLUMN entity_id;

--    Make reporter_id nullable (ON DELETE SET NULL — keep report when reporter is deleted)
ALTER TABLE reports
    MODIFY COLUMN reporter_id BIGINT NULL,
    ADD COLUMN reported_user_id BIGINT NULL AFTER reporter_id,
    ADD COLUMN reported_item_id BIGINT NULL AFTER reported_user_id,
    ADD COLUMN status ENUM('PENDING','RESOLVED','DISMISSED') NOT NULL DEFAULT 'PENDING' AFTER reason,
    ADD COLUMN resolved_at DATETIME NULL AFTER status,
    ADD CONSTRAINT fk_reports_reporter
        FOREIGN KEY (reporter_id) REFERENCES users(user_id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_reports_reported_user
        FOREIGN KEY (reported_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_reports_reported_item
        FOREIGN KEY (reported_item_id) REFERENCES items(item_id) ON DELETE SET NULL,
    ADD INDEX idx_reports_status (status),
    ADD INDEX idx_reports_reported_user (reported_user_id),
    ADD INDEX idx_reports_reported_item (reported_item_id);
