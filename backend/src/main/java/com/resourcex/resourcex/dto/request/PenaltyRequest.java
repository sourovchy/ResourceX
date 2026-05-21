package com.resourcex.resourcex.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PenaltyRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    private Long bookingId;

    private Long disputeId;

    @NotNull(message = "Penalty amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotBlank(message = "Reason is required")
    private String reason;

    @NotNull(message = "Issued by staff ID is required")
    private Long issuedByStaffId;
}