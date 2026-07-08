package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.CreateReviewRequest;
import com.resourcex.resourcex.dto.response.ReviewEligibilityResponse;
import com.resourcex.resourcex.dto.response.ReviewResponse;
import com.resourcex.resourcex.dto.response.ReviewSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReviewService {

    ReviewResponse createReview(CreateReviewRequest request);

    ReviewResponse getReviewById(Long reviewId);

    Page<ReviewResponse> getAllReviews(Pageable pageable);

    List<ReviewResponse> getReviewsByReviewer(Long reviewerId);

    List<ReviewResponse> getReviewsByReviewee(Long revieweeId);

    /** Public-facing, paginated reviews for a single item (visible to any authenticated user). */
    Page<ReviewResponse> getReviewsByItem(Long itemId, Pageable pageable);

    /** Aggregate rating snapshot for a single item. */
    ReviewSummaryResponse getItemReviewSummary(Long itemId);

    /** Aggregate rating snapshot across everything an owner has received. */
    ReviewSummaryResponse getOwnerReviewSummary(Long ownerId);

    /** Whether the current user may review the given item, and which booking is reviewable. */
    ReviewEligibilityResponse getItemReviewEligibility(Long itemId);

    void deleteReview(Long reviewId);
}