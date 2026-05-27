package com.resourcex.resourcex.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateItemRequest {

    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    @Size(max = 1000, message = "Description cannot exceed 2000 characters")
    private String description;

    @Size(max = 100, message = "Category cannot exceed 100 characters")
    private String category;

    @Size(max = 100, message = "Item condition cannot exceed 100 characters")
    private String itemCondition;

    @DecimalMin(value = "0.0", inclusive = false, message = "Daily rate must be greater than 0")
    private BigDecimal dailyRate;

    /*
     REMOVE THIS unless admins are allowed
     to directly moderate item states.

     Safer to manage internally in service logic.
    */
    // private String status;

    private List<String> imageUrls;

    @DecimalMin(value = "0.0", inclusive = true, message = "Deposit must be zero or greater")
    private BigDecimal deposit;
}