-- Insert Universities
INSERT INTO Universities (name, domain, is_verified) VALUES
    ('State University', 'university.edu', TRUE);

-- Insert Users
INSERT INTO Users (student_id, name, email, password_hash, phone, university_id, trust_score, status) VALUES
    ('S1001', 'Alice Smith', 'alice@university.edu', 'hashedpassword1', '555-0101', 1, 100, 'ACTIVE'),
    ('S1002', 'Bob Johnson', 'bob@university.edu', 'hashedpassword2', '555-0102', 1, 95, 'ACTIVE'),
    ('S1003', 'Charlie Brown', 'charlie@university.edu', 'hashedpassword3', '555-0103', 1, 80, 'ACTIVE'),
    ('S1004', 'Diana Prince', 'diana@university.edu', 'hashedpassword4', '555-0104', 1, 100, 'ACTIVE');

-- Insert Staff
INSERT INTO Staff (name, email, password_hash, role, status) VALUES
    ('Admin Support', 'admin@university.edu', 'hashedadminpass1', 'ADMIN', 'ACTIVE'),
    ('Super Admin', 'super@university.edu', 'hashedadminpass2', 'SUPER_ADMIN', 'ACTIVE');

-- Insert Student Verifications
INSERT INTO StudentVerifications (user_id, id_card_image, status, reviewed_by, reviewed_at, rejection_reason) VALUES
    (1, 'https://example.com/id/alice.jpg', 'VERIFIED', 1, NOW(), NULL),
    (2, 'https://example.com/id/bob.jpg', 'VERIFIED', 1, NOW(), NULL),
    (3, 'https://example.com/id/charlie.jpg', 'PENDING', NULL, NULL, NULL),
    (4, 'https://example.com/id/diana.jpg', 'REJECTED', 2, NOW(), 'Image unclear');

-- Insert Items
INSERT INTO Items (owner_id, title, description, category, item_condition, daily_rate, status) VALUES
    (1, 'Calculus Textbook', '8th Edition James Stewart', 'Books', 'Good', 2.50, 'AVAILABLE'),
    (1, 'Scientific Calculator', 'TI-84 Plus CE', 'Electronics', 'Excellent', 5.00, 'UNAVAILABLE'),
    (2, 'Mini Fridge', 'Perfect for dorm room', 'Appliances', 'Fair', 3.00, 'AVAILABLE'),
    (3, 'Bicycle', 'Mountain bike, 21 gear', 'Transportation', 'Good', 10.00, 'AVAILABLE');

-- Insert Item Images
INSERT INTO ItemImages (item_id, image_url) VALUES
    (1, 'https://example.com/book.jpg'),
    (2, 'https://example.com/calculator.jpg'),
    (3, 'https://example.com/fridge.jpg'),
    (4, 'https://example.com/bike.jpg');

-- Insert Bookings
INSERT INTO Bookings (item_id, renter_id, start_date, end_date, returned_date, total_price, status, approved_by, approved_at) VALUES
    (3, 4, DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(CURDATE(), INTERVAL 5 DAY), 15.00, 'COMPLETED', 1, NOW()),
    (2, 3, DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 5 DAY), NULL, 35.00, 'APPROVED', 1, NOW()),
    (4, 2, DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(CURDATE(), INTERVAL 2 DAY), NULL, 80.00, 'APPROVED', 1, NOW()),
    (1, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 3 DAY), NULL, 7.50, 'PENDING', NULL, NULL);

-- Insert Payments
INSERT INTO Payments (booking_id, amount, status, method, transaction_ref) VALUES
    (1, 15.00, 'SUCCESS', 'Card', 'TXN12345'),
    (2, 35.00, 'SUCCESS', 'bKash', 'TXN12346'),
    (3, 80.00, 'PENDING', 'Cash', NULL);

-- Insert Reviews
INSERT INTO Reviews (booking_id, reviewer_id, reviewee_id, rating, comment) VALUES
    (1, 4, 2, 5, 'Great mini fridge, works perfectly!');

-- Insert Trust Events
INSERT INTO TrustEvents (user_id, change_amount, old_score, new_score, source_type, source_id, reason, created_by) VALUES
    (2, -5, 95, 90, 'SYSTEM', 1, 'Late return', NULL),
    (3, -20, 80, 60, 'SYSTEM', 3, 'Damaged item', NULL);

-- Update trust scores
UPDATE Users SET trust_score = 90 WHERE user_id = 2;
UPDATE Users SET trust_score = 60 WHERE user_id = 3;

-- Optional reports example
INSERT INTO Reports (reporter_id, entity_type, entity_id, reason, status) VALUES
    (4, 'ITEM', 2, 'Item is inappropriate', 'PENDING');

-- Optional dispute example
INSERT INTO Disputes (booking_id, raised_by, status, reason, resolution) VALUES
    (3, 2, 'OPEN', 'Item returned damaged', NULL);

-- Optional penalty example
INSERT INTO Penalties (user_id, booking_id, dispute_id, amount, reason, status, issued_by, applied_at) VALUES
    (3, 3, 1, 20.00, 'Damaged item penalty', 'APPLIED', 1, NOW());

-- Optional audit example
INSERT INTO AuditLogs (actor_type, actor_id, action_type, entity_type, entity_id, outcome, details) VALUES
    ('STAFF', 1, 'VERIFY_STUDENT_ID', 'STUDENT_VERIFICATION', 1, 'SUCCESS', 'Verified Alice student ID'),
    ('SYSTEM', NULL, 'AUTO_TRUST_DEDUCT', 'BOOKING', 1, 'SUCCESS', 'Late return trust deduction applied');