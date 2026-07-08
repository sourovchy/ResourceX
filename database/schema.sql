-- =========================================================
-- ResourceX — Baseline Schema (V1)
-- Generated from entity state as of 2026-05-28
-- Applied automatically to fresh databases by Flyway.
-- Existing databases are baselined via flyway.baseline-on-migrate=true.
-- =========================================================

-- =========================================================
-- 1. UNIVERSITIES
-- =========================================================

CREATE TABLE universities (
    university_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(150) NOT NULL UNIQUE,
    domain        VARCHAR(100) UNIQUE,
    is_verified   BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB;

-- =========================================================
-- 2. USERS, RBAC, STUDENT PROFILES
-- =========================================================

CREATE TABLE users (
    user_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(120) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    -- Avatar lives in the centralized files table (purpose='AVATAR'). See fk_users_avatar below.
    avatar_file_id BIGINT      NULL,
    -- `status` (ACTIVE/PENDING/SUSPENDED/DELETED) applies to all user types. Trust/suspension
    -- attributes live on student_profiles — only students participate in the trust system.
    status        ENUM('ACTIVE','PENDING','SUSPENDED','DELETED') NOT NULL DEFAULT 'PENDING',
    -- One user → exactly one role (total participation). See roles table / fk_users_role below.
    role_id       BIGINT       NOT NULL,
    created_at    DATETIME     NOT NULL,
    INDEX idx_users_email  (email),
    INDEX idx_users_status (status),
    INDEX idx_users_role_id (role_id),
    INDEX idx_users_avatar_file_id (avatar_file_id)
) ENGINE=InnoDB;

CREATE TABLE roles (
    role_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Direct one-to-many: users.role_id → roles.role_id. A role with users cannot be deleted.
-- (Declared after `roles` exists, since `users` is created first.)
ALTER TABLE users
    ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(role_id);

CREATE TABLE student_profiles (
    user_id         BIGINT PRIMARY KEY,
    student_id      VARCHAR(50)  NOT NULL UNIQUE,
    phone           VARCHAR(20)  NOT NULL UNIQUE,
    university_id   BIGINT       NULL,
    department      VARCHAR(100),
    trust_score     INT          NOT NULL DEFAULT 100,
    email_verified  BOOLEAN      NOT NULL DEFAULT FALSE,
    phone_verified  BOOLEAN      NOT NULL DEFAULT FALSE,
    id_card_file_id  BIGINT      NULL,
    -- If a verification request is rejected, the only retained context is the reason.
    rejection_reason TEXT        NULL,
    CONSTRAINT fk_student_profiles_user       FOREIGN KEY (user_id)       REFERENCES users(user_id)        ON DELETE CASCADE,
    CONSTRAINT fk_student_profiles_university FOREIGN KEY (university_id) REFERENCES universities(university_id) ON DELETE SET NULL,
    CONSTRAINT fk_student_profiles_id_card    FOREIGN KEY (id_card_file_id) REFERENCES files(file_id) ON DELETE SET NULL,
    INDEX idx_student_profiles_university_id (university_id),
    INDEX idx_student_profiles_student_id    (student_id),
    INDEX idx_student_profiles_phone         (phone),
    INDEX idx_student_profiles_id_card_file_id (id_card_file_id)
) ENGINE=InnoDB;

-- Moderation / suspension state, split out of student_profiles (V20).
-- Student_Profile (1) ── has ── Student_Restriction (0..1).
CREATE TABLE student_restrictions (
    -- Shared primary key: a restriction is a dependent 0..1 extension of a student profile.
    student_user_id               BIGINT       PRIMARY KEY,
    suspension_reason             VARCHAR(500) NULL,
    suspended_at                  DATETIME     NULL,
    suspended_until               DATETIME     NULL,
    scheduled_deletion_at         DATETIME     NULL,
    CONSTRAINT fk_student_restrictions_student
        FOREIGN KEY (student_user_id) REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    INDEX idx_student_restrictions_suspended_until       (suspended_until),
    INDEX idx_student_restrictions_scheduled_deletion_at (scheduled_deletion_at)
) ENGINE=InnoDB;

-- OTP status is derived: used_at != NULL → USED; expires_at < NOW() → EXPIRED; else ACTIVE.
-- resend_count limits OTP resend requests/cooldowns; it is not a failed-verification counter.
CREATE TABLE otp_tokens (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(150) NOT NULL,
    token_purpose VARCHAR(50)  NOT NULL DEFAULT 'EMAIL_VERIFICATION',
    resend_count  INT          NOT NULL DEFAULT 0,
    otp_hash      VARCHAR(255) NOT NULL,
    expires_at    DATETIME     NOT NULL,
    used_at       DATETIME     NULL,
    last_sent_at  DATETIME     NULL,
    INDEX idx_otp_email_purpose (email, token_purpose),
    INDEX idx_otp_expires_at    (expires_at)
) ENGINE=InnoDB;

-- =========================================================
-- 3. CATEGORIES & ITEMS
-- =========================================================

CREATE TABLE categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(120) NOT NULL UNIQUE,
    description TEXT
) ENGINE=InnoDB;

CREATE TABLE items (
    item_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id       BIGINT         NOT NULL,
    title          VARCHAR(150)   NOT NULL,
    description    TEXT,
    -- Every item must belong to exactly one category.
    category_id    BIGINT         NOT NULL,
    item_condition VARCHAR(80),
    daily_rate     DECIMAL(10,2)  NOT NULL,
    status         VARCHAR(40)    NOT NULL DEFAULT 'AVAILABLE',
    availability_scope VARCHAR(50)    NOT NULL DEFAULT 'CAMPUS_ONLY',
    created_at     DATETIME       NOT NULL,
    CONSTRAINT fk_items_owner    FOREIGN KEY (owner_id)    REFERENCES users(user_id)      ON DELETE CASCADE,
    CONSTRAINT fk_items_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    INDEX idx_items_owner      (owner_id),
    INDEX idx_items_status     (status),
    INDEX idx_items_category   (category_id),
    INDEX idx_items_created_at (created_at)
) ENGINE=InnoDB;

-- =========================================================
-- 4. BOOKINGS & FINANCIALS
-- =========================================================

CREATE TABLE bookings (
    booking_id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id             BIGINT         NOT NULL,
    renter_id           BIGINT         NOT NULL,
    status              VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    start_date          DATE           NOT NULL,
    end_date            DATE           NOT NULL,
    returned_date       DATE           NULL,
    total_price         DECIMAL(10,2)  NOT NULL,
    rejection_reason    VARCHAR(1000)  NULL,
    booking_message     VARCHAR(1000)  NULL,
    created_at          DATETIME       NOT NULL,
    updated_at          DATETIME       NULL,
    CONSTRAINT fk_bookings_item        FOREIGN KEY (item_id)             REFERENCES items(item_id)   ON DELETE CASCADE,
    CONSTRAINT fk_bookings_renter      FOREIGN KEY (renter_id)           REFERENCES users(user_id)   ON DELETE CASCADE,
    INDEX idx_bookings_status (status),
    INDEX idx_bookings_item   (item_id),
    INDEX idx_bookings_renter (renter_id)
) ENGINE=InnoDB;

-- =========================================================
-- 5. REVIEWS, REPORTS & LOGISTICS
-- =========================================================

CREATE TABLE reviews (
    review_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id  BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    rating      INT    NOT NULL,
    comment     TEXT,
    created_at  DATETIME NOT NULL,
    -- One review per (booking, reviewer); rating constrained to 1..5.
    -- Owner reputation is derived from the average rating of all items they own.
    CONSTRAINT uk_reviews_booking_reviewer UNIQUE (booking_id, reviewer_id),
    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT fk_reviews_booking  FOREIGN KEY (booking_id)  REFERENCES bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(user_id)       ON DELETE CASCADE,
    INDEX idx_reviews_booking_id  (booking_id),
    INDEX idx_reviews_reviewer_id (reviewer_id)
) ENGINE=InnoDB;

CREATE TABLE reports (
    report_id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    reporter_id         BIGINT      NOT NULL,
    entity_type         VARCHAR(20) NOT NULL,
    entity_id           BIGINT      NOT NULL,
    reason              TEXT        NOT NULL,
    created_at          DATETIME    NOT NULL,
    CONSTRAINT fk_reports_reporter    FOREIGN KEY (reporter_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_reports_entity          (entity_type, entity_id)
) ENGINE=InnoDB;

-- =========================================================
-- 6. TRUST TRACKERS
-- =========================================================
-- 7. NOTIFICATIONS
-- =========================================================

CREATE TABLE notifications (
    notification_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT       NOT NULL,
    notification_type   ENUM('BOOKING', 'TRUST', 'ADMIN', 'MESSAGE', 'REVIEW') NOT NULL,
    message             TEXT         NOT NULL,
    related_entity_type ENUM('BOOKING', 'TRUST', 'ITEM', 'ADMIN', 'MESSAGE', 'REVIEW') NOT NULL,
    related_entity_id   BIGINT       NULL,
    is_read             BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at          DATETIME     NOT NULL,
    read_at             DATETIME     NULL,
    -- Notifications are system-generated; no creator identity tracked.
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_notifications_user_id        (user_id),
    INDEX idx_notifications_read           (is_read),
    INDEX idx_notifications_created_at     (created_at),
    INDEX idx_notifications_related_entity (related_entity_type, related_entity_id)
) ENGINE=InnoDB;

-- =========================================================
-- 8. MESSAGING
-- =========================================================

CREATE TABLE conversations (
    conversation_id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    participant_one_user_id  BIGINT   NOT NULL,
    participant_two_user_id  BIGINT   NOT NULL,
    last_message_at          DATETIME NULL,
    -- Conversation clearing dropped; delete/hide flags are sufficient.
    participant_one_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    participant_two_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    -- One conversation per user pair (app stores canonically: one < two); no self-conversations.
    CONSTRAINT uk_conversations_participants UNIQUE (participant_one_user_id, participant_two_user_id),
    CONSTRAINT chk_conversations_distinct CHECK (participant_one_user_id <> participant_two_user_id),
    CONSTRAINT fk_conversations_participant_one FOREIGN KEY (participant_one_user_id) REFERENCES users(user_id)       ON DELETE CASCADE,
    CONSTRAINT fk_conversations_participant_two FOREIGN KEY (participant_two_user_id) REFERENCES users(user_id)       ON DELETE CASCADE,
    INDEX idx_conversations_participant_one (participant_one_user_id),
    INDEX idx_conversations_participant_two (participant_two_user_id),
    INDEX idx_conversations_last_message_at (last_message_at)
) ENGINE=InnoDB;

CREATE TABLE messages (
    message_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id  BIGINT   NOT NULL,
    sender_user_id   BIGINT   NOT NULL,
    content          TEXT     NOT NULL,
    is_read          BOOLEAN  NOT NULL DEFAULT FALSE,
    created_at       DATETIME NOT NULL,
    CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id)  REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender       FOREIGN KEY (sender_user_id)   REFERENCES users(user_id)                ON DELETE CASCADE,
    INDEX idx_messages_conversation_id  (conversation_id),
    INDEX idx_messages_sender_user_id   (sender_user_id),
    INDEX idx_messages_is_read          (is_read),
    INDEX idx_messages_created_at       (created_at)
) ENGINE=InnoDB;

-- =========================================================
-- 9. USER BLOCKS
-- =========================================================

CREATE TABLE user_blocks (
    blocker_id    BIGINT NOT NULL,
    blocked_id    BIGINT NOT NULL,
    PRIMARY KEY (blocker_id, blocked_id),
    CONSTRAINT chk_user_blocks_distinct CHECK (blocker_id <> blocked_id),
    CONSTRAINT fk_user_block_blocker FOREIGN KEY (blocker_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_block_blocked FOREIGN KEY (blocked_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_block_blocked (blocked_id)
) ENGINE=InnoDB;

-- =========================================================
-- 10. FILE STORAGE
-- =========================================================

CREATE TABLE files (
    file_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    uploader_id   BIGINT       NULL,
    item_id       BIGINT       NULL,
    original_name VARCHAR(255) NOT NULL,
    stored_name   VARCHAR(255) NOT NULL UNIQUE,
    file_type     VARCHAR(100) NOT NULL,
    file_size     BIGINT       NOT NULL,
    purpose       VARCHAR(30)  NOT NULL,
    CONSTRAINT fk_files_uploader FOREIGN KEY (uploader_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_files_item     FOREIGN KEY (item_id)     REFERENCES items(item_id) ON DELETE CASCADE,
    INDEX idx_files_uploader_id (uploader_id),
    INDEX idx_files_stored_name (stored_name),
    INDEX idx_files_purpose     (purpose)
) ENGINE=InnoDB;

-- Avatar relationship: users.avatar_file_id → files.file_id (single source of truth for avatars).
-- Declared after `files` exists, since `users` is created first.
ALTER TABLE users
    ADD CONSTRAINT fk_users_avatar FOREIGN KEY (avatar_file_id) REFERENCES files(file_id) ON DELETE SET NULL;

-- =========================================================
-- 11. WISHLIST
-- =========================================================

CREATE TABLE wishlist_items (
    user_id     BIGINT   NOT NULL,
    item_id     BIGINT   NOT NULL,
    PRIMARY KEY (user_id, item_id),
    CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_item FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
    INDEX idx_wishlist_item (item_id)
) ENGINE=InnoDB;

-- =========================================================
-- Seed data: default roles
-- =========================================================

INSERT IGNORE INTO roles (name) VALUES
    ('ROLE_USER'),
    ('ROLE_ADMIN'),
    ('ROLE_MODERATOR'),
    ('ROLE_SUPER_ADMIN');
