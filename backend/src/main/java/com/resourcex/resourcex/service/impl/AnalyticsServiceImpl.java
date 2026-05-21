package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.response.AnalyticsResponse;
import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.repository.BookingRepository;
import com.resourcex.resourcex.repository.ItemRepository;
import com.resourcex.resourcex.repository.PaymentRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public AnalyticsResponse getAnalytics() {
        return AnalyticsResponse.builder()
                .metrics(Map.of(
                        "totalUsers", userRepository.count(),
                        "totalItems", itemRepository.count(),
                        "totalBookings", bookingRepository.count(),
                        "activeBookings", bookingRepository.countByStatus(Booking.BookingStatus.ACTIVE),
                        "revenue", paymentRepository.sumSuccessfulRevenue()
                ))
                .charts(Map.of())
                .trends(Map.of())
                .build();
    }
}
