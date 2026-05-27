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
import com.resourcex.resourcex.repository.CategoryRepository;
import com.resourcex.resourcex.repository.FileMetadataRepository;
import com.resourcex.resourcex.repository.ItemRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.ItemService;
import com.resourcex.resourcex.service.AuditLogService;
import com.resourcex.resourcex.entity.AuditLog;
import com.resourcex.resourcex.validator.ItemValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final FileMetadataRepository fileMetadataRepository;
    private final CategoryRepository categoryRepository;
    private final ItemValidator itemValidator;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public ItemResponse createItem(CreateItemRequest request) {
        itemValidator.validateCreateRequest(request);

        User owner = resolveCurrentUser();

        com.resourcex.resourcex.entity.Category categoryObj = null;
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            categoryObj = categoryRepository.findByNameIgnoreCase(request.getCategory().trim())
                    .orElseGet(() -> categoryRepository.save(com.resourcex.resourcex.entity.Category.builder().name(request.getCategory().trim()).build()));
        }

        Item item = Item.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(categoryObj)
                .itemCondition(request.getItemCondition())
                .dailyRate(request.getDailyRate())
                .deposit(request.getDeposit())
                .status(Item.ItemStatus.AVAILABLE)
                .owner(owner)
                .build();

        Item saved = itemRepository.save(item);

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            processImageUrls(saved, request.getImageUrls());
            saved = itemRepository.save(saved);
        }

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                owner.getUserId(),
                "ITEM_CREATED",
                "ITEM",
                saved.getItemId(),
                AuditLog.AuditOutcome.SUCCESS,
                "Item created: " + saved.getTitle()
        );

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

        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            com.resourcex.resourcex.entity.Category categoryObj = categoryRepository.findByNameIgnoreCase(request.getCategory().trim())
                    .orElseGet(() -> categoryRepository.save(com.resourcex.resourcex.entity.Category.builder().name(request.getCategory().trim()).build()));
            item.setCategory(categoryObj);
        }

        if (request.getImageUrls() != null) {
            processImageUrls(item, request.getImageUrls());
        }

        Item saved = itemRepository.save(item);

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                resolveCurrentUser().getUserId(),
                "ITEM_UPDATED",
                "ITEM",
                saved.getItemId(),
                AuditLog.AuditOutcome.SUCCESS,
                "Item updated: " + saved.getTitle()
        );

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
    public Page<ItemResponse> getAllItems(String category, String searchQuery, Pageable pageable) {
        String normalizedCategory = normalizeFilterValue(category);
        String normalizedSearchQuery = normalizeFilterValue(searchQuery);

        Page<Item> itemPage = itemRepository.findItemsWithFilters(normalizedCategory, normalizedSearchQuery, pageable);
        
        List<ItemResponse> responses = itemPage.stream()
                .filter(item -> item.getStatus() != Item.ItemStatus.DELETED || isCurrentUserAdmin())
                .map(ItemMapper::toResponse)
                .toList();
                
        return new PageImpl<>(responses, pageable, itemPage.getTotalElements());
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

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                resolveCurrentUser().getUserId(),
                "ITEM_DELETED",
                "ITEM",
                itemId,
                AuditLog.AuditOutcome.SUCCESS,
                "Item marked as deleted"
        );
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

    private void processImageUrls(Item item, List<String> imageUrls) {
        if (item.getImages() == null) {
            item.setImages(new java.util.ArrayList<>());
        }
        
        List<com.resourcex.resourcex.entity.FileMetadata> newImages = new java.util.ArrayList<>();
        for (String url : imageUrls) {
            if (url != null && !url.isBlank()) {
                String storedName = extractStoredName(url);
                fileMetadataRepository.findByStoredName(storedName).ifPresent(file -> {
                    file.setItem(item);
                    newImages.add(file);
                });
            }
        }
        
        // Remove old images not in the new list by setting item to null (if not using orphanRemoval)
        for (com.resourcex.resourcex.entity.FileMetadata oldFile : item.getImages()) {
            if (!newImages.contains(oldFile)) {
                oldFile.setItem(null);
            }
        }
        
        item.getImages().clear();
        item.getImages().addAll(newImages);
    }

    private String extractStoredName(String url) {
        if (url.contains("/api/files/")) {
            return url.substring(url.lastIndexOf('/') + 1);
        }
        return url;
    }
}
