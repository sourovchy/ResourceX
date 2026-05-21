package com.resourcex.resourcex.validator;

import com.resourcex.resourcex.dto.request.PaymentRequest;
import com.resourcex.resourcex.exception.custom.ValidationException;

import java.math.BigDecimal;

public class PaymentValidator {

    public static void validatePaymentRequest(PaymentRequest request) {

        if (request == null) {
            throw new ValidationException("Payment request cannot be null");
        }

        if (request.getBookingId() == null) {
            throw new ValidationException("Booking ID is required");
        }

        if (request.getAmount() == null ||
                request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {

            throw new ValidationException("Amount must be greater than zero");
        }

        if (request.getPaymentMethod() == null ||
                request.getPaymentMethod().isBlank()) {

            throw new ValidationException("Payment method is required");
        }

        if (request.getPaymentMethod().length() > 50) {
            throw new ValidationException("Payment method cannot exceed 50 characters");
        }
    }
}