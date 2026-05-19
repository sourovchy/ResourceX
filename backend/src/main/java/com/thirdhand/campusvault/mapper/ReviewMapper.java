package com.thirdhand.campusvault.mapper;

import com.thirdhand.campusvault.dto.response.ReviewResponse;
import com.thirdhand.campusvault.entity.Review;

public class ReviewMapper {

    public static ReviewResponse toResponse(Review review) {

        if (review == null) {
            return null;
        }

        return ReviewResponse.builder()
                .reviewId(review.getReviewId())
                .bookingId(review.getBooking().getBookingId())
                .reviewer(UserMapper.toResponse(review.getReviewer()))
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}