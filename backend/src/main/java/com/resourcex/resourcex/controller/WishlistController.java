package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.response.WishlistResponse;
import com.resourcex.resourcex.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<WishlistResponse> getMyWishlist() {
        return wishlistService.getMyWishlist();
    }

    @PostMapping("/{itemId}")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    public WishlistResponse addToWishlist(@PathVariable Long itemId) {
        return wishlistService.addToWishlist(itemId);
    }

    @DeleteMapping("/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("isAuthenticated()")
    public void removeFromWishlist(@PathVariable Long itemId) {
        wishlistService.removeFromWishlist(itemId);
    }
}
