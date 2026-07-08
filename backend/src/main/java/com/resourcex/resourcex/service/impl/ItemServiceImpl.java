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
import com.resourcex.resourcex.repository.ReviewRepository;
import com.resourcex.resourcex.service.ItemService;
import com.resourcex.resourcex.service.AuditLogService;
import com.resourcex.resourcex.entity.AuditLog;
import com.resourcex.resourcex.validator.ItemValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final FileMetadataRepository fileMetadataRepository;
    private final CategoryRepository categoryRepository;
    private final com.resourcex.resourcex.repository.WishlistRepository wishlistRepository;
    private final ItemValidator itemValidator;
    private final AuditLogService auditLogService;
    private final com.resourcex.resourcex.security.AccountAccessGuard accountAccessGuard;
    private final com.resourcex.resourcex.service.StudentRestrictionManager restrictionManager;
    private final com.resourcex.resourcex.service.AvatarUrlResolver avatarUrlResolver;

    @Override
    @Transactional
    public ItemResponse createItem(CreateItemRequest request) {
        itemValidator.validateCreateRequest(request);

        User owner = resolveCurrentUser();

        // Only approved (ACTIVE) accounts may list items.
        accountAccessGuard.requireActive(owner);

        // Trust restriction (<50): restricted users cannot create new items.
        if (restrictionManager.isAutomaticallyRestricted(owner.getUserId())) {
            throw new ForbiddenException(
                    "Your account is restricted due to a low Trust Score and cannot create new items.");
        }

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
                .status(Item.ItemStatus.AVAILABLE)
                .owner(owner)
                .availabilityScope(request.getAvailabilityScope() != null ? request.getAvailabilityScope() : "CAMPUS_ONLY")
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

        return enrichItemResponse(saved);
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

        boolean actorIsAdmin = isCurrentUserAdmin();
        String actionType = actorIsAdmin ? "ITEM_UPDATED_BY_ADMIN" : "ITEM_UPDATED";

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                resolveCurrentUser().getUserId(),
                actionType,
                "ITEM",
                saved.getItemId(),
                AuditLog.AuditOutcome.SUCCESS,
                "Item updated: " + saved.getTitle()
        );

        return enrichItemResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ItemResponse getItemById(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        // Deleted items are invisible to everyone — including admins — via direct
        // URL / ID lookup. There is no hidden access path to a deleted listing.
        if (item.getStatus() == Item.ItemStatus.DELETED) {
            throw new ResourceNotFoundException("Item not found");
        }

        return enrichItemResponse(item);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ItemResponse> getAllItems(String category, String availabilityScope, String searchQuery, Pageable pageable) {
        String normalizedCategory = normalizeFilterValue(category);
        String normalizedAvailabilityScope = normalizeFilterValue(availabilityScope);
        String normalizedSearchQuery = normalizeFilterValue(searchQuery);

        // The query already excludes DELETED items at the database level, so the
        // page (content + counts + pagination) is consistent for every role.
        return enrichItemResponses(itemRepository
                .findItemsWithFilters(normalizedCategory, normalizedAvailabilityScope, normalizedSearchQuery, pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ItemResponse> getMyItems(Pageable pageable) {
        User owner = resolveCurrentUser();
        return enrichItemResponses(itemRepository.findByOwnerAndStatusNot(owner, Item.ItemStatus.DELETED, pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ItemResponse> getUserItems(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return enrichItemResponses(itemRepository.findByOwnerAndStatusNot(user, Item.ItemStatus.DELETED, pageable));
    }

    @Override
    @Transactional
    public void deleteItem(Long itemId, String reason) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        // Authorization: owner OR admin. Same gate for both deletion paths.
        assertCanManageItem(item);

        performItemDeletion(item, reason);
    }

    /**
     * Single source of truth for removing an item — invoked by both the owner
     * delete and the admin take-down. Runs inside the caller's transaction so
     * the whole operation is atomic.
     *
     * Strategy: soft-delete (status = DELETED). Every item-returning query
     * already excludes DELETED, so the listing instantly disappears everywhere
     * while audit/history rows that reference it stay intact (no orphans, no
     * broken foreign keys). Dependent references that should NOT survive are
     * cleaned up here.
     */
    private void performItemDeletion(Item item, String reason) {
        if (item.getStatus() == Item.ItemStatus.DELETED) {
            throw new ConflictException("Item is already deleted");
        }

        List<Booking> bookings = bookingRepository.findByItem(item);

        // An item that is approved for handoff or physically out on an active rental
        // cannot be deleted — doing so would orphan an in-progress rental.
        boolean hasActiveBooking = bookings.stream()
                .anyMatch(b -> b.getStatus() == Booking.BookingStatus.APPROVED
                        || b.getStatus() == Booking.BookingStatus.ACTIVE);
        if (hasActiveBooking) {
            throw new ConflictException(
                    "Cannot delete an item that is currently rented out. Complete the active rental first.");
        }

        // Auto-cancel outstanding PENDING requests so the listing also vanishes
        // from renters' request/booking views.
        List<Booking> pending = bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.PENDING)
                .toList();
        if (!pending.isEmpty()) {
            pending.forEach(b -> b.setStatus(Booking.BookingStatus.CANCELLED));
            bookingRepository.saveAll(pending);
        }

        // Remove wishlist references so the item leaves every wishlist.
        wishlistRepository.deleteByItem(item);

        // Soft-delete — excluded from all queries from here on.
        item.setStatus(Item.ItemStatus.DELETED);
        itemRepository.save(item);

        boolean actorIsAdmin = isCurrentUserAdmin();
        Long actorId = resolveCurrentUser().getUserId();
        String actionType = actorIsAdmin ? "ITEM_BLOCKED" : "ITEM_DELETED";
        String detail = "Item deleted (" + (actorIsAdmin ? "admin take-down" : "owner")
                + ")" + (reason != null && !reason.isBlank() ? ": " + reason.trim() : "");

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                actorId,
                actionType,
                "ITEM",
                item.getItemId(),
                AuditLog.AuditOutcome.SUCCESS,
                detail
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
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> "ROLE_ADMIN".equals(role)
                        || "ROLE_SUPER_ADMIN".equals(role)
                        || "ROLE_MODERATOR".equals(role));
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

    private ItemResponse enrichItemResponse(Item item) {
        if (item == null) return null;
        ItemResponse resp = ItemMapper.toResponse(item);
        if (resp != null && resp.getOwner() != null && item.getOwner() != null) {
            resp.getOwner().setAvatarUrl(avatarUrlResolver.resolve(item.getOwner().getAvatarFileId()));
        }
        List<Object[]> stats = reviewRepository.findReviewStatsByItemIds(List.of(item.getItemId()));
        if (stats != null && !stats.isEmpty()) {
            Object[] row = stats.get(0);
            Double avgRating = row[1] != null ? ((Number) row[1]).doubleValue() : null;
            Long count = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            if (avgRating != null) {
                avgRating = Math.round(avgRating * 10.0) / 10.0;
            }
            resp.setRating(avgRating);
            resp.setReviews(count.intValue());
        } else {
            resp.setRating(null);
            resp.setReviews(0);
        }
        return resp;
    }

    private org.springframework.data.domain.Page<ItemResponse> enrichItemResponses(org.springframework.data.domain.Page<Item> itemsPage) {
        List<Item> items = itemsPage.getContent();
        if (items.isEmpty()) {
            return itemsPage.map(item -> {
                ItemResponse resp = ItemMapper.toResponse(item);
                if (resp != null && resp.getOwner() != null && item.getOwner() != null) {
                    resp.getOwner().setAvatarUrl(avatarUrlResolver.resolve(item.getOwner().getAvatarFileId()));
                }
                return resp;
            });
        }

        List<Long> itemIds = items.stream().map(Item::getItemId).toList();
        List<Object[]> stats = reviewRepository.findReviewStatsByItemIds(itemIds);

        java.util.Map<Long, Double> ratingsMap = new java.util.HashMap<>();
        java.util.Map<Long, Integer> reviewsMap = new java.util.HashMap<>();

        if (stats != null) {
            for (Object[] row : stats) {
                Long itemId = (Long) row[0];
                Double avgRating = row[1] != null ? ((Number) row[1]).doubleValue() : null;
                Long count = row[2] != null ? ((Number) row[2]).longValue() : 0L;

                if (avgRating != null) {
                    avgRating = Math.round(avgRating * 10.0) / 10.0;
                }
                ratingsMap.put(itemId, avgRating);
                reviewsMap.put(itemId, count.intValue());
            }
        }

        return itemsPage.map(item -> {
            ItemResponse resp = ItemMapper.toResponse(item);
            if (resp != null && resp.getOwner() != null && item.getOwner() != null) {
                resp.getOwner().setAvatarUrl(avatarUrlResolver.resolve(item.getOwner().getAvatarFileId()));
            }
            resp.setRating(ratingsMap.get(item.getItemId()));
            resp.setReviews(reviewsMap.getOrDefault(item.getItemId(), 0));
            return resp;
        });
    }
}
