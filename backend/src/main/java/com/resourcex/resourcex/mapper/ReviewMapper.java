package com.resourcex.resourcex.mapper;

import com.resourcex.resourcex.dto.response.ReviewResponse;
import com.resourcex.resourcex.entity.Review;

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