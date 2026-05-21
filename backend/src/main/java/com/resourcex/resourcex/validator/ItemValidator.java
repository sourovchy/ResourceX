package com.resourcex.resourcex.validator;

import com.resourcex.resourcex.dto.request.CreateItemRequest;
import com.resourcex.resourcex.dto.request.UpdateItemRequest;
import com.resourcex.resourcex.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class ItemValidator {

    public void validateCreateRequest(CreateItemRequest request) {

        if (request == null) {
            throw new BadRequestException("Create item request cannot be null");
        }

        validateTitle(request.getTitle());
        validateCategory(request.getCategory());
        validateCondition(request.getItemCondition());
        validateDailyRate(request.getDailyRate());
    }

    public void validateUpdateRequest(UpdateItemRequest request) {

        if (request == null) {
            throw new BadRequestException("Update item request cannot be null");
        }

        if (request.getTitle() != null) {
            validateTitle(request.getTitle());
        }

        if (request.getCategory() != null) {
            validateCategory(request.getCategory());
        }

        if (request.getItemCondition() != null) {
            validateCondition(request.getItemCondition());
        }

        if (request.getDailyRate() != null) {
            validateDailyRate(request.getDailyRate());
        }
    }

    private void validateTitle(String title) {

        if (title == null || title.isBlank()) {
            throw new BadRequestException("Title is required");
        }

        if (title.length() > 255) {
            throw new BadRequestException("Title cannot exceed 255 characters");
        }
    }

    private void validateCategory(String category) {

        if (category == null || category.isBlank()) {
            throw new BadRequestException("Category is required");
        }

        if (category.length() > 100) {
            throw new BadRequestException("Category cannot exceed 100 characters");
        }
    }

    private void validateCondition(String condition) {

        if (condition == null || condition.isBlank()) {
            throw new BadRequestException("Item condition is required");
        }

        if (condition.length() > 100) {
            throw new BadRequestException("Item condition cannot exceed 100 characters");
        }
    }

    private void validateDailyRate(BigDecimal dailyRate) {

        if (dailyRate == null) {
            throw new BadRequestException("Daily rate is required");
        }

        if (dailyRate.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Daily rate must be greater than zero");
        }
    }
}