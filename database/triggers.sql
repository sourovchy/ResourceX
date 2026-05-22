USE resourcex;

-- TRIGGER 1: Handle return and update trust score
DELIMITER $$

DROP TRIGGER IF EXISTS trigger_late_return$$
CREATE TRIGGER trigger_late_return
BEFORE UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.returned_date IS NOT NULL AND OLD.returned_date IS NULL THEN
        IF NEW.returned_date > OLD.end_date THEN
            UPDATE student_profiles
            SET trust_score = GREATEST(trust_score - 5, 0)
            WHERE user_id = NEW.renter_id;

            INSERT INTO trust_events (
                user_id, change_amount, old_score, new_score,
                source_type, source_id, reason, created_by_user_id
            )
            VALUES (
                NEW.renter_id,
                -5,
                (SELECT trust_score + 5 FROM student_profiles WHERE user_id = NEW.renter_id),
                (SELECT trust_score FROM student_profiles WHERE user_id = NEW.renter_id),
                'SYSTEM',
                NEW.booking_id,
                CONCAT('Late return for booking #', NEW.booking_id),
                NULL
            );

            INSERT INTO audit_logs (
                actor_type, actor_id, action_type, entity_type, entity_id, outcome, details
            )
            VALUES (
                'SYSTEM',
                NULL,
                'AUTO_TRUST_DEDUCT',
                'BOOKING',
                NEW.booking_id,
                'SUCCESS',
                CONCAT('Late return trust deduction for user #', NEW.renter_id)
            );
        END IF;

        SET NEW.status = 'COMPLETED';

        UPDATE items
        SET status = 'AVAILABLE'
        WHERE item_id = NEW.item_id;
    END IF;
END$$

DELIMITER ;

-- TRIGGER 2: Update trust score based on reviews
DELIMITER $$

DROP TRIGGER IF EXISTS trigger_trust_score_review$$
CREATE TRIGGER trigger_trust_score_review
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    DECLARE old_score INT;
    DECLARE new_score INT;
    DECLARE change_amt INT;

    SET old_score = (SELECT trust_score FROM student_profiles WHERE user_id = NEW.reviewee_id);

    IF NEW.rating <= 2 THEN
        SET change_amt = -2;
        SET new_score = GREATEST(old_score - 2, 0);

        UPDATE student_profiles
        SET trust_score = new_score
        WHERE user_id = NEW.reviewee_id;

        INSERT INTO trust_events (
            user_id, change_amount, old_score, new_score,
            source_type, source_id, reason, created_by_user_id
        )
        VALUES (
            NEW.reviewee_id,
            change_amt,
            old_score,
            new_score,
            'REVIEW',
            NEW.review_id,
            CONCAT('Bad review (', NEW.rating, ' stars) for booking #', NEW.booking_id),
            NULL
        );

        INSERT INTO audit_logs (
            actor_type, actor_id, action_type, entity_type, entity_id, outcome, details
        )
        VALUES (
            'SYSTEM',
            NULL,
            'AUTO_TRUST_DEDUCT',
            'REVIEW',
            NEW.review_id,
            'SUCCESS',
            CONCAT('Trust deducted from user #', NEW.reviewee_id)
        );

    ELSEIF NEW.rating = 5 THEN
        SET change_amt = 1;
        SET new_score = LEAST(old_score + 1, 100);

        UPDATE student_profiles
        SET trust_score = new_score
        WHERE user_id = NEW.reviewee_id;

        INSERT INTO trust_events (
            user_id, change_amount, old_score, new_score,
            source_type, source_id, reason, created_by_user_id
        )
        VALUES (
            NEW.reviewee_id,
            change_amt,
            old_score,
            new_score,
            'REVIEW',
            NEW.review_id,
            CONCAT('Excellent review (5 stars) for booking #', NEW.booking_id),
            NULL
        );

        INSERT INTO audit_logs (
            actor_type, actor_id, action_type, entity_type, entity_id, outcome, details
        )
        VALUES (
            'SYSTEM',
            NULL,
            'AUTO_TRUST_ADD',
            'REVIEW',
            NEW.review_id,
            'SUCCESS',
            CONCAT('Trust added to user #', NEW.reviewee_id)
        );
    END IF;
END$$

DELIMITER ;

-- TRIGGER 3: Prevent overlapping bookings
DELIMITER $$

DROP TRIGGER IF EXISTS prevent_overlapping_bookings$$
CREATE TRIGGER prevent_overlapping_bookings
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE conflict_count INT;

    SELECT COUNT(*)
    INTO conflict_count
    FROM bookings
    WHERE item_id = NEW.item_id
      AND status IN ('APPROVED', 'PENDING')
      AND (
        (NEW.start_date BETWEEN start_date AND end_date) OR
        (NEW.end_date BETWEEN start_date AND end_date) OR
        (start_date BETWEEN NEW.start_date AND NEW.end_date)
      );

    IF conflict_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'This item is already booked for the selected date range';
    END IF;
END$$

DELIMITER ;

-- TRIGGER 4: Update item status when booking changes
DELIMITER $$

DROP TRIGGER IF EXISTS update_item_status_on_booking_update$$
CREATE TRIGGER update_item_status_on_booking_update
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.status = 'APPROVED' AND OLD.status <> 'APPROVED' THEN
        UPDATE items
        SET status = 'UNAVAILABLE'
        WHERE item_id = NEW.item_id;
    END IF;

    IF NEW.status IN ('CANCELLED', 'REJECTED', 'COMPLETED') AND OLD.status = 'APPROVED' THEN
        UPDATE items
        SET status = 'AVAILABLE'
        WHERE item_id = NEW.item_id
          AND NOT EXISTS (
              SELECT 1
              FROM bookings
              WHERE item_id = NEW.item_id
                AND status = 'APPROVED'
                AND booking_id <> NEW.booking_id
          );
    END IF;
END$$

DELIMITER ;

-- TRIGGER 5: Log item changes in audit log
DELIMITER $$

DROP TRIGGER IF EXISTS log_item_changes$$
CREATE TRIGGER log_item_changes
AFTER UPDATE ON items
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO audit_logs (
            actor_type, actor_id, action_type, entity_type, entity_id, outcome, details
        )
        VALUES (
            'SYSTEM',
            NULL,
            'ITEM_STATUS_CHANGE',
            'ITEM',
            NEW.item_id,
            'SUCCESS',
            CONCAT('Item status changed from ', OLD.status, ' to ', NEW.status)
        );
    END IF;
END$$

DELIMITER ;

SHOW TRIGGERS FROM resourcex;
