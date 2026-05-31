ALTER TABLE bookings
    ADD COLUMN booking_message VARCHAR(1000) NULL AFTER rejection_reason;
