package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.PaymentRequest;
import com.resourcex.resourcex.dto.response.PaymentResponse;
import com.resourcex.resourcex.service.PaymentService;
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