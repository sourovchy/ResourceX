package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.CreateReviewRequest;
import com.resourcex.resourcex.dto.response.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReviewService {

    ReviewResponse createReview(CreateReviewRequest request);

    ReviewResponse getReviewById(Long reviewId);

    Page<ReviewResponse> getAllReviews(Pageable pageable);

    List<ReviewResponse> getReviewsByReviewer(Long reviewerId);

    List<ReviewResponse> getReviewsByReviewee(Long revieweeId);

    void deleteReview(Long reviewId);
}