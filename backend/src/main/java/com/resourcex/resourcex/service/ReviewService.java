package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.CreateReviewRequest;
import com.resourcex.resourcex.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {

    ReviewResponse createReview(CreateReviewRequest request);

    ReviewResponse getReviewById(Long reviewId);

    List<ReviewResponse> getAllReviews();

    List<ReviewResponse> getReviewsByReviewer(Long reviewerId);

    List<ReviewResponse> getReviewsByReviewee(Long revieweeId);

    void deleteReview(Long reviewId);
}