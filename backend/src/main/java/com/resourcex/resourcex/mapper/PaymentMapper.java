package com.resourcex.resourcex.mapper;

import com.resourcex.resourcex.dto.response.PaymentResponse;
import com.resourcex.resourcex.entity.Payment;

public class PaymentMapper {

    public static PaymentResponse toResponse(Payment payment) {

        if (payment == null) {
            return null;
        }

        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .bookingId(payment.getBooking().getBookingId())
                .amount(payment.getAmount())
                .status(payment.getStatus() != null ? payment.getStatus().name() : null)
                .paymentDate(payment.getPaidAt())
                .build();
    }
}