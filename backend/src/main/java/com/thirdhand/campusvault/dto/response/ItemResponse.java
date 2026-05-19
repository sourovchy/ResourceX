package com.thirdhand.campusvault.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemResponse {

    private Long itemId;

    private String title;

    private String description;

    private UserResponse owner;

    private BigDecimal dailyRate;

    private String status;
}