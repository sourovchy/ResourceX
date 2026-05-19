package com.thirdhand.campusvault.service.impl;

import com.thirdhand.campusvault.dto.request.CreateReviewRequest;
import com.thirdhand.campusvault.dto.response.ReviewResponse;
import com.thirdhand.campusvault.service.ReviewService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Override
    public ReviewResponse createReview(CreateReviewRequest request) {
        return new ReviewResponse();
    }

    @Override
    public List<ReviewResponse> getAllReviews() {
        return List.of();
    }
}