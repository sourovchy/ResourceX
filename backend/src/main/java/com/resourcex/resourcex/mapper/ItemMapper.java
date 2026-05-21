package com.resourcex.resourcex.mapper;

import com.resourcex.resourcex.dto.request.UpdateItemRequest;
import com.resourcex.resourcex.dto.response.ItemResponse;
import com.resourcex.resourcex.entity.Item;
import com.resourcex.resourcex.entity.ItemImage;

import java.util.ArrayList;
import java.util.List;

public final class ItemMapper {

    private ItemMapper() {
    }

    public static void mapImages(Item item, List<String> imageUrls) {
        if (item == null || imageUrls == null) {
            return;
        }

        if (item.getImages() == null) {
            item.setImages(new ArrayList<>());
        } else {
            item.getImages().clear();
        }

        for (String url : imageUrls) {
            if (url != null && !url.isBlank()) {
                item.getImages().add(
                        ItemImage.builder()
                                .item(item)
                                .imageUrl(url.trim())
                                .build()
                );
            }
        }
    }

    public static void updateEntity(Item item, UpdateItemRequest request) {
        if (item == null || request == null) {
            return;
        }

        if (request.getTitle() != null) item.setTitle(request.getTitle());
        if (request.getDescription() != null) item.setDescription(request.getDescription());
        if (request.getCategory() != null) item.setCategory(request.getCategory());
        if (request.getItemCondition() != null) item.setItemCondition(request.getItemCondition());
        if (request.getDailyRate() != null) item.setDailyRate(request.getDailyRate());

        if (request.getImageUrls() != null) {
            mapImages(item, request.getImageUrls());
        }
    }

    public static ItemResponse toResponse(Item item) {
        if (item == null) {
            return null;
        }

        return ItemResponse.builder()
                .itemId(item.getItemId())
                .title(item.getTitle())
                .description(item.getDescription())
                .category(item.getCategory())
                .itemCondition(item.getItemCondition())
                .dailyRate(item.getDailyRate())
                .status(item.getStatus() != null ? item.getStatus().name() : null)
                .owner(UserMapper.toResponse(item.getOwner()))
                .imageUrls(item.getImages() != null
                        ? item.getImages().stream()
                          .map(ItemImage::getImageUrl)
                          .toList()
                        : List.of())
                .build();
    }
}