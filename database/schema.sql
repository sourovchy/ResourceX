CREATE DATABASE IF NOT EXISTS campusvault;
USE campusvault;

-- CORE TABLES

CREATE TABLE Universities (
    university_id INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(150) NOT NULL UNIQUE,
    domain        VARCHAR(100) UNIQUE,
    is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Users (
    user_id        INT AUTO_INCREMENT PRIMARY KEY,
    student_id     VARCHAR(50) NOT NULL UNIQUE,
    name           VARCHAR(100) NOT NULL,
    email          VARCHAR(100) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    phone          VARCHAR(20),
    university_id  INT,
    trust_score    INT NOT NULL DEFAULT 100,
    status         ENUM('ACTIVE', 'SUSPENDED', 'BANNED') NOT NULL DEFAULT 'ACTIVE',
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (university_id) REFERENCES Universities(university_id) ON DELETE SET NULL
);

CREATE TABLE Staff (
    staff_id       INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    email          VARCHAR(100) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    role           ENUM('ADMIN', 'MODERATOR', 'SUPER_ADMIN') NOT NULL,
    status         ENUM('ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE StudentVerifications (
    verification_id   INT AUTO_INCREMENT PRIMARY KEY,
    user_id           INT NOT NULL UNIQUE,
    id_card_image     VARCHAR(255) NOT NULL,
    status            ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    reviewed_by       INT DEFAULT NULL,
    reviewed_at       TIMESTAMP NULL DEFAULT NULL,
    rejection_reason  TEXT,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES Staff(staff_id) ON DELETE SET NULL
);
-- ITEMS

CREATE TABLE Items (
    item_id        INT AUTO_INCREMENT PRIMARY KEY,
    owner_id       INT NOT NULL,
    title          VARCHAR(200) NOT NULL,
    description    TEXT,
    category       VARCHAR(50),
    item_condition VARCHAR(50),
    daily_rate     DECIMAL(10,2) NOT NULL,
    status         ENUM('AVAILABLE', 'UNAVAILABLE', 'BLOCKED') NOT NULL DEFAULT 'AVAILABLE',
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE ItemImages (
    image_id    INT AUTO_INCREMENT PRIMARY KEY,
    item_id     INT NOT NULL,
    image_url   VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE CASCADE
);

-- BOOKINGS AND PAYMENTS

CREATE TABLE Bookings (
    booking_id     INT AUTO_INCREMENT PRIMARY KEY,
    item_id        INT NOT NULL,
    renter_id      INT NOT NULL,
    start_date     DATE NOT NULL,
    end_date       DATE NOT NULL,
    returned_date   DATE DEFAULT NULL,
    total_price    DECIMAL(10,2) NOT NULL,
    status         ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    approved_by    INT DEFAULT NULL,
    approved_at    TIMESTAMP NULL DEFAULT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (renter_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES Staff(staff_id) ON DELETE SET NULL
);

CREATE TABLE Payments (
    payment_id        INT AUTO_INCREMENT PRIMARY KEY,
    booking_id        INT NOT NULL,
    amount            DECIMAL(10,2) NOT NULL,
    status            ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    method            VARCHAR(50),
    transaction_ref   VARCHAR(100) UNIQUE,
    paid_at           TIMESTAMP NULL DEFAULT NULL,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE
);

-- REVIEWS AND REPORTS

CREATE TABLE Reviews (
    review_id     INT AUTO_INCREMENT PRIMARY KEY,
    booking_id    INT NOT NULL,
    reviewer_id   INT NOT NULL,
    reviewee_id   INT NOT NULL,
    rating        INT NOT NULL,
    comment       TEXT,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE Reports (
    report_id     INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id   INT NOT NULL,
    entity_type   ENUM('USER', 'ITEM', 'BOOKING') NOT NULL,
    entity_id     INT NOT NULL,
    reason        TEXT NOT NULL,
    status        ENUM('PENDING', 'REVIEWED', 'RESOLVED') NOT NULL DEFAULT 'PENDING',
    reviewed_by   INT DEFAULT NULL,
    reviewed_at   TIMESTAMP NULL DEFAULT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES Staff(staff_id) ON DELETE SET NULL
);

-- DISPUTES AND PENALTIES

CREATE TABLE Disputes (
    dispute_id   INT AUTO_INCREMENT PRIMARY KEY,
    booking_id   INT NOT NULL,
    raised_by    INT NOT NULL,
    status       ENUM('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    reason       TEXT NOT NULL,
    resolution   TEXT,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at  TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (raised_by) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE Penalties (
    penalty_id    INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    booking_id    INT DEFAULT NULL,
    dispute_id    INT DEFAULT NULL,
    amount        DECIMAL(10,2) DEFAULT NULL,
    reason        TEXT NOT NULL,
    status        ENUM('PENDING', 'APPLIED', 'WAIVED') NOT NULL DEFAULT 'PENDING',
    issued_by     INT NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    applied_at    TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE SET NULL,
    FOREIGN KEY (dispute_id) REFERENCES Disputes(dispute_id) ON DELETE SET NULL,
    FOREIGN KEY (issued_by) REFERENCES Staff(staff_id) ON DELETE RESTRICT
);

-- TRUST HISTORY

CREATE TABLE TrustEvents (
    trust_event_id  INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    change_amount   INT NOT NULL,
    old_score       INT NOT NULL,
    new_score       INT NOT NULL,
    source_type     ENUM('PENALTY', 'REVIEW', 'DISPUTE', 'REPORT', 'SYSTEM', 'STAFF_ACTION') NOT NULL,
    source_id       INT DEFAULT NULL,
    reason          VARCHAR(255) NOT NULL,
    created_by      INT DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES Staff(staff_id) ON DELETE SET NULL
);

-- ONE AUDIT TABLE FOR ALL STAFF ACTIONS

CREATE TABLE AuditLogs (
    audit_id      INT AUTO_INCREMENT PRIMARY KEY,
    actor_type    ENUM('STAFF', 'SYSTEM') NOT NULL DEFAULT 'STAFF',
    actor_id      INT DEFAULT NULL,
    action_type   VARCHAR(80) NOT NULL,
    entity_type   VARCHAR(50) NOT NULL,
    entity_id     INT DEFAULT NULL,
    outcome       ENUM('SUCCESS', 'FAILED', 'APPROVED', 'REJECTED', 'WAIVED', 'APPLIED') DEFAULT 'SUCCESS',
    details       TEXT,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES Staff(staff_id) ON DELETE SET NULL
);

-- OPTIONAL HELPER INDEXES
-- Not required for correctness. Add later if needed for speed.

CREATE INDEX idx_users_university_id ON Users(university_id);
CREATE INDEX idx_items_owner_id ON Items(owner_id);
CREATE INDEX idx_items_status ON Items(status);
CREATE INDEX idx_bookings_item_id ON Bookings(item_id);
CREATE INDEX idx_bookings_renter_id ON Bookings(renter_id);
CREATE INDEX idx_payments_booking_id ON Payments(booking_id);
CREATE INDEX idx_reports_status ON Reports(status);
CREATE INDEX idx_trustevents_user_id ON TrustEvents(user_id);
CREATE INDEX idx_audit_entity ON AuditLogs(entity_type, entity_id);
