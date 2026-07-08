package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.Item;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.WishlistItem;
import com.resourcex.resourcex.entity.WishlistItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistItem, WishlistItemId> {

    List<WishlistItem> findByUser(User user);

    Optional<WishlistItem> findByUserAndItem(User user, Item item);

    boolean existsByUserAndItem(User user, Item item);

    void deleteByUserAndItem(User user, Item item);

    /** Remove every wishlist reference to an item (used when the item is deleted). */
    void deleteByItem(Item item);
}
