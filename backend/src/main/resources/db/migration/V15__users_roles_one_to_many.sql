-- =========================================================
-- ResourceX — V15: Users–Roles one-to-many
-- =========================================================
-- Business rule: each user has EXACTLY ONE role; a role may be
-- assigned to many users (1 Role → 0..N Users; Users total participation).
-- Replaces the M:N `user_roles` associative table with a direct
-- `users.role_id` foreign key.
-- =========================================================

-- 1. Add the role reference (nullable for backfill)
ALTER TABLE users
    ADD COLUMN role_id BIGINT NULL AFTER status;

-- 2. Backfill from existing assignments.
--    If a user somehow had multiple rows, keep the lowest role_id deterministically.
UPDATE users u
JOIN (
    SELECT user_id, MIN(role_id) AS role_id
    FROM user_roles
    GROUP BY user_id
) ur ON ur.user_id = u.user_id
SET u.role_id = ur.role_id;

-- 3. Any user without an assignment defaults to ROLE_USER (total participation).
UPDATE users u
SET u.role_id = (SELECT role_id FROM roles WHERE name = 'ROLE_USER' LIMIT 1)
WHERE u.role_id IS NULL;

-- 4. Enforce total participation: every user must have a role.
ALTER TABLE users
    MODIFY COLUMN role_id BIGINT NOT NULL;

-- 5. Index + foreign key. No ON DELETE action → a role with users cannot be deleted.
ALTER TABLE users
    ADD INDEX idx_users_role_id (role_id),
    ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(role_id);

-- 6. Drop the obsolete associative table.
DROP TABLE user_roles;
