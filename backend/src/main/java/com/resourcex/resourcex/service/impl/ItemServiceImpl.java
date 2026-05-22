package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.CreateItemRequest;
import com.resourcex.resourcex.dto.request.UpdateItemRequest;
import com.resourcex.resourcex.dto.response.ItemResponse;
import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.Item;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.exception.ConflictException;
import com.resourcex.resourcex.exception.ForbiddenException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.mapper.ItemMapper;
import com.resourcex.resourcex.repository.BookingRepository;
import com.resourcex.resourcex.repository.ItemRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.ItemService;
import com.resourcex.resourcex.validator.ItemValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final ItemValidator itemValidator;

    @Override
    @Transactional
    public ItemResponse createItem(CreateItemRequest request) {
        itemValidator.validateCreateRequest(request);

        User owner = resolveCurrentUser();

        Item item = Item.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .itemCondition(request.getItemCondition())
                .dailyRate(request.getDailyRate())
                .status(Item.ItemStatus.AVAILABLE)
                .owner(owner)
                .build();

        Item saved = itemRepository.save(item);

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            ItemMapper.mapImages(saved, request.getImageUrls());
            saved = itemRepository.save(saved);
        }

        return ItemMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ItemResponse updateItem(Long itemId, UpdateItemRequest request) {
        itemValidator.validateUpdateRequest(request);

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        assertCanManageItem(item);

        if (item.getStatus() == Item.ItemStatus.DELETED) {
            throw new ConflictException("Cannot update a deleted item");
        }

        ItemMapper.updateEntity(item, request);

        Item saved = itemRepository.save(item);
        return ItemMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ItemResponse getItemById(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        if (item.getStatus() == Item.ItemStatus.DELETED && !isCurrentUserAdmin()) {
            throw new ResourceNotFoundException("Item not found");
        }

        return ItemMapper.toResponse(item);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponse> getAllItems(String category, String searchQuery) {
        String normalizedCategory = normalizeFilterValue(category);
        String normalizedSearchQuery = normalizeFilterValue(searchQuery);

        return itemRepository.findItemsWithFilters(normalizedCategory, normalizedSearchQuery)
                .stream()
                .filter(item -> item.getStatus() != Item.ItemStatus.DELETED || isCurrentUserAdmin())
                .map(ItemMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ItemResponse> getMyItems() {
        User owner = resolveCurrentUser();

        return itemRepository.findByOwner(owner)
                .stream()
                .filter(item -> item.getStatus() != Item.ItemStatus.DELETED)
                .map(ItemMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteItem(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        assertCanManageItem(item);

        if (item.getStatus() == Item.ItemStatus.DELETED) {
            throw new ConflictException("Item is already deleted");
        }

        List<Booking> bookings = bookingRepository.findByItem(item);

        boolean hasActiveOrPendingBooking = bookings.stream().anyMatch(booking ->
                booking.getStatus() == Booking.BookingStatus.PENDING ||
                        booking.getStatus() == Booking.BookingStatus.APPROVED
        );

        if (hasActiveOrPendingBooking) {
            throw new ConflictException("Cannot delete item with active or pending bookings");
        }

        item.setStatus(Item.ItemStatus.DELETED);
        itemRepository.save(item);
    }

    private User resolveCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ForbiddenException("Authenticated user not found");
        }

        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void assertCanManageItem(Item item) {
        User currentUser = resolveCurrentUser();

        boolean isOwner = item.getOwner() != null
                && item.getOwner().getUserId() != null
                && item.getOwner().getUserId().equals(currentUser.getUserId());

        boolean isAdmin = isCurrentUserAdmin();

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("You can only manage your own listings");
        }
    }

    private boolean isCurrentUserAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    private String normalizeFilterValue(String value) {
        if (value == null || value.isBlank() || "All".equalsIgnoreCase(value.trim())) {
            return null;
        }
        return value.trim();
    }
}
