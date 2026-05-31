package com.resourcex.resourcex.mapper;

import com.resourcex.resourcex.dto.response.BookingResponse;
import com.resourcex.resourcex.entity.Booking;

public final class BookingMapper {

    private BookingMapper() {
    }

    public static BookingResponse toResponse(Booking booking) {

        if (booking == null) {
            return null;
        }

        return BookingResponse.builder()
                .bookingId(booking.getBookingId())
                .item(ItemMapper.toResponse(booking.getItem()))
                .renter(UserMapper.toResponse(booking.getRenter()))
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .status(
                        booking.getStatus() != null
                                ? booking.getStatus().name()
                                : null
                )
                .rejectionReason(booking.getRejectionReason())
                .bookingMessage(booking.getBookingMessage())
                .totalPrice(booking.getTotalPrice())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}