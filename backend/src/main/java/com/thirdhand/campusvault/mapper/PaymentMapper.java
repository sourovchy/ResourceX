package com.thirdhand.campusvault.mapper;

import com.thirdhand.campusvault.dto.response.PaymentResponse;
import com.thirdhand.campusvault.entity.Payment;

public class PaymentMapper {

    public static PaymentResponse toResponse(Payment payment) {

        if (payment == null) {
            return null;
        }

        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .bookingId(payment.getBooking().getBookingId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .paymentDate(payment.getPaymentDate())
                .build();
    }
}