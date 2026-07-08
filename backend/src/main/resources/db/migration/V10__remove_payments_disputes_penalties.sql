-- =========================================================
-- V10 — Remove payment / deposit / dispute / penalty infrastructure
-- No-payment refactor (Phases 1–2). ResourceX is a face-to-face
-- rental platform: no online payments, deposits, escrow, refunds,
-- or automated penalties. Discipline is handled via reports + trust.
-- =========================================================

-- 1) Decouple conversations from disputes.
--    Drop the FK first; dropping the column also removes idx_conversations_dispute_id.
ALTER TABLE conversations DROP FOREIGN KEY fk_conversations_dispute;
ALTER TABLE conversations DROP COLUMN dispute_id;

-- 2) Drop the payment / dispute / penalty tables.
--    Order matters: penalties references disputes, so it must go first.
DROP TABLE IF EXISTS penalties;
DROP TABLE IF EXISTS disputes;
DROP TABLE IF EXISTS payments;

-- 3) Remove the per-item security deposit field.
ALTER TABLE items DROP COLUMN deposit;

-- 4) Booking lifecycle: REJECTED is folded into CANCELLED
--    (statuses are now PENDING, APPROVED, ACTIVE, COMPLETED, CANCELLED).
UPDATE bookings SET status = 'CANCELLED' WHERE status = 'REJECTED';
