package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.CreateReviewRequest;
import com.resourcex.resourcex.dto.response.ReviewResponse;
import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.Review;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.exception.ForbiddenException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.exception.custom.DuplicateResourceException;
import com.resourcex.resourcex.mapper.ReviewMapper;
import com.resourcex.resourcex.repository.BookingRepository;
import com.resourcex.resourcex.repository.ReviewRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Override
    public ReviewResponse createReview(CreateReviewRequest request) {
        User reviewer = resolveCurrentUser();

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getRenter().getUserId().equals(reviewer.getUserId())) {
            throw new ForbiddenException("Only the renter can review this booking");
        }

        if (reviewRepository.existsByBookingAndReviewer(booking, reviewer)) {
            throw new DuplicateResourceException("You have already reviewed this booking");
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
    @Transactional(readOnly = true)
    public ReviewResponse getReviewById(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        User currentUser = resolveCurrentUser();
        if (!isAdmin()
                && !review.getReviewer().getUserId().equals(currentUser.getUserId())
                && !review.getReviewee().getUserId().equals(currentUser.getUserId())) {
            throw new ForbiddenException("You do not have permission to view this review");
        }

        return ReviewMapper.toResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getAllReviews(Pageable pageable) {
        User currentUser = resolveCurrentUser();

        if (isAdmin()) {
            return reviewRepository.findAll(pageable).map(ReviewMapper::toResponse);
        }

        List<ReviewResponse> userReviews = reviewRepository.findAll()
                .stream()
                .filter(review ->
                        review.getReviewer().getUserId().equals(currentUser.getUserId())
                                || review.getReviewee().getUserId().equals(currentUser.getUserId()))
                .map(ReviewMapper::toResponse)
                .toList();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), userReviews.size());
        List<ReviewResponse> pageSlice = start >= userReviews.size() ? List.of() : userReviews.subList(start, end);
        return new PageImpl<>(pageSlice, pageable, userReviews.size());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByReviewer(Long reviewerId) {
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found"));

        User currentUser = resolveCurrentUser();
        if (!isAdmin() && !currentUser.getUserId().equals(reviewer.getUserId())) {
            throw new ForbiddenException("You do not have permission to view these reviews");
        }

        return reviewRepository.findByReviewer(reviewer)
                .stream()
                .map(ReviewMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByReviewee(Long revieweeId) {
        User reviewee = userRepository.findById(revieweeId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewee not found"));

        User currentUser = resolveCurrentUser();
        if (!isAdmin() && !currentUser.getUserId().equals(reviewee.getUserId())) {
            throw new ForbiddenException("You do not have permission to view these reviews");
        }

        return reviewRepository.findByReviewee(reviewee)
                .stream()
                .map(ReviewMapper::toResponse)
                .toList();
    }

    @Override
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        User currentUser = resolveCurrentUser();
        boolean owner = review.getReviewer().getUserId().equals(currentUser.getUserId());
        if (!isAdmin() && !owner) {
            throw new ForbiddenException("You do not have permission to delete this review");
        }

        reviewRepository.delete(review);
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