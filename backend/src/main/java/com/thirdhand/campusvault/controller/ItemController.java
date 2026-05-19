package com.thirdhand.campusvault.controller;

import com.thirdhand.campusvault.dto.request.CreateItemRequest;
import com.thirdhand.campusvault.dto.request.UpdateItemRequest;
import com.thirdhand.campusvault.dto.response.ItemResponse;
import com.thirdhand.campusvault.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @PostMapping
    public ItemResponse createItem(
            @Valid @RequestBody CreateItemRequest request
    ) {
        return itemService.createItem(request);
    }

    @GetMapping
    public List<ItemResponse> getAllItems() {
        return itemService.getAllItems();
    }

    @GetMapping("/{itemId}")
    public ItemResponse getItemById(
            @PathVariable Long itemId
    ) {
        return itemService.getItemById(itemId);
    }

    @PutMapping("/{itemId}")
    public ItemResponse updateItem(
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateItemRequest request
    ) {
        return itemService.updateItem(itemId, request);
    }

    @DeleteMapping("/{itemId}")
    public void deleteItem(
            @PathVariable Long itemId
    ) {
        itemService.deleteItem(itemId);
    }
}