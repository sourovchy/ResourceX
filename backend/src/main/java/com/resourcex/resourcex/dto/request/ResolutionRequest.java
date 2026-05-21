package com.resourcex.resourcex.dto.request;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResolutionRequest {

    private String status;

    private String resolution;

    private String actionType;

    private BigDecimal penaltyAmount;
}