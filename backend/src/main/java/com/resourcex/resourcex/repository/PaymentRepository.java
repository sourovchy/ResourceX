package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("select coalesce(sum(p.amount), 0) from Payment p where p.status = com.resourcex.resourcex.entity.Payment.PaymentStatus.SUCCESS")
    BigDecimal sumSuccessfulRevenue();
}
