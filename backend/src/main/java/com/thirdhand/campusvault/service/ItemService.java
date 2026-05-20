package com.thirdhand.campusvault.service;

import com.thirdhand.campusvault.dto.request.CreateItemRequest;
import com.thirdhand.campusvault.dto.request.UpdateItemRequest;
import com.thirdhand.campusvault.dto.response.ItemResponse;

import java.util.List;

public interface ItemService {

    ItemResponse createItem(CreateItemRequest request);

    ItemResponse updateItem(Long itemId, UpdateItemRequest request);

    ItemResponse getItemById(Long itemId);

    List<ItemResponse> getAllItems(String category, String searchQuery);

    void deleteItem(Long itemId);
}