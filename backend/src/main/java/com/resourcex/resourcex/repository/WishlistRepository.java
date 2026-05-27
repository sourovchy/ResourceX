package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.Item;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem> findByUserOrderByCreatedAtDesc(User user);

    Optional<WishlistItem> findByUserAndItem(User user, Item item);

    boolean existsByUserAndItem(User user, Item item);

    void deleteByUserAndItem(User user, Item item);
}
