package com.resourcex.resourcex.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {

    private Long paymentId;

    private Long bookingId;

    private BigDecimal amount;

    private String status;

    private String paymentMethod;

    private String transactionRef;

    private LocalDateTime paidAt;

    private LocalDateTime createdAt;
}