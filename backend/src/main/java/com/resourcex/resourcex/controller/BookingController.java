package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.CreateBookingRequest;
import com.resourcex.resourcex.dto.request.RejectBookingRequest;
import com.resourcex.resourcex.dto.response.BookingResponse;
import com.resourcex.resourcex.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    public BookingResponse createBooking(
            @Valid @RequestBody CreateBookingRequest request) {
        return bookingService.createBooking(request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','MODERATOR')")
    public Page<BookingResponse> getAllBookings(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return bookingService.getAllBookings(pageable);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public List<BookingResponse> getMyBookings() {
        return bookingService.getMyBookings();
    }

    @GetMapping("/owner")
    @PreAuthorize("isAuthenticated()")
    public List<BookingResponse> getRequestsForMyListings() {
        return bookingService.getRequestsForMyListings();
    }

    @GetMapping("/deposits")
    @PreAuthorize("isAuthenticated()")
    public List<BookingResponse> getDepositTracker() {
        return bookingService.getDepositTracker();
    }

    @GetMapping("/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    public BookingResponse getBookingById(
            @PathVariable Long bookingId) {
        return bookingService.getBookingById(bookingId);
    }

    @PatchMapping("/{bookingId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN') or isAuthenticated()")
    public BookingResponse approveBooking(
            @PathVariable Long bookingId) {
        return bookingService.approveBooking(bookingId);
    }

    @PatchMapping("/{bookingId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN') or isAuthenticated()")
    public BookingResponse rejectBooking(
            @PathVariable Long bookingId,
            @RequestBody(required = false) RejectBookingRequest request) {
        String reason = request != null ? request.getReason() : null;
        return bookingService.rejectBooking(bookingId, reason);
    }

    @PatchMapping("/{bookingId}/cancel")
    @PreAuthorize("isAuthenticated()")
    public BookingResponse cancelBooking(
            @PathVariable Long bookingId) {
        return bookingService.cancelBooking(bookingId);
    }

    @PatchMapping("/{bookingId}/complete")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN') or isAuthenticated()")
    public BookingResponse completeBooking(
            @PathVariable Long bookingId) {
        return bookingService.completeBooking(bookingId);
    }

    @PatchMapping("/{bookingId}/moderate-cancel")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public BookingResponse moderateCancelBooking(
            @PathVariable Long bookingId) {
        return bookingService.moderateCancelBooking(bookingId);
    }
}