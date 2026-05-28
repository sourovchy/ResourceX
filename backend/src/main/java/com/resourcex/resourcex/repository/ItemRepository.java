package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.Item;
import com.resourcex.resourcex.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

  List<Item> findByOwner(User owner);

  Page<Item> findByOwnerAndStatusNot(User owner, Item.ItemStatus status, Pageable pageable);

  long countByOwner(User owner);

  long countByStatus(Item.ItemStatus status);

  List<Item> findByStatus(Item.ItemStatus status);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("SELECT i FROM Item i WHERE i.itemId = :itemId")
  Optional<Item> findByIdWithLock(@Param("itemId") Long itemId);

  @Query("""
      SELECT i
      FROM Item i
      WHERE i.status <> com.resourcex.resourcex.entity.Item.ItemStatus.DELETED
        AND (:category IS NULL OR TRIM(:category) = '' OR LOWER(i.category.name) = LOWER(TRIM(:category)))
        AND (
              :searchQuery IS NULL OR TRIM(:searchQuery) = '' OR
              LOWER(i.title) LIKE LOWER(CONCAT('%', TRIM(:searchQuery), '%')) OR
              LOWER(i.description) LIKE LOWER(CONCAT('%', TRIM(:searchQuery), '%'))
            )
      """)
  Page<Item> findItemsWithFilters(
      @Param("category") String category,
      @Param("searchQuery") String searchQuery,
      Pageable pageable);

  @Query("SELECT i.category.name, COUNT(i) FROM Item i GROUP BY i.category.name ORDER BY COUNT(i) DESC")
  List<Object[]> getCategoryCounts();

  long countByCategory_Name(String category);
}