package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.response.AnalyticsResponse;
import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.Dispute;
import com.resourcex.resourcex.entity.Penalty;
import com.resourcex.resourcex.repository.*;
import com.resourcex.resourcex.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final DisputeRepository disputeRepository;
    private final PenaltyRepository penaltyRepository;
    private final TrustEventRepository trustEventRepository;

    @Override
    public AnalyticsResponse getAnalytics() {

        Map<String, Object> metrics = new HashMap<>();

        metrics.put("totalUsers", userRepository.count());

        metrics.put("totalItems", itemRepository.count());

        metrics.put("totalBookings", bookingRepository.count());

        metrics.put(
                "activeBookings",
                bookingRepository.countByStatus(Booking.BookingStatus.APPROVED)
        );

        metrics.put(
                "completedBookings",
                bookingRepository.countByStatus(Booking.BookingStatus.COMPLETED)
        );

        metrics.put(
                "cancelledBookings",
                bookingRepository.countByStatus(Booking.BookingStatus.CANCELLED)
        );

        metrics.put(
                "totalDisputes",
                disputeRepository.count()
        );

        metrics.put(
                "openDisputes",
                disputeRepository.countByStatus(Dispute.DisputeStatus.OPEN)
        );

        metrics.put(
                "resolvedDisputes",
                disputeRepository.countByStatus(Dispute.DisputeStatus.RESOLVED)
        );

        metrics.put(
                "totalPenalties",
                penaltyRepository.count()
        );

        metrics.put(
                "appliedPenalties",
                penaltyRepository.countByStatus(Penalty.PenaltyStatus.APPLIED)
        );

        metrics.put(
                "waivedPenalties",
                penaltyRepository.countByStatus(Penalty.PenaltyStatus.WAIVED)
        );

        metrics.put(
                "totalTrustEvents",
                trustEventRepository.count()
        );

        BigDecimal revenue = paymentRepository.sumSuccessfulRevenue();

        metrics.put(
                "revenue",
                revenue != null ? revenue : BigDecimal.ZERO
        );

        // ── Real chart data (replaces previously fabricated client-side charts) ──
        Map<String, Object> charts = new HashMap<>();

        // Top 5 most-booked items
        List<Map<String, Object>> topItems = new ArrayList<>();
        for (Object[] row : bookingRepository.findTopBookedItems(PageRequest.of(0, 5))) {
            topItems.add(labelValue(row));
        }
        charts.put("topItems", topItems);

        // Item distribution by category
        List<Map<String, Object>> categoryDistribution = new ArrayList<>();
        for (Object[] row : itemRepository.countItemsByCategory()) {
            categoryDistribution.add(labelValue(row));
        }
        charts.put("categoryDistribution", categoryDistribution);

        return AnalyticsResponse.builder()
                .metrics(metrics)
                .charts(charts)
                .trends(Map.of())
                .build();
    }

    private Map<String, Object> labelValue(Object[] row) {
        Map<String, Object> entry = new HashMap<>();
        entry.put("label", row[0] != null ? row[0].toString() : "Unknown");
        entry.put("value", row[1] != null ? ((Number) row[1]).longValue() : 0L);
        return entry;
    }
}
