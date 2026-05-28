package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.CreateItemRequest;
import com.resourcex.resourcex.dto.request.UpdateItemRequest;
import com.resourcex.resourcex.dto.response.ItemResponse;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ItemService {

    ItemResponse createItem(CreateItemRequest request);

    ItemResponse updateItem(Long itemId, UpdateItemRequest request);

    ItemResponse getItemById(Long itemId);

    Page<ItemResponse> getAllItems(String category, String searchQuery, Pageable pageable);

    Page<ItemResponse> getMyItems(Pageable pageable);

    void deleteItem(Long itemId);
}
