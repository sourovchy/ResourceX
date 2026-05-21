package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.Payment;
import com.resourcex.resourcex.entity.Payment.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByBooking_BookingId(Long bookingId);

    Optional<Payment> findByTransactionRef(String transactionRef);

    boolean existsByBooking_BookingId(Long bookingId);

    @Query("select coalesce(sum(p.amount), 0) from Payment p where p.status = :status")
    BigDecimal sumAmountByStatus(PaymentStatus status);
}