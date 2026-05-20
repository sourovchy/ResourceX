package com.thirdhand.campusvault.repository;

import com.thirdhand.campusvault.entity.Item;
import com.thirdhand.campusvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;
import java.util.Optional;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByOwner(User owner);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Item i WHERE i.itemId = :itemId")
    Optional<Item> findByIdWithLock(@Param("itemId") Long itemId);

    @Query("SELECT i FROM Item i WHERE " +
           "(:category IS NULL OR i.category = :category) AND " +
           "(:searchQuery IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR LOWER(i.description) LIKE LOWER(CONCAT('%', :searchQuery, '%'))) AND " +
           "(i.status != com.thirdhand.campusvault.entity.Item.ItemStatus.DELETED)")
    List<Item> findItemsWithFilters(@Param("category") String category, @Param("searchQuery") String searchQuery);

}