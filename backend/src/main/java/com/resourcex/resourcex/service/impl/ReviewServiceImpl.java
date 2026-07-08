package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.CreateReviewRequest;
import com.resourcex.resourcex.dto.response.ReviewEligibilityResponse;
import com.resourcex.resourcex.dto.response.ReviewResponse;
import com.resourcex.resourcex.dto.response.ReviewSnippetResponse;
import com.resourcex.resourcex.dto.response.ReviewSummaryResponse;
import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.Item;
import com.resourcex.resourcex.entity.Review;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.exception.ForbiddenException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.exception.custom.DuplicateResourceException;
import com.resourcex.resourcex.mapper.ReviewMapper;
import com.resourcex.resourcex.exception.BadRequestException;
import com.resourcex.resourcex.repository.BookingRepository;
import com.resourcex.resourcex.repository.ItemRepository;
import com.resourcex.resourcex.repository.ReviewRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.NotificationService;
import com.resourcex.resourcex.service.ReviewService;
import com.resourcex.resourcex.service.TrustScoreService;
import com.resourcex.resourcex.util.constants.TrustPoints;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    /** Max trust-affecting reviews allowed from one user toward another within the window. */
    private static final int REVIEW_FARMING_LIMIT = 3;
    private static final int REVIEW_FARMING_WINDOW_DAYS = 30;

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final TrustScoreService trustScoreService;
    private final com.resourcex.resourcex.security.AccountAccessGuard accountAccessGuard;

    @Override
    public ReviewResponse createReview(CreateReviewRequest request) {
        User reviewer = resolveCurrentUser();

        // Only approved (ACTIVE) accounts may leave reviews.
        accountAccessGuard.requireActive(reviewer);

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getRenter().getUserId().equals(reviewer.getUserId())) {
            throw new ForbiddenException("Only the renter can review this booking");
        }

        // Trust requires a finished transaction before reputation is affected.
        if (booking.getStatus() != Booking.BookingStatus.COMPLETED) {
            throw new BadRequestException("You can only review a completed booking");
        }

        if (reviewRepository.existsByBookingAndReviewer(booking, reviewer)) {
            throw new DuplicateResourceException("You have already reviewed this booking");
        }

        User reviewee = booking.getItem().getOwner();

        // Anti-abuse: a reviewer must never be able to review themselves.
        if (reviewee == null || reviewee.getUserId().equals(reviewer.getUserId())) {
            throw new BadRequestException("You cannot review yourself");
        }

        Review review = Review.builder()
                .booking(booking)
                .reviewer(reviewer)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review saved = reviewRepository.save(review);

        applyReviewTrust(reviewer, reviewee, saved);

        // Notify the reviewee (item owner) that they received a review
        notificationService.createReviewNotification(
                saved.getBooking().getItem().getOwner().getUserId(),
                saved.getReviewId(),
                reviewer.getName() + " left you a " + saved.getRating() + "-star review for \""
                        + booking.getItem().getTitle() + "\".",
                reviewer.getUserId()
        );

        return ReviewMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getReviewById(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        User currentUser = resolveCurrentUser();
        if (!isAdmin()
                && !review.getReviewer().getUserId().equals(currentUser.getUserId())
                && !review.getBooking().getItem().getOwner().getUserId().equals(currentUser.getUserId())) {
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
                                || review.getBooking().getItem().getOwner().getUserId().equals(currentUser.getUserId()))
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
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByItem(Long itemId, Pageable pageable) {
        // Reviews are public on the item page; any authenticated user may read them.
        if (!itemRepository.existsById(itemId)) {
            throw new ResourceNotFoundException("Item not found");
        }
        return reviewRepository.findByBooking_Item_ItemId(itemId, pageable)
                .map(ReviewMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewSummaryResponse getItemReviewSummary(Long itemId) {
        if (!itemRepository.existsById(itemId)) {
            throw new ResourceNotFoundException("Item not found");
        }
        return buildSummary(reviewRepository.ratingDistributionByItem(itemId));
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewSummaryResponse getOwnerReviewSummary(Long ownerId) {
        User reviewee = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ReviewSummaryResponse summary = buildSummary(reviewRepository.ratingDistributionByReviewee(ownerId));
        summary.setRecentSnippets(
                reviewRepository.findByRevieweeOrderByReviewIdDesc(reviewee).stream()
                        .limit(3)
                        .map(this::toSnippet)
                        .toList());
        long completedCount = bookingRepository.countByItem_Owner_UserIdAndStatus(ownerId, Booking.BookingStatus.COMPLETED);
        summary.setCompletedRentals(completedCount);
        return summary;
    }

    private ReviewSnippetResponse toSnippet(Review review) {
        String comment = review.getComment() == null ? "" : review.getComment().trim();
        String excerpt = comment.length() > 120 ? comment.substring(0, 117) + "…" : comment;
        return ReviewSnippetResponse.builder()
                .rating(review.getRating() != null ? review.getRating() : 0)
                .excerpt(excerpt)
                .reviewerName(review.getReviewer() != null ? review.getReviewer().getName() : "Reviewer")
                .createdAt(review.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewEligibilityResponse getItemReviewEligibility(Long itemId) {
        User user = resolveCurrentUser();
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        // Owners cannot review their own listings.
        if (item.getOwner() != null && item.getOwner().getUserId().equals(user.getUserId())) {
            return ReviewEligibilityResponse.builder()
                    .eligible(false)
                    .ownItem(true)
                    .reason("You cannot review your own listing.")
                    .build();
        }

        List<Booking> completed = bookingRepository.findByItemAndRenterAndStatus(
                item, user, Booking.BookingStatus.COMPLETED);

        if (completed.isEmpty()) {
            return ReviewEligibilityResponse.builder()
                    .eligible(false)
                    .reason("You can review this item after completing a booking for it.")
                    .build();
        }

        // The first completed booking without a review is the one we let them submit against.
        Booking reviewable = completed.stream()
                .filter(b -> !reviewRepository.existsByBookingAndReviewer(b, user))
                .findFirst()
                .orElse(null);

        if (reviewable == null) {
            return ReviewEligibilityResponse.builder()
                    .eligible(false)
                    .alreadyReviewed(true)
                    .reason("You have already reviewed your booking for this item.")
                    .build();
        }

        return ReviewEligibilityResponse.builder()
                .eligible(true)
                .bookingId(reviewable.getBookingId())
                .build();
    }

    /** Turn a [rating, count] histogram into a complete 1..5 summary with rounded average. */
    private ReviewSummaryResponse buildSummary(List<Object[]> distributionRows) {
        Map<Integer, Long> distribution = new LinkedHashMap<>();
        for (int star = 5; star >= 1; star--) {
            distribution.put(star, 0L);
        }

        long total = 0;
        long weightedSum = 0;
        for (Object[] row : distributionRows) {
            int rating = ((Number) row[0]).intValue();
            long count = ((Number) row[1]).longValue();
            distribution.put(rating, count);
            total += count;
            weightedSum += (long) rating * count;
        }

        double average = total == 0 ? 0.0 : Math.round((double) weightedSum / total * 10.0) / 10.0;

        return ReviewSummaryResponse.builder()
                .averageRating(average)
                .totalReviews(total)
                .distribution(distribution)
                .build();
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

    /**
     * Apply the rating-driven trust change to the reviewee, guarding against
     * review farming (excessive reviews between the same pair of users).
     */
    private void applyReviewTrust(User reviewer, User reviewee, Review review) {
        LocalDateTime windowStart = LocalDateTime.now().minusDays(REVIEW_FARMING_WINDOW_DAYS);
        long recent = reviewRepository.countByReviewerAndRevieweeAndCreatedAtAfter(reviewer, reviewee, windowStart);
        if (recent > REVIEW_FARMING_LIMIT) {
            // Review still recorded, but it no longer moves the trust score.
            return;
        }

        int points = TrustPoints.forRating(review.getRating());
        trustScoreService.applyTrustChange(
                reviewee.getUserId(),
                points,
                "Received a " + review.getRating() + "-star review");
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