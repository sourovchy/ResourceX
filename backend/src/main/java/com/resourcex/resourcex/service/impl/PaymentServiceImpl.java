package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.PaymentRequest;
import com.resourcex.resourcex.dto.response.PaymentResponse;
import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.Payment;
import com.resourcex.resourcex.entity.Payment.PaymentStatus;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.exception.custom.DuplicateResourceException;
import com.resourcex.resourcex.mapper.PaymentMapper;
import com.resourcex.resourcex.repository.BookingRepository;
import com.resourcex.resourcex.repository.PaymentRepository;
import com.resourcex.resourcex.service.PaymentService;
import com.resourcex.resourcex.validator.PaymentValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    @Override
    public PaymentResponse createPayment(PaymentRequest request) {
        PaymentValidator.validatePaymentRequest(request);

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (paymentRepository.existsByBooking_BookingId(booking.getBookingId())) {
            throw new DuplicateResourceException("Payment already exists for this booking");
        }

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(request.getAmount())
                .method(request.getPaymentMethod())
                .status(PaymentStatus.SUCCESS)
                .transactionRef(generateTransactionRef(booking.getBookingId()))
                .paidAt(LocalDateTime.now())
                .build();

        return PaymentMapper.toResponse(paymentRepository.save(payment));
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long paymentId) {
        return paymentRepository.findById(paymentId)
                .map(PaymentMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByBookingId(Long bookingId) {
        return paymentRepository.findByBooking_BookingId(bookingId)
                .map(PaymentMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for this booking"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(PaymentMapper::toResponse)
                .toList();
    }

    @Override
    public PaymentResponse updatePaymentStatus(Long paymentId, PaymentStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Payment status cannot be null");
        }

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        payment.setStatus(status);

        if (status == PaymentStatus.SUCCESS && payment.getPaidAt() == null) {
            payment.setPaidAt(LocalDateTime.now());
        }

        if (status == PaymentStatus.SUCCESS && (payment.getTransactionRef() == null || payment.getTransactionRef().isBlank())) {
            payment.setTransactionRef(generateTransactionRef(payment.getBooking().getBookingId()));
        }

        return PaymentMapper.toResponse(paymentRepository.save(payment));
    }

    @Override
    public PaymentResponse markPaymentSuccessful(Long paymentId, String transactionRef) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(LocalDateTime.now());

        if (transactionRef != null && !transactionRef.isBlank()) {
            payment.setTransactionRef(transactionRef);
        } else if (payment.getTransactionRef() == null || payment.getTransactionRef().isBlank()) {
            payment.setTransactionRef(generateTransactionRef(payment.getBooking().getBookingId()));
        }

        return PaymentMapper.toResponse(paymentRepository.save(payment));
    }

    @Override
    public PaymentResponse markPaymentFailed(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        payment.setStatus(PaymentStatus.FAILED);

        return PaymentMapper.toResponse(paymentRepository.save(payment));
    }

    @Override
    public PaymentResponse refundPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        payment.setStatus(PaymentStatus.REFUNDED);

        return PaymentMapper.toResponse(paymentRepository.save(payment));
    }

    private String generateTransactionRef(Long bookingId) {
        return "PAY-" + bookingId + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}