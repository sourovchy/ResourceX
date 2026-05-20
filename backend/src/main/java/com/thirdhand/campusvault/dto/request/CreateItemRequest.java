package com.thirdhand.campusvault.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateItemRequest {

    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String category;

    @NotBlank
    private String itemCondition;

    @NotNull
    private BigDecimal dailyRate;

    private Long ownerId;

    private List<String> imageUrls;
}