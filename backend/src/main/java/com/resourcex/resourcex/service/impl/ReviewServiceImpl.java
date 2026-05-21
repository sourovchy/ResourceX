package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.CreateReviewRequest;
import com.resourcex.resourcex.dto.response.ReviewResponse;
import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.Review;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.exception.ForbiddenException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.mapper.ReviewMapper;
import com.resourcex.resourcex.repository.BookingRepository;
import com.resourcex.resourcex.repository.ReviewRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ReviewResponse createReview(CreateReviewRequest request) {
        User reviewer = resolveCurrentUser();
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getRenter().getUserId().equals(reviewer.getUserId())) {
            throw new ForbiddenException("Only the renter can review this booking");
        }

        Review review = Review.builder()
                .booking(booking)
                .reviewer(reviewer)
                .reviewee(booking.getItem().getOwner())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        return ReviewMapper.toResponse(reviewRepository.save(review));
    }

    @Override
    public List<ReviewResponse> getAllReviews() {
        User user = resolveCurrentUser();
        return reviewRepository.findAll().stream()
                .filter(review -> isAdmin()
                        || review.getReviewer().getUserId().equals(user.getUserId())
                        || review.getReviewee().getUserId().equals(user.getUserId()))
                .map(ReviewMapper::toResponse)
                .toList();
    }

    private User resolveCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ForbiddenException("Authenticated user not found");
        }
        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null
                && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }
}
