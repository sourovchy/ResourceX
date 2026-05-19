package com.thirdhand.campusvault.controller;

import com.thirdhand.campusvault.dto.request.CreateReviewRequest;
import com.thirdhand.campusvault.dto.response.ReviewResponse;
import com.thirdhand.campusvault.service.ReviewService;
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
    public ReviewResponse createReview(
            @Valid @RequestBody CreateReviewRequest request
    ) {
        return reviewService.createReview(request);
    }

    @GetMapping
    public List<ReviewResponse> getAllReviews() {
        return reviewService.getAllReviews();
    }
}