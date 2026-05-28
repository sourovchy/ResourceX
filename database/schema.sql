CREATE DATABASE IF NOT EXISTS resourcex;
USE resourcex;

-- =========================================================
-- 1. UNIVERSITIES
-- =========================================================

CREATE TABLE universities (
    university_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(150) NOT NULL UNIQUE,
    domain        VARCHAR(100) UNIQUE,
    is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================================
-- 2. USERS, RBAC, STUDENT PROFILES, PENDING USERS
-- =========================================================

CREATE TABLE users (
    user_id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name                 VARCHAR(100) NOT NULL,
    email                VARCHAR(100) NOT NULL UNIQUE,
    password_hash        VARCHAR(255) NOT NULL,
    avatar_url           VARCHAR(1000) DEFAULT NULL,
    status               ENUM('ACTIVE', 'SUSPENDED', 'BANNED') NOT NULL DEFAULT 'ACTIVE',
    suspended_at         TIMESTAMP NULL DEFAULT NULL,
    suspension_ends_at   TIMESTAMP NULL DEFAULT NULL,
    suspension_reason    TEXT NULL,
    suspended_by_user_id BIGINT NULL,
    scheduled_deletion_at TIMESTAMP NULL DEFAULT NULL,
    created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_suspended_by
        FOREIGN KEY (suspended_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_suspended_by_user_id ON users(suspended_by_user_id);
CREATE INDEX idx_users_suspended_at ON users(suspended_at);
CREATE INDEX idx_users_suspension_ends_at ON users(suspension_ends_at);
CREATE INDEX idx_users_scheduled_deletion_at ON users(scheduled_deletion_at);

CREATE TABLE roles (
    role_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;
INSERT IGNORE INTO roles (name) VALUES
    ('ROLE_USER'),
    ('ROLE_ADMIN'),
    ('ROLE_MODERATOR'),
    ('ROLE_SUPER_ADMIN');

CREATE TABLE user_roles (
    id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    UNIQUE KEY uk_user_roles_user_role (user_id, role_id),
    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

CREATE TABLE student_profiles (
    user_id         BIGINT PRIMARY KEY,
    student_id      VARCHAR(50) NOT NULL UNIQUE,
    phone           VARCHAR(20) NOT NULL UNIQUE,
    university_id   BIGINT NULL,
    department      VARCHAR(100),
    id_card_file_id BIGINT NULL,
    trust_score     INT NOT NULL DEFAULT 100,
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_profiles_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_student_profiles_university
        FOREIGN KEY (university_id) REFERENCES universities(university_id) ON DELETE SET NULL,
    CONSTRAINT fk_student_profiles_id_card
        FOREIGN KEY (id_card_file_id) REFERENCES files(file_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_student_profiles_university_id ON student_profiles(university_id);
CREATE INDEX idx_student_profiles_student_id ON student_profiles(student_id);
CREATE INDEX idx_student_profiles_phone ON student_profiles(phone);
CREATE INDEX idx_student_profiles_id_card_file_id ON student_profiles(id_card_file_id);

CREATE TABLE pending_users (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    email               VARCHAR(100) NOT NULL UNIQUE,
    student_id          VARCHAR(50) NOT NULL UNIQUE,
    phone               VARCHAR(20) NOT NULL UNIQUE,
    university_id       BIGINT NULL,
    department          VARCHAR(100),
    status              ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    password_hash       VARCHAR(255) NOT NULL,
    id_card_file_id     BIGINT NULL,
    reviewed_by_user_id BIGINT NULL,
    reviewed_at         TIMESTAMP NULL DEFAULT NULL,
    rejection_reason    TEXT NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pending_users_university
        FOREIGN KEY (university_id) REFERENCES universities(university_id) ON DELETE SET NULL,
    CONSTRAINT fk_pending_users_reviewed_by
        FOREIGN KEY (reviewed_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_pending_users_id_card
        FOREIGN KEY (id_card_file_id) REFERENCES files(file_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_pending_users_status ON pending_users(status);
CREATE INDEX idx_pending_users_university_id ON pending_users(university_id);
CREATE INDEX idx_pending_users_reviewed_by ON pending_users(reviewed_by_user_id);
CREATE INDEX idx_pending_users_id_card_file_id ON pending_users(id_card_file_id);

CREATE TABLE otp_tokens (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(255) NOT NULL,
    token_purpose VARCHAR(50) NOT NULL DEFAULT 'EMAIL_VERIFICATION',
    status        VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    attempt_count INT NOT NULL DEFAULT 0,
    version       BIGINT NOT NULL DEFAULT 0,
    otp_hash      VARCHAR(255) NOT NULL,
    expires_at    TIMESTAMP NOT NULL,
    verified_at   TIMESTAMP NULL DEFAULT NULL,
    used_at       TIMESTAMP NULL DEFAULT NULL,
    last_sent_at  TIMESTAMP NULL DEFAULT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_otp_email_purpose_status (email, token_purpose, status),
    INDEX idx_otp_expires_at (expires_at)
) ENGINE=InnoDB;

-- =========================================================
-- 3. ITEMS & INVENTORY
-- =========================================================

CREATE TABLE items (
    item_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    title          VARCHAR(200) NOT NULL,
    owner_id       BIGINT NOT NULL,
    category       VARCHAR(50),
    item_condition VARCHAR(50),
    daily_rate     DECIMAL(10,2) NOT NULL,
    status         ENUM('AVAILABLE', 'UNAVAILABLE', 'BLOCKED') NOT NULL DEFAULT 'AVAILABLE',
    description    TEXT,
    version        BIGINT NOT NULL DEFAULT 0,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_items_owner
        FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_items_owner_id ON items(owner_id);
CREATE INDEX idx_items_status ON items(status);

-- =========================================================
-- 4. BOOKINGS & FINANCIALS
-- =========================================================

CREATE TABLE bookings (
    booking_id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id              BIGINT NOT NULL,
    renter_id            BIGINT NOT NULL,
    status               ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    start_date           DATE NOT NULL,
    end_date             DATE NOT NULL,
    returned_date        DATE DEFAULT NULL,
    total_price          DECIMAL(10,2) NOT NULL,
    version              BIGINT NOT NULL DEFAULT 0,
    approved_by_user_id  BIGINT DEFAULT NULL,
    approved_at          TIMESTAMP NULL DEFAULT NULL,
    created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_item
        FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_renter
        FOREIGN KEY (renter_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_approved_by
        FOREIGN KEY (approved_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE payments (
    payment_id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id      BIGINT NOT NULL,
    amount          DECIMAL(10,2) NOT NULL,
    status          ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    method          VARCHAR(50),
    transaction_ref VARCHAR(100) UNIQUE,
    paid_at         TIMESTAMP NULL DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_bookings_item_id ON bookings(item_id);
CREATE INDEX idx_bookings_renter_id ON bookings(renter_id);
CREATE INDEX idx_bookings_approved_by_user_id ON bookings(approved_by_user_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);

-- =========================================================
-- 5. REVIEWS, REPORTS & LOGISTICS
-- =========================================================

CREATE TABLE reviews (
    review_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id  BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    reviewee_id BIGINT NOT NULL,
    rating      INT NOT NULL,
    comment     TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_reviewer
        FOREIGN KEY (reviewer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_reviewee
        FOREIGN KEY (reviewee_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);

CREATE TABLE reports (
    report_id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    reporter_id         BIGINT NOT NULL,
    entity_type         ENUM('USER', 'ITEM', 'BOOKING') NOT NULL,
    entity_id           BIGINT NOT NULL,
    status              ENUM('PENDING', 'REVIEWED', 'RESOLVED') NOT NULL DEFAULT 'PENDING',
    reviewed_by_user_id BIGINT DEFAULT NULL,
    reason              TEXT NOT NULL,
    reviewed_at         TIMESTAMP NULL DEFAULT NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reports_reporter
        FOREIGN KEY (reporter_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_reports_reviewed_by
        FOREIGN KEY (reviewed_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_entity ON reports(entity_type, entity_id);
CREATE INDEX idx_reports_reviewed_by_user_id ON reports(reviewed_by_user_id);

-- =========================================================
-- 6. DISPUTES, PENALTIES & TRUST TRACKERS
-- =========================================================

CREATE TABLE disputes (
    dispute_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id   BIGINT NOT NULL,
    raised_by    BIGINT NOT NULL,
    status       ENUM('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    reason       TEXT NOT NULL,
    resolution   TEXT,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at  TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_disputes_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT fk_disputes_raised_by
        FOREIGN KEY (raised_by) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_disputes_booking_id ON disputes(booking_id);
CREATE INDEX idx_disputes_raised_by ON disputes(raised_by);

CREATE TABLE penalties (
    penalty_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id           BIGINT NOT NULL,
    booking_id        BIGINT DEFAULT NULL,
    dispute_id        BIGINT DEFAULT NULL,
    status            ENUM('PENDING', 'APPLIED', 'WAIVED') NOT NULL DEFAULT 'PENDING',
    amount            DECIMAL(10,2) DEFAULT NULL,
    issued_by_user_id BIGINT NOT NULL,
    reason            TEXT NOT NULL,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    applied_at        TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_penalties_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_penalties_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    CONSTRAINT fk_penalties_dispute
        FOREIGN KEY (dispute_id) REFERENCES disputes(dispute_id) ON DELETE SET NULL,
    CONSTRAINT fk_penalties_issued_by
        FOREIGN KEY (issued_by_user_id) REFERENCES users(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE trust_events (
    trust_event_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id              BIGINT NOT NULL,
    source_type          ENUM('PENALTY', 'REVIEW', 'DISPUTE', 'REPORT', 'SYSTEM', 'ADMIN_ACTION') NOT NULL,
    source_id            BIGINT DEFAULT NULL,
    change_amount        INT NOT NULL,
    old_score            INT NOT NULL,
    new_score            INT NOT NULL,
    reason               VARCHAR(255) NOT NULL,
    created_by_user_id   BIGINT DEFAULT NULL,
    created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_trust_events_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_trust_events_created_by
        FOREIGN KEY (created_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_penalties_user_id ON penalties(user_id);
CREATE INDEX idx_penalties_booking_id ON penalties(booking_id);
CREATE INDEX idx_penalties_dispute_id ON penalties(dispute_id);
CREATE INDEX idx_penalties_issued_by_user_id ON penalties(issued_by_user_id);
CREATE INDEX idx_trust_events_user_id ON trust_events(user_id);
CREATE INDEX idx_trust_events_created_by_user_id ON trust_events(created_by_user_id);

-- =========================================================
-- 7. AUDITING
-- =========================================================

CREATE TABLE audit_logs (
    audit_id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_type  ENUM('USER', 'SYSTEM') NOT NULL DEFAULT 'USER',
    actor_id    BIGINT DEFAULT NULL,
    action_type VARCHAR(80) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id   BIGINT DEFAULT NULL,
    outcome     ENUM('SUCCESS', 'FAILED', 'APPROVED', 'REJECTED', 'WAIVED', 'APPLIED') NOT NULL DEFAULT 'SUCCESS',
    details     TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_logs_actor
        FOREIGN KEY (actor_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_actor_id ON audit_logs(actor_id);

-- =========================================================
-- 8. NOTIFICATIONS
-- =========================================================

CREATE TABLE notifications (
    notification_id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id              BIGINT NOT NULL,
    notification_type    ENUM('BOOKING', 'DISPUTE', 'PENALTY', 'TRUST', 'ADMIN') NOT NULL,
    title                VARCHAR(255) NOT NULL,
    message              TEXT NOT NULL,
    related_entity_type  ENUM('BOOKING', 'DISPUTE', 'PENALTY', 'TRUST', 'ITEM', 'ADMIN') NOT NULL,
    related_entity_id    BIGINT DEFAULT NULL,
    is_read              BOOLEAN NOT NULL DEFAULT FALSE,
    created_by_user_id   BIGINT DEFAULT NULL,
    created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at              TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_created_by
        FOREIGN KEY (created_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_related_entity ON notifications(related_entity_type, related_entity_id);
CREATE INDEX idx_notifications_created_by_user_id ON notifications(created_by_user_id);

-- =========================================================
-- 9. MESSAGING
-- =========================================================

CREATE TABLE conversations (
    conversation_id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    participant_one_user_id  BIGINT NOT NULL,
    participant_two_user_id  BIGINT NOT NULL,
    booking_id               BIGINT DEFAULT NULL,
    dispute_id               BIGINT DEFAULT NULL,
    last_message_at          TIMESTAMP NULL DEFAULT NULL,
    created_at               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_conversations_participant_one
        FOREIGN KEY (participant_one_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_conversations_participant_two
        FOREIGN KEY (participant_two_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_conversations_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    CONSTRAINT fk_conversations_dispute
        FOREIGN KEY (dispute_id) REFERENCES disputes(dispute_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_conversations_participant_one ON conversations(participant_one_user_id);
CREATE INDEX idx_conversations_participant_two ON conversations(participant_two_user_id);
CREATE INDEX idx_conversations_booking_id ON conversations(booking_id);
CREATE INDEX idx_conversations_dispute_id ON conversations(dispute_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at);

CREATE TABLE messages (
    message_id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id    BIGINT NOT NULL,
    sender_user_id     BIGINT NOT NULL,
    receiver_user_id   BIGINT NOT NULL,
    content            TEXT NOT NULL,
    is_read            BOOLEAN NOT NULL DEFAULT FALSE,
    read_at            TIMESTAMP NULL DEFAULT NULL,
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_conversation
        FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender
        FOREIGN KEY (sender_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_receiver
        FOREIGN KEY (receiver_user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_user_id ON messages(sender_user_id);
CREATE INDEX idx_messages_receiver_user_id ON messages(receiver_user_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- =========================================================
-- 10. FILE STORAGE
-- =========================================================

CREATE TABLE files (
    file_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    uploader_id   BIGINT NULL,
    item_id       BIGINT NULL,
    original_name VARCHAR(255) NOT NULL,
    stored_name   VARCHAR(255) NOT NULL UNIQUE,
    file_type     VARCHAR(100) NOT NULL,
    file_size     BIGINT NOT NULL,
    purpose       ENUM('ITEM_IMAGE', 'PROFILE_IMAGE', 'DISPUTE_EVIDENCE', 'MESSAGE_ATTACHMENT', 'ID_CARD') NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_files_uploader
        FOREIGN KEY (uploader_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_files_item
        FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_files_uploader_id ON files(uploader_id);
CREATE INDEX idx_files_item_id ON files(item_id);
CREATE INDEX idx_files_stored_name ON files(stored_name);
CREATE INDEX idx_files_purpose ON files(purpose);