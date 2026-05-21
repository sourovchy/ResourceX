package com.resourcex.resourcex.validator;

import com.resourcex.resourcex.dto.request.CreateBookingRequest;

import java.time.LocalDate;

public class BookingValidator {

    public static void validateCreateBookingRequest(CreateBookingRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Create booking request cannot be null");
        }
        if (request.getItemId() == null) {
            throw new IllegalArgumentException("Item ID is required");
        }
        if (request.getStartDate() == null) {
            throw new IllegalArgumentException("Start date is required");
        }
        if (request.getEndDate() == null) {
            throw new IllegalArgumentException("End date is required");
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }
        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Start date cannot be in the past");
        }
    }
}