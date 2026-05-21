package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.PaymentRequest;
import com.resourcex.resourcex.dto.response.PaymentResponse;
import com.resourcex.resourcex.entity.Payment.PaymentStatus;

import java.util.List;

public interface PaymentService {

    PaymentResponse createPayment(PaymentRequest request);

    PaymentResponse getPaymentById(Long paymentId);

    PaymentResponse getPaymentByBookingId(Long bookingId);

    List<PaymentResponse> getAllPayments();

    PaymentResponse updatePaymentStatus(Long paymentId, PaymentStatus status);

    PaymentResponse markPaymentSuccessful(Long paymentId, String transactionRef);

    PaymentResponse markPaymentFailed(Long paymentId);

    PaymentResponse refundPayment(Long paymentId);
}