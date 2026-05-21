package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.CreateBookingRequest;
import com.resourcex.resourcex.dto.response.BookingResponse;
import com.resourcex.resourcex.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public BookingResponse createBooking(
            @Valid @RequestBody CreateBookingRequest request
    ) {
        return bookingService.createBooking(request);
    }

    @GetMapping
    public List<BookingResponse> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/{bookingId}")
    public BookingResponse getBookingById(
            @PathVariable Long bookingId
    ) {
        return bookingService.getBookingById(bookingId);
    }

    @PatchMapping("/{bookingId}/approve")
    public BookingResponse approveBooking(@PathVariable Long bookingId) {
        return bookingService.approveBooking(bookingId);
    }

    @PatchMapping("/{bookingId}/reject")
    public BookingResponse rejectBooking(@PathVariable Long bookingId) {
        return bookingService.rejectBooking(bookingId);
    }

    @PatchMapping("/{bookingId}/cancel")
    public BookingResponse cancelBooking(@PathVariable Long bookingId) {
        return bookingService.cancelBooking(bookingId);
    }

    @PatchMapping("/{bookingId}/complete")
    public BookingResponse completeBooking(@PathVariable Long bookingId) {
        return bookingService.completeBooking(bookingId);
    }
}