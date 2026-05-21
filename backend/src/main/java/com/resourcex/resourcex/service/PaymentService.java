package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.PaymentRequest;
import com.resourcex.resourcex.dto.response.PaymentResponse;

public interface PaymentService {

    PaymentResponse createPayment(PaymentRequest request);

    PaymentResponse getPaymentById(Long paymentId);
}