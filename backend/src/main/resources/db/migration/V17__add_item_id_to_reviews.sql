-- =========================================================
-- ResourceX — V17: Associate reviews directly with items
-- =========================================================
-- A review evaluates both the item owner (reviewee_id) and the rented item.
-- The item was only reachable indirectly via bookings; add a direct reviews.item_id
-- so item-level aggregation (avg rating, review count, recent reviews on the item
-- page) needs no join through bookings.
-- =========================================================

-- 1. Add the item reference (nullable for backfill).
ALTER TABLE reviews
    ADD COLUMN item_id BIGINT NULL AFTER booking_id;

-- 2. Backfill from the originating booking.
UPDATE reviews r
JOIN bookings b ON b.booking_id = r.booking_id
SET r.item_id = b.item_id;

-- 3. Enforce presence: every review belongs to an item.
ALTER TABLE reviews
    MODIFY COLUMN item_id BIGINT NOT NULL;

-- 4. Index + FK. Deleting an item removes its reviews.
ALTER TABLE reviews
    ADD INDEX idx_reviews_item_id (item_id),
    ADD CONSTRAINT fk_reviews_item FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE;
