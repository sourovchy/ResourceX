package com.thirdhand.campusvault.service.impl;

import com.thirdhand.campusvault.dto.request.CreateBookingRequest;
import com.thirdhand.campusvault.dto.response.BookingResponse;
import com.thirdhand.campusvault.entity.Booking;
import com.thirdhand.campusvault.mapper.BookingMapper;
import com.thirdhand.campusvault.repository.BookingRepository;
import com.thirdhand.campusvault.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    @Override
    public BookingResponse createBooking(CreateBookingRequest request) {
        return new BookingResponse();
    }

    @Override
    public BookingResponse getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        return BookingMapper.toResponse(booking);
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(BookingMapper::toResponse)
                .toList();
    }
}