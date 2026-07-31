-- =========================================================
-- V38 — Refactor files table schema for redesigned FileMetadata
-- =========================================================

-- 1. Add new columns user_id and file_url (initially nullable to allow backfill)
ALTER TABLE files
    ADD COLUMN user_id BIGINT NULL AFTER file_id,
    ADD COLUMN file_url VARCHAR(500) NULL AFTER item_id;

-- 2. Backfill user_id from uploader_id
UPDATE files SET user_id = uploader_id;

-- 3. Backfill file_url from stored_name by prefixing the HTTP endpoint path
UPDATE files SET file_url = CONCAT('/api/files/', stored_name);

-- 4. Alter file_url to be NOT NULL now that it contains backfilled data
ALTER TABLE files
    MODIFY COLUMN file_url VARCHAR(500) NOT NULL;

-- 5. Drop the old foreign key constraint
ALTER TABLE files
    DROP FOREIGN KEY fk_files_uploader;

-- 6. Drop the indexes associated with dropped columns
ALTER TABLE files
    DROP INDEX idx_files_uploader_id,
    DROP INDEX idx_files_stored_name;

-- 7. Add new index for user_id to optimize queries
ALTER TABLE files
    ADD INDEX idx_files_user_id (user_id);

-- 8. Add the new foreign key constraint for user_id pointing to users
ALTER TABLE files
    ADD CONSTRAINT fk_files_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL;

-- 9. Drop the legacy/unused columns from the files table
ALTER TABLE files
    DROP COLUMN uploader_id,
    DROP COLUMN stored_name,
    DROP COLUMN original_name,
    DROP COLUMN file_type,
    DROP COLUMN file_size;
