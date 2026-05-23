package com.resourcex.resourcex.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemResponse {

    private Long itemId;

    private String title;

    private String description;

    private String category;

    private String itemCondition;

    private UserResponse owner;

    private BigDecimal dailyRate;

    private String status;

    private List<String> imageUrls;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}