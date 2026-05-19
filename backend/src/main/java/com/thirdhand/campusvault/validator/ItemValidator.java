package com.thirdhand.campusvault.validator;

import com.thirdhand.campusvault.dto.request.CreateItemRequest;
import com.thirdhand.campusvault.dto.request.UpdateItemRequest;

import java.math.BigDecimal;

public class ItemValidator {

    public static void validateCreateItemRequest(CreateItemRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Create item request cannot be null");
        }
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new IllegalArgumentException("Title is required");
        }
        if (request.getCategory() == null || request.getCategory().isBlank()) {
            throw new IllegalArgumentException("Category is required");
        }
        if (request.getItemCondition() == null || request.getItemCondition().isBlank()) {
            throw new IllegalArgumentException("Item condition is required");
        }
        if (request.getDailyRate() == null || request.getDailyRate().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Daily rate must be greater than zero");
        }
    }

    public static void validateUpdateItemRequest(UpdateItemRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Update item request cannot be null");
        }
        if (request.getDailyRate() != null && request.getDailyRate().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Daily rate must be greater than zero");
        }
    }
}