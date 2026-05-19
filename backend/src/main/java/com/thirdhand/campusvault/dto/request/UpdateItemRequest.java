package com.thirdhand.campusvault.dto.request;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateItemRequest {

    private String title;

    private String description;

    private String category;

    private String itemCondition;

    private BigDecimal dailyRate;

    private String status;
}