package com.thirdhand.campusvault.service.impl;

import com.thirdhand.campusvault.dto.request.CreateItemRequest;
import com.thirdhand.campusvault.dto.request.UpdateItemRequest;
import com.thirdhand.campusvault.dto.response.ItemResponse;
import com.thirdhand.campusvault.entity.Item;
import com.thirdhand.campusvault.entity.User;
import com.thirdhand.campusvault.mapper.ItemMapper;
import com.thirdhand.campusvault.repository.ItemRepository;
import com.thirdhand.campusvault.repository.UserRepository;
import com.thirdhand.campusvault.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ItemResponse createItem(CreateItemRequest request) {
        // In a real app, get currentUser from SecurityContext
        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new IllegalArgumentException("Owner not found"));

        Item item = Item.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .itemCondition(request.getItemCondition())
                .dailyRate(request.getDailyRate())
                .status(Item.ItemStatus.AVAILABLE) // Auto-publish
                .owner(owner)
                .build();

        Item saved = itemRepository.save(item);
        return ItemMapper.toResponse(saved);
    }

    @Override
    public ItemResponse updateItem(Long itemId, UpdateItemRequest request) {
        return new ItemResponse();
    }

    @Override
    public ItemResponse getItemById(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        return ItemMapper.toResponse(item);
    }

    @Override
    public List<ItemResponse> getAllItems() {
        return itemRepository.findAll().stream()
                .map(ItemMapper::toResponse)
                .toList();
    }

    @Override
    public void deleteItem(Long itemId) {

    }
}