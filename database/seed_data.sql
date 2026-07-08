-- =========================================================
-- SEED ROLES
-- =========================================================

INSERT INTO roles (name) VALUES
                             ('ROLE_USER'),
                             ('ROLE_ADMIN'),
                             ('ROLE_MODERATOR'),
                             ('ROLE_SUPER_ADMIN');

-- =========================================================
-- SEED UNIVERSITIES
-- =========================================================

INSERT INTO universities (name, domain, is_verified) VALUES
                                                         ('Daffodil International University', 'daffodilvarsity.edu.bd', TRUE),
                                                         ('North South University', 'northsouth.edu', TRUE),
                                                         ('BRAC University', 'bracu.ac.bd', TRUE),
                                                         ('Dhaka University', 'du.ac.bd', TRUE);

-- =========================================================
-- SEED USERS
-- Passwords are plain text ONLY for demo/testing
-- =========================================================

INSERT INTO users (name, email, password_hash, status) VALUES
                                                           ('Super Admin', 'superadmin@resourcex.com', 'super123', 'ACTIVE'),
                                                           ('Main Admin', 'admin@resourcex.com', 'admin123', 'ACTIVE'),
                                                           ('Moderator One', 'moderator@resourcex.com', 'mod123', 'ACTIVE'),

                                                           ('Samiul Mirja', 'samiul@student.com', 'student123', 'ACTIVE'),
                                                           ('Arafat Rahman', 'arafat@student.com', 'student123', 'ACTIVE'),
                                                           ('Nusrat Jahan', 'nusrat@student.com', 'student123', 'ACTIVE'),
                                                           ('Tanvir Hasan', 'tanvir@student.com', 'student123', 'ACTIVE');

-- =========================================================
-- ASSIGN ROLES
-- =========================================================

-- Super Admin
INSERT INTO user_roles (user_id, role_id)
VALUES (1, 4);

-- Admin
INSERT INTO user_roles (user_id, role_id)
VALUES (2, 2);

-- Moderator
INSERT INTO user_roles (user_id, role_id)
VALUES (3, 3);

-- Students
INSERT INTO user_roles (user_id, role_id) VALUES
                                              (4, 1),
                                              (5, 1),
                                              (6, 1),
                                              (7, 1);

-- =========================================================
-- STUDENT PROFILES
-- =========================================================

INSERT INTO student_profiles (
    user_id,
    student_id,
    phone,
    university_id,
    department,
    trust_score,
    email_verified,
    phone_verified
) VALUES
      (4, 'DIU-221-15-1', '01711111111', 1, 'CSE', 100, TRUE, TRUE),
      (5, 'NSU-222-15-2', '01722222222', 2, 'EEE', 95, TRUE, TRUE),
      (6, 'BRAC-223-15-3', '01733333333', 3, 'BBA', 88, TRUE, FALSE),
      (7, 'DU-224-15-4', '01744444444', 4, 'LAW', 76, TRUE, TRUE);

-- =========================================================
-- PENDING USERS
-- =========================================================

INSERT INTO pending_users (
    name,
    email,
    student_id,
    phone,
    university_id,
    department,
    status,
    password_hash,
    id_card_data_url
) VALUES
      (
          'Pending Student',
          'pending@student.com',
          'DIU-999-15-9',
          '01899999999',
          1,
          'CSE',
          'PENDING',
          'pending123',
          'https://example.com/idcards/pending-student.png'
      ),
      (
          'Rejected Student',
          'rejected@student.com',
          'NSU-888-15-8',
          '01888888888',
          2,
          'Architecture',
          'REJECTED',
          'reject123',
          'https://example.com/idcards/rejected-student.png'
      );

-- =========================================================
-- OTP TOKENS
-- =========================================================

INSERT INTO otp_tokens (
    email,
    status,
    otp_hash,
    expires_at
) VALUES
    (
        'pending@student.com',
        'PENDING',
        '123456',
        DATE_ADD(NOW(), INTERVAL 10 MINUTE)
    );

-- =========================================================
-- ITEMS
-- =========================================================

INSERT INTO items (
    title,
    owner_id,
    category,
    item_condition,
    daily_rate,
    status,
    description
) VALUES
      (
          'Dell Inspiron Laptop',
          4,
          'Electronics',
          'GOOD',
          500.00,
          'AVAILABLE',
          'Core i7 laptop for programming and assignments'
      ),
      (
          'Canon DSLR Camera',
          5,
          'Photography',
          'EXCELLENT',
          800.00,
          'AVAILABLE',
          'Professional DSLR camera'
      ),
      (
          'Scientific Calculator',
          6,
          'Study Materials',
          'GOOD',
          100.00,
          'AVAILABLE',
          'Casio scientific calculator'
      );

-- =========================================================
-- ITEM IMAGES
-- =========================================================

INSERT INTO item_images (item_id, image_url) VALUES
                                                 (1, 'https://example.com/items/laptop1.png'),
                                                 (1, 'https://example.com/items/laptop2.png'),
                                                 (2, 'https://example.com/items/camera1.png'),
                                                 (3, 'https://example.com/items/calculator1.png');

-- =========================================================
-- BOOKINGS
-- =========================================================

INSERT INTO bookings (
    item_id,
    renter_id,
    status,
    start_date,
    end_date,
    total_price,
    created_at
) VALUES
      (
          1,
          5,
          'APPROVED',
          '2026-05-20',
          '2026-05-25',
          2500.00,
          NOW()
      ),
      (
          2,
          4,
          'PENDING',
          '2026-05-23',
          '2026-05-26',
          2400.00,
          NOW()
      );

-- =========================================================
-- PAYMENTS
-- =========================================================

INSERT INTO payments (
    booking_id,
    amount,
    status,
    method,
    transaction_ref,
    paid_at
) VALUES
    (
        1,
        2500.00,
        'SUCCESS',
        'BKASH',
        'TXN-100001',
        NOW()
    );

-- =========================================================
-- REVIEWS
-- =========================================================

INSERT INTO reviews (
    booking_id,
    reviewer_id,
    rating,
    comment
) VALUES
    (
        1,
        5,
        5,
        'Very smooth rental experience'
    );

-- =========================================================
-- REPORTS
-- =========================================================

INSERT INTO reports (
    reporter_id,
    entity_type,
    entity_id,
    reason
) VALUES
    (
        6,
        'ITEM',
        1,
        'Item description was misleading'
    );

-- =========================================================
-- DISPUTES
-- =========================================================

INSERT INTO disputes (
    booking_id,
    raised_by,
    status,
    reason
) VALUES
    (
        1,
        5,
        'UNDER_REVIEW',
        'Laptop battery backup was lower than expected'
    );

-- =========================================================
-- PENALTIES
-- =========================================================

INSERT INTO penalties (
    user_id,
    booking_id,
    dispute_id,
    status,
    amount,
    issued_by_user_id,
    reason,
    applied_at
) VALUES
    (
        4,
        1,
        1,
        'APPLIED',
        300.00,
        2,
        'Late item return',
        NOW()
    );



-- =========================================================
-- AUDIT LOGS
-- =========================================================

INSERT INTO audit_logs (
    actor_type,
    actor_id,
    action_type,
    entity_type,
    entity_id,
    outcome,
    details
) VALUES
      (
          'USER',
          1,
          'CREATE_ADMIN',
          'USER',
          2,
          'SUCCESS',
          'Super admin created a new admin'
      ),
      (
          'USER',
          2,
          'APPROVE_BOOKING',
          'BOOKING',
          1,
          'APPROVED',
          'Admin approved booking request'
      );

-- =========================================================
-- NOTIFICATIONS
-- =========================================================

INSERT INTO notifications (
    user_id,
    notification_type,
    message,
    related_entity_type,
    related_entity_id,
    created_at
) VALUES
      (
          4,
          'TRUST',
          'A late return penalty has been applied to your account.',
          'TRUST',
          1,
          NOW()
      ),
      (
          5,
          'BOOKING',
          'Your booking request has been approved.',
          'BOOKING',
          1,
          NOW()
      );

-- =========================================================
-- CONVERSATIONS
-- =========================================================

INSERT INTO conversations (
    participant_one_user_id,
    participant_two_user_id,
    booking_id,
    last_message_at
) VALUES
    (
        4,
        5,
        1,
        NOW()
    );

-- =========================================================
-- MESSAGES
-- =========================================================

INSERT INTO messages (
    conversation_id,
    sender_user_id,
    content,
    is_read
) VALUES
      (
          1,
          5,
          'Hello ভাই, কখন laptop collect করতে পারি?',
          TRUE
      ),
      (
          1,
          4,
          'আগামীকাল দুপুরের পর collect করতে পারবেন.',
          FALSE
      );