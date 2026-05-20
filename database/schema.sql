CREATE DATABASE IF NOT EXISTS campusvault;
USE campusvault;

-- CORE TABLES

CREATE TABLE universities (
    university_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(150) NOT NULL UNIQUE,
    domain        VARCHAR(100) UNIQUE,
    is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    user_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id     VARCHAR(50) NOT NULL UNIQUE,
    name           VARCHAR(100) NOT NULL,
    email          VARCHAR(100) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    phone          VARCHAR(20),
    university_id  BIGINT,
    trust_score    INT NOT NULL DEFAULT 100,
    status         ENUM('ACTIVE', 'SUSPENDED', 'BANNED') NOT NULL DEFAULT 'ACTIVE',
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (university_id) REFERENCES universities(university_id) ON DELETE SET NULL
);

CREATE TABLE staff (
    staff_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    email          VARCHAR(100) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    role           ENUM('ADMIN', 'MODERATOR', 'SUPER_ADMIN') NOT NULL,
    status         ENUM('ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE student_verifications (
    verification_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id           BIGINT NOT NULL UNIQUE,
    id_card_image     VARCHAR(255) NOT NULL,
    status            ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    reviewed_by       BIGINT DEFAULT NULL,
    reviewed_at       TIMESTAMP NULL DEFAULT NULL,
    rejection_reason  TEXT,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES staff(staff_id) ON DELETE SET NULL
);

-- ITEMS

CREATE TABLE items (
    item_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id       BIGINT NOT NULL,
    title          VARCHAR(200) NOT NULL,
    description    TEXT,
    category       VARCHAR(50),
    item_condition VARCHAR(50),
    daily_rate     DECIMAL(10,2) NOT NULL,
    status         ENUM('AVAILABLE', 'UNAVAILABLE', 'BLOCKED') NOT NULL DEFAULT 'AVAILABLE',
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE item_images (
    image_id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id     BIGINT NOT NULL,
    image_url   VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- BOOKINGS AND PAYMENTS

CREATE TABLE bookings (
    booking_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id        BIGINT NOT NULL,
    renter_id      BIGINT NOT NULL,
    start_date     DATE NOT NULL,
    end_date       DATE NOT NULL,
    returned_date  DATE DEFAULT NULL,
    total_price    DECIMAL(10,2) NOT NULL,
    status         ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    approved_by    BIGINT DEFAULT NULL,
    approved_at    TIMESTAMP NULL DEFAULT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (renter_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES staff(staff_id) ON DELETE SET NULL
);

CREATE TABLE payments (
    payment_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id        BIGINT NOT NULL,
    amount            DECIMAL(10,2) NOT NULL,
    status            ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    method            VARCHAR(50),
    transaction_ref   VARCHAR(100) UNIQUE,
    paid_at           TIMESTAMP NULL DEFAULT NULL,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);

-- REVIEWS AND REPORTS

CREATE TABLE reviews (
    review_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id    BIGINT NOT NULL,
    reviewer_id   BIGINT NOT NULL,
    reviewee_id   BIGINT NOT NULL,
    rating        INT NOT NULL,
    comment       TEXT,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE reports (
    report_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    reporter_id   BIGINT NOT NULL,
    entity_type   ENUM('USER', 'ITEM', 'BOOKING') NOT NULL,
    entity_id     BIGINT NOT NULL,
    reason        TEXT NOT NULL,
    status        ENUM('PENDING', 'REVIEWED', 'RESOLVED') NOT NULL DEFAULT 'PENDING',
    reviewed_by   BIGINT DEFAULT NULL,
    reviewed_at   TIMESTAMP NULL DEFAULT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES staff(staff_id) ON DELETE SET NULL
);

-- DISPUTES AND PENALTIES

CREATE TABLE disputes (
    dispute_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id   BIGINT NOT NULL,
    raised_by    BIGINT NOT NULL,
    status       ENUM('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    reason       TEXT NOT NULL,
    resolution   TEXT,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at  TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (raised_by) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE penalties (
    penalty_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT NOT NULL,
    booking_id   BIGINT DEFAULT NULL,
    dispute_id   BIGINT DEFAULT NULL,
    amount       DECIMAL(10,2) DEFAULT NULL,
    reason       TEXT NOT NULL,
    status       ENUM('PENDING', 'APPLIED', 'WAIVED') NOT NULL DEFAULT 'PENDING',
    issued_by    BIGINT NOT NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    applied_at   TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    FOREIGN KEY (dispute_id) REFERENCES disputes(dispute_id) ON DELETE SET NULL,
    FOREIGN KEY (issued_by) REFERENCES staff(staff_id) ON DELETE RESTRICT
);

-- TRUST HISTORY

CREATE TABLE trust_events (
    trust_event_id  BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    change_amount   INT NOT NULL,
    old_score       INT NOT NULL,
    new_score       INT NOT NULL,
    source_type     ENUM('PENALTY', 'REVIEW', 'DISPUTE', 'REPORT', 'SYSTEM', 'STAFF_ACTION') NOT NULL,
    source_id       BIGINT DEFAULT NULL,
    reason          VARCHAR(255) NOT NULL,
    created_by      BIGINT DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES staff(staff_id) ON DELETE SET NULL
);

-- ONE AUDIT TABLE FOR ALL STAFF ACTIONS

CREATE TABLE audit_logs (
    audit_id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_type    ENUM('STAFF', 'SYSTEM') NOT NULL DEFAULT 'STAFF',
    actor_id      BIGINT DEFAULT NULL,
    action_type   VARCHAR(80) NOT NULL,
    entity_type   VARCHAR(50) NOT NULL,
    entity_id     BIGINT DEFAULT NULL,
    outcome       ENUM('SUCCESS', 'FAILED', 'APPROVED', 'REJECTED', 'WAIVED', 'APPLIED') DEFAULT 'SUCCESS',
    details       TEXT,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES staff(staff_id) ON DELETE SET NULL
);
CREATE TABLE otp_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP NULL DEFAULT NULL,
    used_at TIMESTAMP NULL DEFAULT NULL,
    attempt_count INT NOT NULL DEFAULT 0,
    last_sent_at TIMESTAMP NULL DEFAULT NULL,
    version BIGINT DEFAULT 0,
    INDEX idx_otp_email_status (email, status),
    INDEX idx_otp_expires_at (expires_at)
);

CREATE TABLE pending_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    university VARCHAR(150),
    department VARCHAR(100),
    id_card_data_url LONGTEXT,
    status VARCHAR(50),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    role_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE user_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);
-- OPTIONAL HELPER INDEXES

CREATE INDEX idx_users_university_id ON users(university_id);
CREATE INDEX idx_items_owner_id ON items(owner_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_bookings_item_id ON bookings(item_id);
CREATE INDEX idx_bookings_renter_id ON bookings(renter_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_trustevents_user_id ON trust_events(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
