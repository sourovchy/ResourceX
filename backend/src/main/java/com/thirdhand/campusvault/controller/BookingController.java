package com.thirdhand.campusvault.controller;

import com.thirdhand.campusvault.dto.request.CreateBookingRequest;
import com.thirdhand.campusvault.dto.response.BookingResponse;
import com.thirdhand.campusvault.service.BookingService;
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
}