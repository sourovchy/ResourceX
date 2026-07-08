package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.CreateBookingRequest;
import com.resourcex.resourcex.dto.response.BookingResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BookingService {

    BookingResponse createBooking(CreateBookingRequest request);

    BookingResponse getBookingById(Long bookingId);

    Page<BookingResponse> getAllBookings(Pageable pageable);

    List<BookingResponse> getMyBookings();

    List<BookingResponse> getRequestsForMyListings();

    BookingResponse approveBooking(Long bookingId);

    BookingResponse activateBooking(Long bookingId);

    BookingResponse rejectBooking(Long bookingId, String reason);

    BookingResponse cancelBooking(Long bookingId);

    BookingResponse moderateCancelBooking(Long bookingId);

    BookingResponse completeBooking(Long bookingId);

    void cancelExpiredPendingBookings(java.time.LocalDateTime threshold);

    void processOverdueBookings(java.time.LocalDate currentDate);
}
