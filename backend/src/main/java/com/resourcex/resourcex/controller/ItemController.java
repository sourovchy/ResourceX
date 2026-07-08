package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.CreateItemRequest;
import com.resourcex.resourcex.dto.request.UpdateItemRequest;
import com.resourcex.resourcex.dto.response.ItemResponse;
import com.resourcex.resourcex.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    public ItemResponse createItem(
            @Valid @RequestBody CreateItemRequest request
    ) {
        return itemService.createItem(request);
    }

    @GetMapping
    public Page<ItemResponse> getAllItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String availabilityScope,
            @RequestParam(required = false) String searchQuery,
            @PageableDefault(size = 10, sort = "itemId", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return itemService.getAllItems(category, availabilityScope, searchQuery, pageable);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public Page<ItemResponse> getMyItems(
            @PageableDefault(size = 20, sort = "itemId", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return itemService.getMyItems(pageable);
    }

    @GetMapping("/{itemId}")
    public ItemResponse getItemById(
            @PathVariable Long itemId
    ) {
        return itemService.getItemById(itemId);
    }

    @PutMapping("/{itemId}")
    @PreAuthorize("isAuthenticated()")
    public ItemResponse updateItem(
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateItemRequest request
    ) {
        return itemService.updateItem(itemId, request);
    }

    /**
     * Unified delete for owners and admins. The service enforces ownership /
     * admin authorization and runs the single core deletion routine.
     */
    @DeleteMapping("/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("isAuthenticated()")
    public void deleteItem(
            @PathVariable Long itemId,
            @RequestParam(required = false) String reason
    ) {
        itemService.deleteItem(itemId, reason);
    }

    @GetMapping("/user/{userId}")
    public Page<ItemResponse> getUserItems(
            @PathVariable Long userId,
            @PageableDefault(size = 6, sort = "itemId", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return itemService.getUserItems(userId, pageable);
    }
}