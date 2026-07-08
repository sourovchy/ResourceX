package com.resourcex.resourcex.mapper;

import com.resourcex.resourcex.dto.request.UpdateItemRequest;
import com.resourcex.resourcex.dto.response.ItemResponse;
import com.resourcex.resourcex.entity.Item;
import com.resourcex.resourcex.entity.FileMetadata;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;

public final class ItemMapper {

    private ItemMapper() {
    }

    public static void updateEntity(Item item, UpdateItemRequest request) {
        if (item == null || request == null) {
            return;
        }

        if (request.getTitle() != null) item.setTitle(request.getTitle());
        if (request.getDescription() != null) item.setDescription(request.getDescription());
        // Category is mapped in ItemServiceImpl
        if (request.getItemCondition() != null) item.setItemCondition(request.getItemCondition());
        if (request.getDailyRate() != null) item.setDailyRate(request.getDailyRate());

        if (request.getAvailabilityScope() != null) item.setAvailabilityScope(request.getAvailabilityScope());
        // Image mapping is handled in ItemServiceImpl
    }

    public static ItemResponse toResponse(Item item) {
        if (item == null) {
            return null;
        }

        return ItemResponse.builder()
                .itemId(item.getItemId())
                .title(item.getTitle())
                .description(item.getDescription())
                .category(item.getCategory() != null ? item.getCategory().getName() : null)
                .itemCondition(item.getItemCondition())
                .dailyRate(item.getDailyRate())
                .status(item.getStatus() != null ? item.getStatus().name() : null)
                .availabilityScope(item.getAvailabilityScope())
                .owner(UserMapper.toResponse(item.getOwner()))
                .imageUrls(item.getImages() != null
                        ? item.getImages().stream()
                          .map(file -> {
                              try {
                                  return ServletUriComponentsBuilder.fromCurrentContextPath()
                                          .path("/api/files/")
                                          .path(file.getStoredName())
                                          .toUriString();
                              } catch (Exception e) {
                                  return "/api/files/" + file.getStoredName();
                              }
                          })
                          .toList()
                        : List.of())
                .build();
    }
}