-- =========================================================
-- ResourceX — V4: Normalize ID Card Storage
-- =========================================================

-- 1. Remove redundant field from student_profiles
ALTER TABLE student_profiles
    DROP COLUMN id_card_data_url;

-- 2. Modify pending_users to use centralized files table
ALTER TABLE pending_users
    DROP COLUMN id_card_data_url,
    ADD COLUMN id_card_file_id BIGINT NULL;

-- 3. Add index and foreign key constraint for data integrity
ALTER TABLE pending_users
    ADD INDEX idx_pending_users_id_card_file_id (id_card_file_id),
    ADD CONSTRAINT fk_pending_users_id_card 
        FOREIGN KEY (id_card_file_id) REFERENCES files(file_id) ON DELETE SET NULL;
