package com.resourcex.resourcex.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResolutionRequest {

    @NotBlank(message = "Resolution status is required")
    @Size(max = 50, message = "Status must not exceed 50 characters")
    private String status;

    @NotBlank(message = "Resolution details are required")
    @Size(min = 10, max = 3000, message = "Resolution must be between 10 and 3000 characters")
    private String resolution;

    @NotBlank(message = "Action type is required")
    @Size(max = 100, message = "Action type must not exceed 100 characters")
    private String actionType;

    @DecimalMin(value = "0.01", inclusive = true, message = "Penalty amount must be greater than 0")
    private BigDecimal penaltyAmount;
}