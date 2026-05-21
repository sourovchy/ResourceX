package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.CreateItemRequest;
import com.resourcex.resourcex.dto.request.UpdateItemRequest;
import com.resourcex.resourcex.dto.response.ItemResponse;
import com.resourcex.resourcex.entity.Item;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.mapper.ItemMapper;
import com.resourcex.resourcex.repository.ItemRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.repository.BookingRepository;
import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

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
        ItemMapper.mapImages(saved, request.getImageUrls());
        saved = itemRepository.save(saved);
        
        return ItemMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ItemResponse updateItem(Long itemId, UpdateItemRequest request) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        
        if (item.getStatus() == Item.ItemStatus.DELETED) {
            throw new IllegalStateException("Cannot update a deleted item");
        }
        
        ItemMapper.updateEntity(item, request);
        
        Item saved = itemRepository.save(item);
        return ItemMapper.toResponse(saved);
    }

    @Override
    public ItemResponse getItemById(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        return ItemMapper.toResponse(item);
    }

    @Override
    public List<ItemResponse> getAllItems(String category, String searchQuery) {
        return itemRepository.findItemsWithFilters(
                category == null || category.isEmpty() || category.equalsIgnoreCase("All") ? null : category,
                searchQuery == null || searchQuery.isEmpty() ? null : searchQuery
        ).stream()
                .map(ItemMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteItem(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        
        List<Booking> bookings = bookingRepository.findByItem(item);
        
        boolean isLocked = bookings.stream().anyMatch(b -> 
            b.getStatus() == Booking.BookingStatus.PENDING || 
            b.getStatus() == Booking.BookingStatus.APPROVED || 
            b.getStatus() == Booking.BookingStatus.ACTIVE
        );
        
        if (isLocked) {
            throw new IllegalStateException("Cannot delete item with active or pending bookings");
        }
        
        item.setStatus(Item.ItemStatus.DELETED);
        itemRepository.save(item);
    }
}