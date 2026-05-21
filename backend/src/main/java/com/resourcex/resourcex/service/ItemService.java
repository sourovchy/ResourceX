package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.CreateItemRequest;
import com.resourcex.resourcex.dto.request.UpdateItemRequest;
import com.resourcex.resourcex.dto.response.ItemResponse;

import java.util.List;

public interface ItemService {

    ItemResponse createItem(CreateItemRequest request);

    ItemResponse updateItem(Long itemId, UpdateItemRequest request);

    ItemResponse getItemById(Long itemId);

    List<ItemResponse> getAllItems(String category, String searchQuery);

    void deleteItem(Long itemId);
}