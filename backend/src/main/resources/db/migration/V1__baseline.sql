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
    is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    DATETIME NOT NULL
) ENGINE=InnoDB;

-- =========================================================
-- 2. USERS, RBAC, STUDENT PROFILES, PENDING USERS
-- =========================================================

CREATE TABLE users (
    user_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(120) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url    VARCHAR(1000),
    status        VARCHAR(40)  NOT NULL DEFAULT 'ACTIVE',
    created_at    DATETIME     NOT NULL,
    updated_at    DATETIME     NOT NULL,
    INDEX idx_users_email  (email),
    INDEX idx_users_status (status)
) ENGINE=InnoDB;

CREATE TABLE roles (
    role_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE user_roles (
    id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    UNIQUE KEY uk_user_roles_user_role (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    INDEX idx_user_roles_user_id (user_id),
    INDEX idx_user_roles_role_id (role_id)
) ENGINE=InnoDB;

CREATE TABLE student_profiles (
    user_id         BIGINT PRIMARY KEY,
    student_id      VARCHAR(50)  NOT NULL UNIQUE,
    phone           VARCHAR(20)  NOT NULL UNIQUE,
    university_id   BIGINT       NULL,
    department      VARCHAR(100),
    id_card_data_url LONGTEXT,
    trust_score     INT          NOT NULL DEFAULT 100,
    email_verified  BOOLEAN      NOT NULL DEFAULT FALSE,
    phone_verified  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      DATETIME     NOT NULL,
    updated_at      DATETIME     NOT NULL,
    CONSTRAINT fk_student_profiles_user       FOREIGN KEY (user_id)       REFERENCES users(user_id)        ON DELETE CASCADE,
    CONSTRAINT fk_student_profiles_university FOREIGN KEY (university_id) REFERENCES universities(university_id) ON DELETE SET NULL,
    INDEX idx_student_profiles_university_id (university_id),
    INDEX idx_student_profiles_student_id    (student_id),
    INDEX idx_student_profiles_phone         (phone)
) ENGINE=InnoDB;

CREATE TABLE pending_users (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    email               VARCHAR(100) NOT NULL UNIQUE,
    student_id          VARCHAR(50)  NOT NULL UNIQUE,
    phone               VARCHAR(20)  NOT NULL UNIQUE,
    university_id       BIGINT       NULL,
    department          VARCHAR(100),
    status              VARCHAR(50)  NOT NULL DEFAULT 'PENDING',
    password_hash       VARCHAR(255) NOT NULL,
    id_card_data_url    LONGTEXT,
    reviewed_by_user_id BIGINT       NULL,
    reviewed_at         DATETIME     NULL,
    rejection_reason    TEXT         NULL,
    created_at          DATETIME     NOT NULL,
    updated_at          DATETIME     NULL,
    CONSTRAINT fk_pending_users_university   FOREIGN KEY (university_id)       REFERENCES universities(university_id) ON DELETE SET NULL,
    CONSTRAINT fk_pending_users_reviewed_by  FOREIGN KEY (reviewed_by_user_id) REFERENCES users(user_id)             ON DELETE SET NULL,
    INDEX idx_pending_users_status           (status),
    INDEX idx_pending_users_university_id    (university_id),
    INDEX idx_pending_users_reviewed_by      (reviewed_by_user_id)
) ENGINE=InnoDB;

CREATE TABLE otp_tokens (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(255) NOT NULL,
    token_purpose VARCHAR(50)  NOT NULL DEFAULT 'EMAIL_VERIFICATION',
    status        VARCHAR(50)  NOT NULL DEFAULT 'PENDING',
    attempt_count INT          NOT NULL DEFAULT 0,
    version       BIGINT       NOT NULL DEFAULT 0,
    otp_hash      VARCHAR(255) NOT NULL,
    expires_at    DATETIME     NOT NULL,
    verified_at   DATETIME     NULL,
    used_at       DATETIME     NULL,
    last_sent_at  DATETIME     NULL,
    created_at    DATETIME     NOT NULL,
    INDEX idx_otp_email_purpose_status (email, token_purpose, status),
    INDEX idx_otp_expires_at           (expires_at)
) ENGINE=InnoDB;

-- =========================================================
-- 3. CATEGORIES & ITEMS
-- =========================================================

CREATE TABLE categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    created_at  DATETIME     NULL
) ENGINE=InnoDB;

CREATE TABLE items (
    item_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id       BIGINT         NOT NULL,
    title          VARCHAR(150)   NOT NULL,
    description    TEXT,
    category_id    BIGINT         NULL,
    item_condition VARCHAR(80),
    daily_rate     DECIMAL(10,2)  NOT NULL,
    deposit        DECIMAL(10,2)  NULL,
    status         VARCHAR(40)    NOT NULL DEFAULT 'AVAILABLE',
    created_at     DATETIME       NOT NULL,
    updated_at     DATETIME       NOT NULL,
    version        BIGINT         NULL,
    CONSTRAINT fk_items_owner    FOREIGN KEY (owner_id)    REFERENCES users(user_id)      ON DELETE CASCADE,
    CONSTRAINT fk_items_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
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
    approved_by_user_id BIGINT         NULL,
    approved_at         DATETIME       NULL,
    rejection_reason    VARCHAR(1000)  NULL,
    created_at          DATETIME       NOT NULL,
    updated_at          DATETIME       NOT NULL,
    version             BIGINT         NULL,
    CONSTRAINT fk_bookings_item        FOREIGN KEY (item_id)             REFERENCES items(item_id)   ON DELETE CASCADE,
    CONSTRAINT fk_bookings_renter      FOREIGN KEY (renter_id)           REFERENCES users(user_id)   ON DELETE CASCADE,
    CONSTRAINT fk_bookings_approved_by FOREIGN KEY (approved_by_user_id) REFERENCES users(user_id)   ON DELETE SET NULL,
    INDEX idx_bookings_status (status),
    INDEX idx_bookings_item   (item_id),
    INDEX idx_bookings_renter (renter_id)
) ENGINE=InnoDB;

CREATE TABLE payments (
    payment_id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id      BIGINT         NOT NULL UNIQUE,
    amount          DECIMAL(10,2)  NOT NULL,
    status          VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    method          VARCHAR(50),
    transaction_ref VARCHAR(100)   UNIQUE,
    paid_at         DATETIME       NULL,
    created_at      DATETIME       NOT NULL,
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- 5. REVIEWS, REPORTS & LOGISTICS
-- =========================================================

CREATE TABLE reviews (
    review_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id  BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    reviewee_id BIGINT NOT NULL,
    rating      INT    NOT NULL,
    comment     TEXT,
    created_at  DATETIME NOT NULL,
    CONSTRAINT fk_reviews_booking  FOREIGN KEY (booking_id)  REFERENCES bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(user_id)       ON DELETE CASCADE,
    CONSTRAINT fk_reviews_reviewee FOREIGN KEY (reviewee_id) REFERENCES users(user_id)       ON DELETE CASCADE,
    INDEX idx_reviews_booking_id  (booking_id),
    INDEX idx_reviews_reviewer_id (reviewer_id),
    INDEX idx_reviews_reviewee_id (reviewee_id)
) ENGINE=InnoDB;

CREATE TABLE reports (
    report_id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    reporter_id         BIGINT      NOT NULL,
    entity_type         VARCHAR(20) NOT NULL,
    entity_id           BIGINT      NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reviewed_by_user_id BIGINT      NULL,
    reason              TEXT        NOT NULL,
    reviewed_at         DATETIME    NULL,
    created_at          DATETIME    NOT NULL,
    CONSTRAINT fk_reports_reporter    FOREIGN KEY (reporter_id)         REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_reports_reviewed_by FOREIGN KEY (reviewed_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_reports_status          (status),
    INDEX idx_reports_entity          (entity_type, entity_id),
    INDEX idx_reports_reviewed_by_user_id (reviewed_by_user_id)
) ENGINE=InnoDB;

-- =========================================================
-- 6. DISPUTES, PENALTIES & TRUST TRACKERS
-- =========================================================

CREATE TABLE disputes (
    dispute_id  BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id  BIGINT      NOT NULL,
    raised_by   BIGINT      NOT NULL,
    status      VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    reason      TEXT        NOT NULL,
    resolution  TEXT,
    created_at  DATETIME    NOT NULL,
    updated_at  DATETIME    NULL,
    resolved_at DATETIME    NULL,
    CONSTRAINT fk_disputes_booking   FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT fk_disputes_raised_by FOREIGN KEY (raised_by)  REFERENCES users(user_id)       ON DELETE CASCADE,
    INDEX idx_disputes_booking_id (booking_id),
    INDEX idx_disputes_raised_by  (raised_by)
) ENGINE=InnoDB;

CREATE TABLE penalties (
    penalty_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id           BIGINT         NOT NULL,
    booking_id        BIGINT         NULL,
    dispute_id        BIGINT         NULL,
    status            VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    amount            DECIMAL(10,2)  NULL,
    issued_by_user_id BIGINT         NOT NULL,
    reason            TEXT           NOT NULL,
    created_at        DATETIME       NOT NULL,
    applied_at        DATETIME       NULL,
    CONSTRAINT fk_penalties_user      FOREIGN KEY (user_id)           REFERENCES users(user_id)       ON DELETE CASCADE,
    CONSTRAINT fk_penalties_booking   FOREIGN KEY (booking_id)        REFERENCES bookings(booking_id) ON DELETE SET NULL,
    CONSTRAINT fk_penalties_dispute   FOREIGN KEY (dispute_id)        REFERENCES disputes(dispute_id) ON DELETE SET NULL,
    CONSTRAINT fk_penalties_issued_by FOREIGN KEY (issued_by_user_id) REFERENCES users(user_id)       ON DELETE RESTRICT,
    INDEX idx_penalties_user_id           (user_id),
    INDEX idx_penalties_booking_id        (booking_id),
    INDEX idx_penalties_dispute_id        (dispute_id),
    INDEX idx_penalties_issued_by_user_id (issued_by_user_id)
) ENGINE=InnoDB;

CREATE TABLE trust_events (
    trust_event_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id            BIGINT       NOT NULL,
    source_type        VARCHAR(30)  NOT NULL,
    source_id          BIGINT       NULL,
    change_amount      INT          NOT NULL,
    old_score          INT          NOT NULL,
    new_score          INT          NOT NULL,
    reason             VARCHAR(255) NOT NULL,
    created_by_user_id BIGINT       NULL,
    created_at         DATETIME     NOT NULL,
    CONSTRAINT fk_trust_events_user       FOREIGN KEY (user_id)            REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_trust_events_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_trust_events_user_id            (user_id),
    INDEX idx_trust_events_created_by_user_id (created_by_user_id)
) ENGINE=InnoDB;

-- =========================================================
-- 7. AUDITING
-- =========================================================

CREATE TABLE audit_logs (
    audit_id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_type  VARCHAR(10)  NOT NULL DEFAULT 'USER',
    actor_id    BIGINT       NULL,
    action_type VARCHAR(80)  NOT NULL,
    entity_type VARCHAR(50)  NOT NULL,
    entity_id   BIGINT       NULL,
    outcome     VARCHAR(20)  NOT NULL DEFAULT 'SUCCESS',
    details     TEXT,
    created_at  DATETIME     NOT NULL,
    CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_audit_entity   (entity_type, entity_id),
    INDEX idx_audit_actor_id (actor_id)
) ENGINE=InnoDB;

-- =========================================================
-- 8. NOTIFICATIONS
-- =========================================================

CREATE TABLE notifications (
    notification_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT       NOT NULL,
    notification_type   VARCHAR(20)  NOT NULL,
    title               VARCHAR(255) NOT NULL,
    message             TEXT         NOT NULL,
    related_entity_type VARCHAR(20)  NOT NULL,
    related_entity_id   BIGINT       NULL,
    is_read             BOOLEAN      NOT NULL DEFAULT FALSE,
    created_by_user_id  BIGINT       NULL,
    created_at          DATETIME     NOT NULL,
    read_at             DATETIME     NULL,
    CONSTRAINT fk_notifications_user       FOREIGN KEY (user_id)           REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_notifications_user_id         (user_id),
    INDEX idx_notifications_read            (is_read),
    INDEX idx_notifications_created_at      (created_at),
    INDEX idx_notifications_related_entity  (related_entity_type, related_entity_id),
    INDEX idx_notifications_created_by_user_id (created_by_user_id)
) ENGINE=InnoDB;

-- =========================================================
-- 9. MESSAGING
-- =========================================================

CREATE TABLE conversations (
    conversation_id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    participant_one_user_id  BIGINT   NOT NULL,
    participant_two_user_id  BIGINT   NOT NULL,
    booking_id               BIGINT   NULL,
    dispute_id               BIGINT   NULL,
    last_message_at          DATETIME NULL,
    created_at               DATETIME NOT NULL,
    updated_at               DATETIME NULL,
    CONSTRAINT fk_conversations_participant_one FOREIGN KEY (participant_one_user_id) REFERENCES users(user_id)       ON DELETE CASCADE,
    CONSTRAINT fk_conversations_participant_two FOREIGN KEY (participant_two_user_id) REFERENCES users(user_id)       ON DELETE CASCADE,
    CONSTRAINT fk_conversations_booking         FOREIGN KEY (booking_id)             REFERENCES bookings(booking_id) ON DELETE SET NULL,
    CONSTRAINT fk_conversations_dispute         FOREIGN KEY (dispute_id)             REFERENCES disputes(dispute_id) ON DELETE SET NULL,
    INDEX idx_conversations_participant_one (participant_one_user_id),
    INDEX idx_conversations_participant_two (participant_two_user_id),
    INDEX idx_conversations_booking_id      (booking_id),
    INDEX idx_conversations_dispute_id      (dispute_id),
    INDEX idx_conversations_last_message_at (last_message_at)
) ENGINE=InnoDB;

CREATE TABLE messages (
    message_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id  BIGINT   NOT NULL,
    sender_user_id   BIGINT   NOT NULL,
    receiver_user_id BIGINT   NOT NULL,
    content          TEXT     NOT NULL,
    is_read          BOOLEAN  NOT NULL DEFAULT FALSE,
    read_at          DATETIME NULL,
    created_at       DATETIME NOT NULL,
    updated_at       DATETIME NULL,
    CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id)  REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender       FOREIGN KEY (sender_user_id)   REFERENCES users(user_id)                ON DELETE CASCADE,
    CONSTRAINT fk_messages_receiver     FOREIGN KEY (receiver_user_id) REFERENCES users(user_id)                ON DELETE CASCADE,
    INDEX idx_messages_conversation_id  (conversation_id),
    INDEX idx_messages_sender_user_id   (sender_user_id),
    INDEX idx_messages_receiver_user_id (receiver_user_id),
    INDEX idx_messages_is_read          (is_read),
    INDEX idx_messages_created_at       (created_at)
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
    created_at    DATETIME     NOT NULL,
    CONSTRAINT fk_files_uploader FOREIGN KEY (uploader_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_files_item     FOREIGN KEY (item_id)     REFERENCES items(item_id) ON DELETE CASCADE,
    INDEX idx_files_uploader_id (uploader_id),
    INDEX idx_files_stored_name (stored_name),
    INDEX idx_files_purpose     (purpose)
) ENGINE=InnoDB;

-- =========================================================
-- 11. WISHLIST
-- =========================================================

CREATE TABLE wishlist_items (
    wishlist_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT   NOT NULL,
    item_id     BIGINT   NOT NULL,
    created_at  DATETIME NOT NULL,
    UNIQUE KEY uc_wishlist_user_item (user_id, item_id),
    CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_item FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- Seed data: default roles
-- =========================================================

INSERT INTO roles (name) VALUES ('ROLE_ADMIN'), ('ROLE_STUDENT');
