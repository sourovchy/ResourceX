package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.response.PlatformActivityResponse;
import com.resourcex.resourcex.entity.UserStatus;
import com.resourcex.resourcex.repository.BookingRepository;
import com.resourcex.resourcex.repository.ItemRepository;
import com.resourcex.resourcex.repository.ReportRepository;
import com.resourcex.resourcex.repository.ReviewRepository;
import com.resourcex.resourcex.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Builds the admin "platform activity" feed by merging the most recent rows
 * across users, pending verifications, items, bookings, reports and reviews into
 * a single time-ordered list. Extracted from {@code AdminServiceImpl} because it
 * is a self-contained read-only aggregation over six repositories, unrelated to
 * the admin user-management actions; {@code AdminServiceImpl.getPlatformActivities}
 * delegates here so the AdminService interface is unchanged.
 */
@Component
@RequiredArgsConstructor
public class PlatformActivityAggregator {

    /** Rows pulled per source, and the final merged-feed cap. */
    private static final int FEED_LIMIT = 20;

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final BookingRepository bookingRepository;
    private final ReportRepository reportRepository;
    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public List<PlatformActivityResponse> getPlatformActivities() {
        List<PlatformActivityResponse> activities = new ArrayList<>();

        // Users
        userRepository.findAll(PageRequest.of(0, FEED_LIMIT, Sort.by("userId").descending())).getContent()
                .forEach(u -> activities.add(PlatformActivityResponse.builder()
                        .type("USER_REGISTRATION")
                        .entityId(u.getUserId())
                        .title("New User Registered")
                        .description(u.getName() + " (" + u.getEmail() + ") joined.")
                        .timestamp(u.getCreatedAt())
                        .build()));

        // Pending Verifications
        userRepository.findByStatusOrderByUserIdDesc(UserStatus.PENDING).stream()
                .limit(FEED_LIMIT)
                .forEach(pu -> activities.add(PlatformActivityResponse.builder()
                        .type("PENDING_VERIFICATION")
                        .entityId(pu.getUserId())
                        .title("Verification Request")
                        .description(pu.getName() + " requested verification.")
                        .timestamp(pu.getCreatedAt())
                        .build()));

        // Items
        itemRepository.findAll(PageRequest.of(0, FEED_LIMIT, Sort.by("itemId").descending())).getContent()
                .forEach(i -> activities.add(PlatformActivityResponse.builder()
                        .type("LISTING_CREATED")
                        .entityId(i.getItemId())
                        .title("New Listing Created")
                        .description("Title: " + i.getTitle() + " (Category: " + (i.getCategory() != null ? i.getCategory().getName() : "Uncategorized") + ")")
                        .timestamp(i.getCreatedAt())
                        .build()));

        // Bookings
        bookingRepository.findAll(PageRequest.of(0, FEED_LIMIT, Sort.by("bookingId").descending())).getContent()
                .forEach(b -> activities.add(PlatformActivityResponse.builder()
                        .type("BOOKING_CREATED")
                        .entityId(b.getBookingId())
                        .title("New Booking Created")
                        .description("Renter: " + (b.getRenter() != null ? b.getRenter().getName() : "Unknown") + " booked " + (b.getItem() != null ? b.getItem().getTitle() : "Unknown item"))
                        .timestamp(b.getCreatedAt())
                        .build()));

        // Reports
        reportRepository.findAll(PageRequest.of(0, FEED_LIMIT, Sort.by("reportId").descending())).getContent()
                .forEach(r -> activities.add(PlatformActivityResponse.builder()
                        .type("REPORT_SUBMITTED")
                        .entityId(r.getReportId())
                        .title("New Report Submitted")
                        .description("Reason: " + r.getReason())
                        .timestamp(r.getCreatedAt())
                        .build()));

        // Reviews
        reviewRepository.findAll(PageRequest.of(0, FEED_LIMIT, Sort.by("reviewId").descending())).getContent()
                .forEach(rv -> activities.add(PlatformActivityResponse.builder()
                        .type("REVIEW_SUBMITTED")
                        .entityId(rv.getReviewId())
                        .title("New Review Submitted")
                        .description("Rating: " + rv.getRating() + " stars. Comment: " + rv.getComment())
                        .timestamp(rv.getCreatedAt())
                        .build()));

        // Newest first; nulls last.
        activities.sort(Comparator.comparing(
                PlatformActivityResponse::getTimestamp,
                Comparator.nullsLast(Comparator.reverseOrder())));

        return activities.stream().limit(FEED_LIMIT).collect(java.util.stream.Collectors.toList());
    }
}
