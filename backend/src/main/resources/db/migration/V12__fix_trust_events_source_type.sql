-- =========================================================
-- ResourceX — V12: Fix trust_events source_type
-- =========================================================
-- Alters trust_events.source_type to be VARCHAR(30) to properly
-- align with the TrustEvent JPA entity and prevent truncation
-- errors when new enum values (like BOOKING) are inserted.
-- =========================================================

ALTER TABLE trust_events MODIFY COLUMN source_type VARCHAR(30) NOT NULL;
