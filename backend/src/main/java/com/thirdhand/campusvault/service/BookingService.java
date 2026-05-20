package com.thirdhand.campusvault.service;

import com.thirdhand.campusvault.dto.request.CreateBookingRequest;
import com.thirdhand.campusvault.dto.response.BookingResponse;

import java.util.List;

public interface BookingService {

    BookingResponse createBooking(CreateBookingRequest request);

    BookingResponse getBookingById(Long bookingId);

    List<BookingResponse> getAllBookings();

    BookingResponse approveBooking(Long bookingId);

    BookingResponse rejectBooking(Long bookingId);

    BookingResponse cancelBooking(Long bookingId);

    BookingResponse completeBooking(Long bookingId);
}