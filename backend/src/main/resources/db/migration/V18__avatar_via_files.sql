-- =========================================================
-- ResourceX — V18: Avatars via the Files entity (single source of truth)
-- =========================================================
-- `users.avatar_url` duplicated avatar storage that already lives in `files`
-- (purpose = 'AVATAR'). Replace the free-text URL with a relationship to files,
-- mirroring student_profiles.id_card_file_id and items' image files. Files stays
-- the one place that owns uploaded resources; `purpose` distinguishes
-- AVATAR / ITEM_IMAGE / ID_CARD.
-- =========================================================

-- 1. Add the avatar file reference.
ALTER TABLE users
    ADD COLUMN avatar_file_id BIGINT NULL AFTER avatar_url;

-- 2. Backfill from the user's most recent AVATAR upload.
UPDATE users u
JOIN (
    SELECT uploader_id, MAX(file_id) AS file_id
    FROM files
    WHERE purpose = 'AVATAR'
    GROUP BY uploader_id
) f ON f.uploader_id = u.user_id
SET u.avatar_file_id = f.file_id;

-- 3. Index + FK. Deleting the file just clears the pointer (matches id_card_file_id).
ALTER TABLE users
    ADD INDEX idx_users_avatar_file_id (avatar_file_id),
    ADD CONSTRAINT fk_users_avatar FOREIGN KEY (avatar_file_id) REFERENCES files(file_id) ON DELETE SET NULL;

-- 4. Drop the duplicate source of truth.
ALTER TABLE users
    DROP COLUMN avatar_url;
