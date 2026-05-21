package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.PaymentRequest;
import com.resourcex.resourcex.dto.response.PaymentResponse;
import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.Payment;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.mapper.PaymentMapper;
import com.resourcex.resourcex.repository.BookingRepository;
import com.resourcex.resourcex.repository.PaymentRepository;
import com.resourcex.resourcex.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(request.getAmount())
                .method(request.getPaymentMethod())
                .status(Payment.PaymentStatus.SUCCESS)
                .paidAt(LocalDateTime.now())
                .build();

        return PaymentMapper.toResponse(paymentRepository.save(payment));
    }

    @Override
    public PaymentResponse getPaymentById(Long paymentId) {
        return paymentRepository.findById(paymentId)
                .map(PaymentMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
    }
}
