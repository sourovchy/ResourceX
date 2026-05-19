package com.thirdhand.campusvault.service.impl;

import com.thirdhand.campusvault.dto.request.CreateBookingRequest;
import com.thirdhand.campusvault.dto.response.BookingResponse;
import com.thirdhand.campusvault.service.BookingService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingServiceImpl implements BookingService {

    @Override
    public BookingResponse createBooking(CreateBookingRequest request) {
        return new BookingResponse();
    }

    @Override
    public BookingResponse getBookingById(Long bookingId) {
        return new BookingResponse();
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return List.of();
    }
}