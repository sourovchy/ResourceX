package com.thirdhand.campusvault.mapper;

import com.thirdhand.campusvault.dto.response.BookingResponse;
import com.thirdhand.campusvault.entity.Booking;

public class BookingMapper {

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
                .status(booking.getStatus() != null ? booking.getStatus().name() : null)
                .totalPrice(booking.getTotalPrice())
                .build();
    }
}