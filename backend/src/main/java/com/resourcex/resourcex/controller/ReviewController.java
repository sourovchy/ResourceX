package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.CreateReviewRequest;
import com.resourcex.resourcex.dto.response.ReviewResponse;
import com.resourcex.resourcex.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    public List<ReviewResponse> getAllReviews() {
        return reviewService.getAllReviews();
    }

    @GetMapping("/reviewer/{reviewerId}")
    public List<ReviewResponse> getReviewsByReviewer(@PathVariable Long reviewerId) {
        return reviewService.getReviewsByReviewer(reviewerId);
    }

    @GetMapping("/reviewee/{revieweeId}")
    public List<ReviewResponse> getReviewsByReviewee(@PathVariable Long revieweeId) {
        return reviewService.getReviewsByReviewee(revieweeId);
    }

    @DeleteMapping("/{reviewId}")
    public void deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
    }
}