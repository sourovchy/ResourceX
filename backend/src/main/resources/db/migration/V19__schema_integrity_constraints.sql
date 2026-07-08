-- =========================================================
-- ResourceX — V19: Schema integrity constraints
-- =========================================================
-- Tightens the schema to match business rules:
--   1. Every item must belong to a category.
--   2. One review per (booking, reviewer).
--   3. Ratings restricted to 1..5.
--   4. One conversation per user pair (dedup; canonical order enforced in app layer).
--   5. No self-conversations.
--   6. No self-blocking.
--   7. Drop obsolete DISPUTE/PENALTY notification enum values (modules removed in V10).
--   9. Rename trust_events.user_id → student_user_id (trust is student-only).
-- (#8 review-ownership = reviewee must equal item owner — enforced in the app layer.)
--
-- NOTE: the UNIQUE / CHECK additions assume no pre-existing violating rows
-- (duplicate reviews, out-of-range ratings, duplicate pairs, self-rows). On a
-- dirty database these will fail and the offending data must be cleaned first.
-- =========================================================

-- ---- 1. Category mandatory for every item ----
INSERT IGNORE INTO categories (name, description, created_at)
    VALUES ('Uncategorized', 'Fallback category for items that had no category.', NOW());

UPDATE items
SET category_id = (SELECT category_id FROM categories WHERE name = 'Uncategorized' LIMIT 1)
WHERE category_id IS NULL;

ALTER TABLE items DROP FOREIGN KEY fk_items_category;
ALTER TABLE items MODIFY COLUMN category_id BIGINT NOT NULL;
ALTER TABLE items
    ADD CONSTRAINT fk_items_category FOREIGN KEY (category_id)
        REFERENCES categories(category_id) ON DELETE RESTRICT;

-- ---- 2 & 3. Reviews: one per (booking, reviewer); rating in 1..5 ----
ALTER TABLE reviews
    ADD CONSTRAINT uk_reviews_booking_reviewer UNIQUE (booking_id, reviewer_id),
    ADD CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5);

-- ---- 4 & 5. Conversations: dedup + no self-conversation ----
-- App layer stores participants canonically (participant_one < participant_two) so the
-- UNIQUE pair actually dedupes (A,B)/(B,A).
ALTER TABLE conversations
    ADD CONSTRAINT uk_conversations_participants UNIQUE (participant_one_user_id, participant_two_user_id),
    ADD CONSTRAINT chk_conversations_distinct CHECK (participant_one_user_id <> participant_two_user_id);

-- ---- 6. No self-blocking ----
ALTER TABLE user_blocks
    ADD CONSTRAINT chk_user_blocks_distinct CHECK (blocker_id <> blocked_id);

-- ---- 7. Remove obsolete notification enum values ----
DELETE FROM notifications
WHERE notification_type IN ('DISPUTE', 'PENALTY')
   OR related_entity_type IN ('DISPUTE', 'PENALTY');

ALTER TABLE notifications
    MODIFY COLUMN notification_type
        ENUM('BOOKING', 'TRUST', 'ADMIN', 'MESSAGE', 'REVIEW') NOT NULL,
    MODIFY COLUMN related_entity_type
        ENUM('BOOKING', 'TRUST', 'ITEM', 'ADMIN', 'MESSAGE', 'REVIEW') NOT NULL;

-- ---- 9. Rename trust_events.user_id → student_user_id ----
ALTER TABLE trust_events DROP FOREIGN KEY fk_trust_events_student_profile;
ALTER TABLE trust_events DROP INDEX idx_trust_events_user_id;
ALTER TABLE trust_events CHANGE COLUMN user_id student_user_id BIGINT NOT NULL;
ALTER TABLE trust_events
    ADD INDEX idx_trust_events_student_user_id (student_user_id),
    ADD CONSTRAINT fk_trust_events_student_profile FOREIGN KEY (student_user_id)
        REFERENCES student_profiles(user_id) ON DELETE CASCADE;
