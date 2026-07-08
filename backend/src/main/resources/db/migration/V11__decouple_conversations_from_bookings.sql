-- =========================================================
-- V11 — Messaging decoupling (Phase 3b)
-- A conversation is purely User A <-> User B; it no longer
-- belongs to a booking. Drop the booking_id coupling.
-- (dispute_id was already removed in V10.)
-- =========================================================

ALTER TABLE conversations DROP FOREIGN KEY fk_conversations_booking;
ALTER TABLE conversations DROP COLUMN booking_id;
