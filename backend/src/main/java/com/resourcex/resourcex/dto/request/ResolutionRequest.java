package com.resourcex.resourcex.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResolutionRequest {

    @Size(max = 50)
    private String status;

    @Size(max = 3000)
    private String resolution;

    @Size(max = 100)
    private String actionType;

    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal penaltyAmount;
}