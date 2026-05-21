package com.resourcex.resourcex.validator;

import com.resourcex.resourcex.dto.request.CreateBookingRequest;
import com.resourcex.resourcex.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
public class BookingValidator {

    private static final long MAX_BOOKING_DAYS = 30;

    public void validateCreateRequest(CreateBookingRequest request) {

        if (request == null) {
            throw new BadRequestException("Create booking request cannot be null");
        }

        validateItemId(request.getItemId());
        validateDates(request.getStartDate(), request.getEndDate());
    }

    private void validateItemId(Long itemId) {

        if (itemId == null) {
            throw new BadRequestException("Item ID is required");
        }
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {

        if (startDate == null) {
            throw new BadRequestException("Start date is required");
        }

        if (endDate == null) {
            throw new BadRequestException("End date is required");
        }

        if (startDate.isBefore(LocalDate.now())) {
            throw new BadRequestException("Start date cannot be in the past");
        }

        if (endDate.isBefore(startDate)) {
            throw new BadRequestException("End date cannot be before start date");
        }

        long bookingDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;

        if (bookingDays <= 0) {
            throw new BadRequestException("Invalid booking duration");
        }

        if (bookingDays > MAX_BOOKING_DAYS) {
            throw new BadRequestException(
                    "Booking duration cannot exceed " + MAX_BOOKING_DAYS + " days"
            );
        }
    }
}