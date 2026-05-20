package com.thirdhand.campusvault.mapper;

import com.thirdhand.campusvault.dto.response.ItemResponse;
import com.thirdhand.campusvault.entity.Item;
import com.thirdhand.campusvault.entity.ItemImage;

import java.util.stream.Collectors;

public class ItemMapper {

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
                .imageUrls(item.getImages() != null ? 
                        item.getImages().stream().map(ItemImage::getImageUrl).collect(Collectors.toList()) : null)
                .build();
    }
}