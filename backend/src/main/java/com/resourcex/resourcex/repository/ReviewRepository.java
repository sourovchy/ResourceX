package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.Review;
import com.resourcex.resourcex.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByReviewer(User reviewer);

    List<Review> findByReviewee(User reviewee);
}