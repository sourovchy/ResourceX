-- =========================================================
-- User blocking system
-- A directed block: `blocker_id` has blocked `blocked_id`.
-- A block in EITHER direction prevents messaging between the pair.
-- =========================================================

CREATE TABLE user_blocks (
    user_block_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    blocker_id    BIGINT   NOT NULL,
    blocked_id    BIGINT   NOT NULL,
    created_at    DATETIME NOT NULL,

    -- A user cannot block the same user twice
    UNIQUE KEY uc_user_block_pair (blocker_id, blocked_id),

    CONSTRAINT fk_user_block_blocker
        FOREIGN KEY (blocker_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_block_blocked
        FOREIGN KEY (blocked_id) REFERENCES users(user_id) ON DELETE CASCADE,

    INDEX idx_user_block_blocker (blocker_id),
    INDEX idx_user_block_blocked (blocked_id)
) ENGINE=InnoDB;
