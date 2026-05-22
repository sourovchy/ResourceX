USE resourcex;

-- VIEW 1: Available items with owner details
DROP VIEW IF EXISTS Item_Availability_View;
CREATE VIEW Item_Availability_View AS
SELECT 
    i.item_id,
    i.title,
    i.description,
    i.category,
    i.daily_rate,
    i.item_condition,
    u.name AS owner_name,
    u.trust_score,
    univ.name AS university_name,
    i.created_at
FROM Items i
JOIN Users u ON i.owner_id = u.user_id
LEFT JOIN Universities univ ON u.university_id = univ.university_id
WHERE i.status = 'AVAILABLE';

-- VIEW 2: Active / ongoing bookings
DROP VIEW IF EXISTS Ongoing_Bookings_View;
CREATE VIEW Ongoing_Bookings_View AS
SELECT 
    b.booking_id,
    i.title AS item_name,
    owner.name AS owner_name,
    renter.name AS renter_name,
    b.start_date,
    b.end_date,
    b.status,
    b.total_price,
    CASE 
        WHEN b.end_date < CURDATE() AND b.returned_date IS NULL THEN DATEDIFF(CURDATE(), b.end_date)
        ELSE 0
    END AS days_overdue,
    CASE 
        WHEN b.returned_date IS NOT NULL THEN 'RETURNED'
        WHEN b.end_date < CURDATE() AND b.returned_date IS NULL THEN 'OVERDUE'
        WHEN b.start_date <= CURDATE() AND b.end_date >= CURDATE() THEN 'CURRENT'
        ELSE 'UPCOMING'
    END AS rental_status
FROM Bookings b
JOIN Items i ON b.item_id = i.item_id
JOIN Users owner ON i.owner_id = owner.user_id
JOIN Users renter ON b.renter_id = renter.user_id
WHERE b.status IN ('APPROVED', 'PENDING');

-- VIEW 3: Detailed user profile with activity metrics
DROP VIEW IF EXISTS User_Trust_Status_View;
CREATE VIEW User_Trust_Status_View AS
SELECT 
    u.user_id,
    u.student_id,
    u.name,
    u.email,
    u.phone,
    u.trust_score,
    u.status AS user_status,
    univ.name AS university_name,
    (SELECT COUNT(*) FROM Items WHERE owner_id = u.user_id) AS items_listed,
    (SELECT COUNT(*) FROM Bookings WHERE renter_id = u.user_id) AS total_items_rented,
    (SELECT COUNT(*) FROM Bookings WHERE renter_id = u.user_id AND status = 'COMPLETED') AS completed_rentals,
    (SELECT COUNT(*) FROM Bookings WHERE renter_id = u.user_id AND status IN ('APPROVED', 'PENDING')) AS active_rentals,
    (SELECT COUNT(*) FROM Reviews WHERE reviewee_id = u.user_id) AS reviews_received,
    (SELECT AVG(rating) FROM Reviews WHERE reviewee_id = u.user_id) AS avg_rating,
    CASE 
        WHEN u.trust_score >= 90 THEN 'Excellent'
        WHEN u.trust_score >= 75 THEN 'Good'
        WHEN u.trust_score >= 60 THEN 'Fair'
        WHEN u.trust_score >= 40 THEN 'Warning'
        ELSE 'Suspended'
    END AS trust_standing,
    u.created_at AS member_since
FROM Users u
LEFT JOIN Universities univ ON u.university_id = univ.university_id;

-- VIEW 4: Revenue summary by owner
DROP VIEW IF EXISTS Owner_Revenue_Summary;
CREATE VIEW Owner_Revenue_Summary AS
SELECT 
    u.user_id AS owner_id,
    u.name AS owner_name,
    COUNT(DISTINCT i.item_id) AS total_items,
    COUNT(b.booking_id) AS total_rentals,
    COUNT(CASE WHEN b.status = 'COMPLETED' THEN 1 END) AS completed_rentals,
    SUM(CASE WHEN b.status = 'COMPLETED' THEN b.total_price ELSE 0 END) AS total_revenue,
    AVG(CASE WHEN b.status = 'COMPLETED' THEN b.total_price END) AS avg_rental_value,
    (
        SELECT AVG(r.rating)
        FROM Reviews r
        JOIN Bookings b2 ON r.booking_id = b2.booking_id
        JOIN Items i2 ON b2.item_id = i2.item_id
        WHERE i2.owner_id = u.user_id
    ) AS avg_owner_rating
FROM Users u
LEFT JOIN Items i ON u.user_id = i.owner_id
LEFT JOIN Bookings b ON i.item_id = b.item_id
GROUP BY u.user_id, u.name;

-- VIEW 5: Item performance metrics
DROP VIEW IF EXISTS Item_Performance_View;
CREATE VIEW Item_Performance_View AS
SELECT 
    i.item_id,
    i.title,
    i.category,
    i.daily_rate,
    i.status,
    u.name AS owner_name,
    COUNT(DISTINCT b.booking_id) AS total_bookings,
    COUNT(CASE WHEN b.status = 'COMPLETED' THEN 1 END) AS completed_bookings,
    SUM(CASE WHEN b.status = 'COMPLETED' THEN b.total_price ELSE 0 END) AS total_earned,
    AVG(r.rating) AS avg_rating,
    COUNT(r.review_id) AS review_count,
    DATEDIFF(CURDATE(), i.created_at) AS days_since_listing
FROM Items i
JOIN Users u ON i.owner_id = u.user_id
LEFT JOIN Bookings b ON i.item_id = b.item_id
LEFT JOIN Reviews r ON b.booking_id = r.booking_id
GROUP BY i.item_id, i.title, i.category, i.daily_rate, i.status, u.name, i.created_at;

-- VIEW 6: Moderation dashboard
DROP VIEW IF EXISTS Moderation_Dashboard_View;
CREATE VIEW Moderation_Dashboard_View AS
SELECT 
    'REPORT' AS entity_type,
    r.report_id AS entity_id,
    r.reason AS title,
    ru.name AS submitted_by,
    r.created_at AS submitted_on,
    r.status AS current_status,
    CONCAT('Reported ', r.entity_type, ' #', r.entity_id) AS additional_info
FROM Reports r
JOIN Users ru ON r.reporter_id = ru.user_id
UNION ALL
SELECT
    'DISPUTE' AS entity_type,
    d.dispute_id AS entity_id,
    d.reason AS title,
    u.name AS submitted_by,
    d.created_at AS submitted_on,
    d.status AS current_status,
    CONCAT('Booking #', d.booking_id) AS additional_info
FROM Disputes d
JOIN Users u ON d.raised_by = u.user_id;

-- VIEW 7: Trust score history
DROP VIEW IF EXISTS Recent_Trust_Changes;
CREATE VIEW Recent_Trust_Changes AS
SELECT 
    te.trust_event_id,
    u.name AS user_name,
    u.student_id,
    te.change_amount,
    te.old_score,
    te.new_score,
    te.reason,
    te.source_type,
    te.source_id,
    te.created_at AS change_date,
    u.trust_score AS current_score
FROM TrustEvents te
JOIN Users u ON te.user_id = u.user_id;

-- VIEW 8: University marketplace summary
DROP VIEW IF EXISTS University_Stats_View;
CREATE VIEW University_Stats_View AS
SELECT 
    univ.university_id,
    univ.name AS university_name,
    COUNT(DISTINCT u.user_id) AS total_users,
    COUNT(DISTINCT i.item_id) AS total_items,
    COUNT(DISTINCT CASE WHEN i.status = 'AVAILABLE' THEN i.item_id END) AS available_items,
    COUNT(DISTINCT b.booking_id) AS total_bookings,
    COUNT(DISTINCT CASE WHEN b.status = 'COMPLETED' THEN b.booking_id END) AS completed_bookings,
    SUM(CASE WHEN b.status = 'COMPLETED' THEN b.total_price ELSE 0 END) AS total_revenue,
    AVG(u.trust_score) AS avg_trust_score
FROM Universities univ
LEFT JOIN Users u ON univ.university_id = u.university_id
LEFT JOIN Items i ON u.user_id = i.owner_id
LEFT JOIN Bookings b ON i.item_id = b.item_id
GROUP BY univ.university_id, univ.name;

-- VIEW 9: Dispute and penalty management board
DROP VIEW IF EXISTS Dispute_Management_View;
CREATE VIEW Dispute_Management_View AS
SELECT 
    d.dispute_id,
    d.booking_id,
    d.status AS dispute_status,
    u.name AS raised_by_user,
    d.reason,
    d.resolution,
    p.penalty_id,
    p.amount AS penalty_amount,
    p.status AS penalty_status,
    issuer.name AS issued_by_user,
    d.created_at AS dispute_date,
    p.created_at AS penalty_date
FROM Disputes d
JOIN Users u ON d.raised_by = u.user_id
LEFT JOIN Penalties p ON d.dispute_id = p.dispute_id
LEFT JOIN Users issuer ON p.issued_by_user_id = issuer.user_id;

-- VERIFY VIEWS
SHOW FULL TABLES WHERE Table_type = 'VIEW';
