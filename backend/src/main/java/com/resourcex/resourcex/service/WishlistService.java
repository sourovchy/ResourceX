package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.response.WishlistResponse;

import java.util.List;

public interface WishlistService {

    WishlistResponse addToWishlist(Long itemId);

    void removeFromWishlist(Long itemId);

    List<WishlistResponse> getMyWishlist();
}
