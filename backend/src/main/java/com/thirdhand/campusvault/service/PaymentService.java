package com.thirdhand.campusvault.service;

import com.thirdhand.campusvault.dto.request.PaymentRequest;
import com.thirdhand.campusvault.dto.response.PaymentResponse;

public interface PaymentService {

    PaymentResponse createPayment(PaymentRequest request);

    PaymentResponse getPaymentById(Long paymentId);
}