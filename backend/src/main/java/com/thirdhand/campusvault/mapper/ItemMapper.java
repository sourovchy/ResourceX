package com.thirdhand.campusvault.mapper;

import com.thirdhand.campusvault.dto.response.ItemResponse;
import com.thirdhand.campusvault.entity.Item;

public class ItemMapper {

    public static ItemResponse toResponse(Item item) {

        if (item == null) {
            return null;
        }

        return ItemResponse.builder()
                .itemId(item.getItemId())
                .title(item.getTitle())
                .description(item.getDescription())
                .dailyRate(item.getDailyRate())
                .status(item.getStatus())
                .owner(UserMapper.toResponse(item.getOwner()))
                .build();
    }
}