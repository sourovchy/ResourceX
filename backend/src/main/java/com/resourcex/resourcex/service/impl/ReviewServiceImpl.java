package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.CreateReviewRequest;
import com.resourcex.resourcex.dto.response.ReviewResponse;
import com.resourcex.resourcex.service.ReviewService;
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