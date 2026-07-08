-- V13__add_item_availability_scope.sql

ALTER TABLE items
ADD COLUMN availability_scope VARCHAR(50) NOT NULL DEFAULT 'CAMPUS_ONLY';
