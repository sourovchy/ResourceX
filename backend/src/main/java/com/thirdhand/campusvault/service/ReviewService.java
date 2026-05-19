package com.thirdhand.campusvault.service;

import com.thirdhand.campusvault.dto.request.CreateReviewRequest;
import com.thirdhand.campusvault.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {

    ReviewResponse createReview(CreateReviewRequest request);

    List<ReviewResponse> getAllReviews();
}