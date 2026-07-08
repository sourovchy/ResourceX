-- Drop bookings approval dependencies
ALTER TABLE bookings DROP FOREIGN KEY fk_bookings_approved_by;
ALTER TABLE bookings DROP COLUMN approved_by_user_id;
