package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.response.AnalyticsResponse;
import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.Dispute;
import com.resourcex.resourcex.entity.Penalty;
import com.resourcex.resourcex.repository.*;
import com.resourcex.resourcex.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
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

        return AnalyticsResponse.builder()
                .metrics(metrics)
                .charts(Map.of())
                .trends(Map.of())
                .build();
    }
}
