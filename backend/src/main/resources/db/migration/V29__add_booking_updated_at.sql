-- V29__add_booking_updated_at.sql
DROP PROCEDURE IF EXISTS AddUpdatedAtColumn;

DELIMITER //

CREATE PROCEDURE AddUpdatedAtColumn()
BEGIN
    DECLARE col_exists INT;

    SELECT COUNT(*)
    INTO col_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'bookings'
      AND COLUMN_NAME = 'updated_at';

    IF col_exists = 0 THEN
        ALTER TABLE bookings ADD COLUMN updated_at DATETIME NULL;
        UPDATE bookings SET updated_at = created_at WHERE updated_at IS NULL;
    END IF;
END //

DELIMITER ;

CALL AddUpdatedAtColumn();
DROP PROCEDURE AddUpdatedAtColumn;
