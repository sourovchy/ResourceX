USE campusvault;

-- 1. UNIVERSITIES

INSERT INTO universities (name, domain, is_verified) VALUES
    ('State University', 'university.edu', TRUE);

INSERT INTO roles (name) VALUES
    ('ROLE_USER'),
    ('ROLE_ADMIN'),
    ('ROLE_MODERATOR'),
    ('ROLE_SUPER_ADMIN');


-- 2. USERS (4 Verified, 2 Pending Verification)

INSERT INTO users (name, email, student_id, phone, password_hash, university, department, trust_score, status, email_verified, phone_verified) VALUES
    ('Alice Smith',   'saidasanzida1@gmail.com', 'S1001', '555-0101', 'samiul!1A', 'State University', 'Computer Science', 100, 'ACTIVE', TRUE, FALSE),
    ('Bob Johnson',   'saidasanzida2@gmail.com', 'S1002', '555-0102', 'samiul!1A', 'State University', 'Computer Science', 90,  'ACTIVE', TRUE, FALSE),
    ('Charlie Brown', 'saidasanzida3@gmail.com', 'S1003', '555-0103', 'samiul!1A', 'State University', 'Computer Science', 60,  'ACTIVE', TRUE, FALSE),
    ('Diana Prince',  'saidasanzida4@gmail.com', 'S1004', '555-0104', 'samiul!1A', 'State University', 'Computer Science', 100, 'ACTIVE', TRUE, FALSE),
    ('Evan Wright',   'saidasanzida5@gmail.com', 'S1005', '555-0105', 'samiul!1A', 'State University', 'Computer Science', 100, 'ACTIVE', TRUE, FALSE),
    ('Fiona Gallagher','saidasanzida6@gmail.com', 'S1006', '555-0106', 'samiul!1A', 'State University', 'Computer Science', 100, 'ACTIVE', TRUE, FALSE);

INSERT INTO user_roles (user_id, role_id) VALUES
    (1, 1),
    (2, 1),
    (3, 1),
    (4, 1),
    (5, 1),
    (6, 1);


-- 3. STAFF

INSERT INTO staff (name, email, role, status, password_hash) VALUES
    ('Admin Support', 'saidasanzida7@gmail.com', 'ADMIN', 'ACTIVE', 'samiul!1A'),
    ('Super Admin',   'saidasanzida8@gmail.com', 'SUPER_ADMIN', 'ACTIVE', 'samiul!1A');


-- 4. STUDENT VERIFICATIONS

INSERT INTO student_verifications (user_id, status, reviewed_by, id_card_image, rejection_reason, reviewed_at) VALUES
    (1, 'VERIFIED', 1,    'https://example.com/id/alice.jpg',   NULL,             NOW()),
    (2, 'VERIFIED', 1,    'https://example.com/id/bob.jpg',     NULL,             NOW()),
    (3, 'VERIFIED', 1,    'https://example.com/id/charlie.jpg', NULL,             NOW()),
    (4, 'VERIFIED', 1,    'https://example.com/id/diana.jpg',   NULL,             NOW()),
    (5, 'PENDING',  NULL, 'https://example.com/id/evan.jpg',    NULL,             NULL),
    (6, 'PENDING',  NULL, 'https://example.com/id/fiona.jpg',   NULL,             NULL);


-- 5. ITEMS

INSERT INTO items (title, owner_id, category, item_condition, daily_rate, status, description) VALUES
    ('Calculus Textbook',    1, 'Books',          'Good',      2.50,  'AVAILABLE',   '8th Edition James Stewart'),
    ('Scientific Calculator', 1, 'Electronics',    'Excellent', 5.00,  'UNAVAILABLE', 'TI-84 Plus CE'),
    ('Mini Fridge',           2, 'Appliances',     'Fair',      3.00,  'AVAILABLE',   'Perfect for dorm room'),
    ('Bicycle',               3, 'Transportation', 'Good',      10.00, 'AVAILABLE',   'Mountain bike, 21 gear');


-- 6. ITEM IMAGES

INSERT INTO item_images (item_id, image_url) VALUES
    (1, 'https://example.com/book.jpg'),
    (2, 'https://example.com/calculator.jpg'),
    (3, 'https://example.com/fridge.jpg'),
    (4, 'https://example.com/bike.jpg');


-- 7. BOOKINGS

INSERT INTO bookings (item_id, renter_id, status, start_date, end_date, returned_date, total_price, approved_by, approved_at) VALUES
    (3, 4, 'COMPLETED', DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(CURDATE(), INTERVAL 5 DAY), 15.00, 1,    NOW()),
    (2, 3, 'APPROVED',  DATE_SUB(CURDATE(), INTERVAL 2 DAY),  DATE_ADD(CURDATE(), INTERVAL 5 DAY), NULL,                                 35.00, 1,    NOW()),
    (4, 2, 'APPROVED',  DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(CURDATE(), INTERVAL 2 DAY), NULL,                                 80.00, 1,    NOW()),
    (1, 3, 'PENDING',   DATE_ADD(CURDATE(), INTERVAL 1 DAY),  DATE_ADD(CURDATE(), INTERVAL 3 DAY), NULL,                                 7.50,  NULL, NULL);


-- 8. PAYMENTS

INSERT INTO payments (booking_id, amount, status, method, transaction_ref) VALUES
    (1, 15.00, 'SUCCESS', 'Card',  'TXN12345'),
    (2, 35.00, 'SUCCESS', 'bKash', 'TXN12346'),
    (3, 80.00, 'PENDING', 'Cash',  NULL);


-- 9. REVIEWS

INSERT INTO reviews (booking_id, reviewer_id, reviewee_id, rating, comment) VALUES
    (1, 4, 2, 5, 'Great mini fridge, works perfectly!');
-- 10. REPORTS

INSERT INTO reports (reporter_id, entity_type, entity_id, status, reason) VALUES
    (4, 'ITEM', 2, 'PENDING', 'Item is inappropriate');


-- 11. DISPUTES

INSERT INTO disputes (booking_id, raised_by, status, reason, resolution) VALUES
    (3, 2, 'OPEN', 'Item returned damaged', NULL);


-- 12. PENALTIES

INSERT INTO penalties (user_id, booking_id, dispute_id, status, amount, issued_by, reason, applied_at) VALUES
    (3, 3, 1, 'APPLIED', 20.00, 1, 'Damaged item penalty', NOW());


-- 13. TRUST EVENTS

INSERT INTO trust_events (user_id, source_type, source_id, change_amount, old_score, new_score, reason, created_by) VALUES
    (2, 'SYSTEM', 1, -5,  95, 90, 'Late return',        NULL),
    (3, 'SYSTEM', 3, -20, 80, 60, 'Damaged item',       NULL);


-- 14. AUDIT LOGS

INSERT INTO audit_logs (actor_type, actor_id, action_type, entity_type, entity_id, outcome, details) VALUES
    ('STAFF', 1,    'VERIFY_STUDENT_ID', 'STUDENT_VERIFICATION', 1, 'SUCCESS', 'Verified Alice student ID'),
    ('SYSTEM', NULL, 'AUTO_TRUST_DEDUCT', 'BOOKING',              1, 'SUCCESS', 'Late return trust deduction applied');
