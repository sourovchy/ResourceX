package com.resourcex.resourcex.dto.request;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

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

    private List<String> imageUrls;
}