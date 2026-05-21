package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.CreateBookingRequest;
import com.resourcex.resourcex.dto.response.BookingResponse;

import java.util.List;

public interface BookingService {

    BookingResponse createBooking(CreateBookingRequest request);

    BookingResponse getBookingById(Long bookingId);

    List<BookingResponse> getAllBookings();

    List<BookingResponse> getMyBookings();

    List<BookingResponse> getRequestsForMyListings();

    BookingResponse approveBooking(Long bookingId);

    BookingResponse rejectBooking(Long bookingId);

    BookingResponse cancelBooking(Long bookingId);

    BookingResponse completeBooking(Long bookingId);
}
