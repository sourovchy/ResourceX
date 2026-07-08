package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.CreateReviewRequest;
import com.resourcex.resourcex.dto.response.ReviewEligibilityResponse;
import com.resourcex.resourcex.dto.response.ReviewResponse;
import com.resourcex.resourcex.dto.response.ReviewSummaryResponse;
import com.resourcex.resourcex.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ReviewResponse createReview(@Valid @RequestBody CreateReviewRequest request) {
        return reviewService.createReview(request);
    }

    @GetMapping("/{reviewId}")
    public ReviewResponse getReviewById(@PathVariable Long reviewId) {
        return reviewService.getReviewById(reviewId);
    }

    @GetMapping
    public Page<ReviewResponse> getAllReviews(
            @PageableDefault(size = 20, sort = "reviewId", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return reviewService.getAllReviews(pageable);
    }

    @GetMapping("/reviewer/{reviewerId}")
    public List<ReviewResponse> getReviewsByReviewer(@PathVariable Long reviewerId) {
        return reviewService.getReviewsByReviewer(reviewerId);
    }

    @GetMapping("/reviewee/{revieweeId}")
    public List<ReviewResponse> getReviewsByReviewee(@PathVariable Long revieweeId) {
        return reviewService.getReviewsByReviewee(revieweeId);
    }

    @GetMapping("/item/{itemId}")
    public Page<ReviewResponse> getReviewsByItem(
            @PathVariable Long itemId,
            @PageableDefault(size = 5, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return reviewService.getReviewsByItem(itemId, pageable);
    }

    @GetMapping("/item/{itemId}/summary")
    public ReviewSummaryResponse getItemReviewSummary(@PathVariable Long itemId) {
        return reviewService.getItemReviewSummary(itemId);
    }

    @GetMapping("/item/{itemId}/eligibility")
    public ReviewEligibilityResponse getItemReviewEligibility(@PathVariable Long itemId) {
        return reviewService.getItemReviewEligibility(itemId);
    }

    @GetMapping("/owner/{ownerId}/summary")
    public ReviewSummaryResponse getOwnerReviewSummary(@PathVariable Long ownerId) {
        return reviewService.getOwnerReviewSummary(ownerId);
    }

    @DeleteMapping("/{reviewId}")
    public void deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
    }
}