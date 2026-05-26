package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.Review;
import com.resourcex.resourcex.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByReviewer(User reviewer);

    List<Review> findByReviewee(User reviewee);

    boolean existsByBookingAndReviewer(Booking booking, User reviewer);

    List<Review> findAllByOrderByReviewIdDesc();

    List<Review> findByReviewerOrderByReviewIdDesc(User reviewer);

    List<Review> findByRevieweeOrderByReviewIdDesc(User reviewee);

    List<Review> findByCreatedAtBetweenOrderByReviewIdDesc(
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    long countByReviewee(User reviewee);
}