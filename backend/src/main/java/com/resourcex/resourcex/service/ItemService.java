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

    Page<ItemResponse> getAllItems(String category, String availabilityScope, String searchQuery, Pageable pageable);

    Page<ItemResponse> getMyItems(Pageable pageable);

    /**
     * Soft-deletes an item (owner or admin). The same core logic runs for both
     * roles: the item is excluded from every query and its dependent references
     * (wishlist entries, pending booking requests) are cleaned up atomically.
     *
     * @param reason optional reason recorded in the audit log (admin take-downs)
     */
    void deleteItem(Long itemId, String reason);

    Page<ItemResponse> getUserItems(Long userId, Pageable pageable);
}
