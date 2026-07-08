-- V28__ensure_item_availability_scope.sql
DROP PROCEDURE IF EXISTS AddAvailabilityScopeColumn;

DELIMITER //

CREATE PROCEDURE AddAvailabilityScopeColumn()
BEGIN
    DECLARE col_exists INT;

    SELECT COUNT(*)
    INTO col_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'items'
      AND COLUMN_NAME = 'availability_scope';

    IF col_exists = 0 THEN
        ALTER TABLE items ADD COLUMN availability_scope VARCHAR(50) NOT NULL DEFAULT 'CAMPUS_ONLY';
    END IF;
END //

DELIMITER ;

CALL AddAvailabilityScopeColumn();
DROP PROCEDURE AddAvailabilityScopeColumn;
