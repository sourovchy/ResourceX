package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.response.WishlistResponse;
import com.resourcex.resourcex.entity.Item;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.WishlistItem;
import com.resourcex.resourcex.exception.ConflictException;
import com.resourcex.resourcex.exception.ForbiddenException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.mapper.ItemMapper;
import com.resourcex.resourcex.repository.ItemRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.repository.WishlistRepository;
import com.resourcex.resourcex.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final com.resourcex.resourcex.service.AvatarUrlResolver avatarUrlResolver;

    @Override
    @Transactional
    public WishlistResponse addToWishlist(Long itemId) {
        User user = resolveCurrentUser();

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        if (item.getStatus() == Item.ItemStatus.DELETED) {
            throw new ResourceNotFoundException("Item not found");
        }

        if (wishlistRepository.existsByUserAndItem(user, item)) {
            throw new ConflictException("Item is already in your wishlist");
        }

        WishlistItem saved = wishlistRepository.save(
                WishlistItem.builder().user(user).item(item).build()
        );

        return toResponse(saved);
    }

    @Override
    @Transactional
    public void removeFromWishlist(Long itemId) {
        User user = resolveCurrentUser();

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        if (!wishlistRepository.existsByUserAndItem(user, item)) {
            throw new ResourceNotFoundException("Item not in wishlist");
        }

        wishlistRepository.deleteByUserAndItem(user, item);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistResponse> getMyWishlist() {
        User user = resolveCurrentUser();
        return wishlistRepository.findByUser(user).stream()
                .filter(w -> w.getItem().getStatus() != Item.ItemStatus.DELETED)
                .map(this::toResponse)
                .toList();
    }

    private WishlistResponse toResponse(WishlistItem w) {
        com.resourcex.resourcex.dto.response.ItemResponse itemResp = ItemMapper.toResponse(w.getItem());
        if (itemResp != null && itemResp.getOwner() != null && w.getItem().getOwner() != null) {
            itemResp.getOwner().setAvatarUrl(avatarUrlResolver.resolve(w.getItem().getOwner().getAvatarFileId()));
        }
        return WishlistResponse.builder()
                .wishlistId(null)
                .item(itemResp)
                .createdAt(null)
                .build();
    }

    private User resolveCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new ForbiddenException("Authenticated user not found");
        }
        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
