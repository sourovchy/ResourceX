package com.thirdhand.campusvault.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequest {

    @NotNull
    private Long bookingId;

    @NotNull
    private BigDecimal amount;

    @NotBlank
    private String paymentMethod;
}