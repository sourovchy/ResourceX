package com.thirdhand.campusvault.controller;

import com.thirdhand.campusvault.dto.request.PaymentRequest;
import com.thirdhand.campusvault.dto.response.PaymentResponse;
import com.thirdhand.campusvault.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public PaymentResponse createPayment(
            @Valid @RequestBody PaymentRequest request
    ) {
        return paymentService.createPayment(request);
    }

    @GetMapping("/{paymentId}")
    public PaymentResponse getPaymentById(
            @PathVariable Long paymentId
    ) {
        return paymentService.getPaymentById(paymentId);
    }
}