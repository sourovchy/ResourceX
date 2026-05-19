package com.thirdhand.campusvault.repository;

import com.thirdhand.campusvault.entity.Review;
import com.thirdhand.campusvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByReviewer(User reviewer);

    List<Review> findByReviewee(User reviewee);
}