package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.PaymentRequest;
import com.resourcex.resourcex.dto.response.PaymentResponse;
import com.resourcex.resourcex.entity.Payment.PaymentStatus;
import com.resourcex.resourcex.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public PaymentResponse createPayment(@Valid @RequestBody PaymentRequest request) {
        return paymentService.createPayment(request);
    }

    @GetMapping("/{paymentId}")
    public PaymentResponse getPaymentById(@PathVariable Long paymentId) {
        return paymentService.getPaymentById(paymentId);
    }

    @GetMapping("/booking/{bookingId}")
    public PaymentResponse getPaymentByBookingId(@PathVariable Long bookingId) {
        return paymentService.getPaymentByBookingId(bookingId);
    }

    @GetMapping
    public List<PaymentResponse> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @PatchMapping("/{paymentId}/status")
    public PaymentResponse updatePaymentStatus(
            @PathVariable Long paymentId,
            @RequestParam PaymentStatus status
    ) {
        return paymentService.updatePaymentStatus(paymentId, status);
    }

    @PostMapping("/{paymentId}/success")
    public PaymentResponse markPaymentSuccessful(
            @PathVariable Long paymentId,
            @RequestParam(required = false) String transactionRef
    ) {
        return paymentService.markPaymentSuccessful(paymentId, transactionRef);
    }

    @PostMapping("/{paymentId}/failed")
    public PaymentResponse markPaymentFailed(@PathVariable Long paymentId) {
        return paymentService.markPaymentFailed(paymentId);
    }

    @PostMapping("/{paymentId}/refund")
    public PaymentResponse refundPayment(@PathVariable Long paymentId) {
        return paymentService.refundPayment(paymentId);
    }
}