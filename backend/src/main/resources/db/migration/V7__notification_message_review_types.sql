-- =========================================================
-- Extend notification ENUMs to cover messaging and reviews.
-- Additive only — existing values are preserved.
-- =========================================================

ALTER TABLE notifications
    MODIFY COLUMN notification_type
        ENUM('BOOKING', 'DISPUTE', 'PENALTY', 'TRUST', 'ADMIN', 'MESSAGE', 'REVIEW') NOT NULL;

ALTER TABLE notifications
    MODIFY COLUMN related_entity_type
        ENUM('BOOKING', 'DISPUTE', 'PENALTY', 'TRUST', 'ITEM', 'ADMIN', 'MESSAGE', 'REVIEW') NOT NULL;
