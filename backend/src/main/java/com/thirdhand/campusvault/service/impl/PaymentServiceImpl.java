package com.thirdhand.campusvault.service.impl;

import com.thirdhand.campusvault.dto.request.PaymentRequest;
import com.thirdhand.campusvault.dto.response.PaymentResponse;
import com.thirdhand.campusvault.service.PaymentService;
import org.springframework.stereotype.Service;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Override
    public PaymentResponse createPayment(PaymentRequest request) {
        return new PaymentResponse();
    }

    @Override
    public PaymentResponse getPaymentById(Long paymentId) {
        return new PaymentResponse();
    }
}