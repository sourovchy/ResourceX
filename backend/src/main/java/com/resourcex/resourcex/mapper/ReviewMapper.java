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
                .bookingId(
                        review.getBooking() != null
                                ? review.getBooking().getBookingId()
                                : null
                )
                .reviewer(
                        review.getReviewer() != null
                                ? UserMapper.toResponse(review.getReviewer())
                                : null
                )
                .reviewee(
                        review.getReviewee() != null
                                ? UserMapper.toResponse(review.getReviewee())
                                : null
                )
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}