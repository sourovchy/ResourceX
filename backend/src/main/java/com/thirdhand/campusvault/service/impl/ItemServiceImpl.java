package com.thirdhand.campusvault.service.impl;

import com.thirdhand.campusvault.dto.request.CreateItemRequest;
import com.thirdhand.campusvault.dto.request.UpdateItemRequest;
import com.thirdhand.campusvault.dto.response.ItemResponse;
import com.thirdhand.campusvault.service.ItemService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemServiceImpl implements ItemService {

    @Override
    public ItemResponse createItem(CreateItemRequest request) {
        return new ItemResponse();
    }

    @Override
    public ItemResponse updateItem(Long itemId, UpdateItemRequest request) {
        return new ItemResponse();
    }

    @Override
    public ItemResponse getItemById(Long itemId) {
        return new ItemResponse();
    }

    @Override
    public List<ItemResponse> getAllItems() {
        return List.of();
    }

    @Override
    public void deleteItem(Long itemId) {

    }
}