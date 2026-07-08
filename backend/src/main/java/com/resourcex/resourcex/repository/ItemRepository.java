package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.Item;
import com.resourcex.resourcex.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
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

  /**
   * Item counts grouped by category name (for analytics), most populous first.
   * `category` is a {@code @ManyToOne Category} association, so we LEFT JOIN it
   * (items without a category fall into the "Uncategorized" bucket).
   * Returns rows of [categoryLabel (String), count (Long)].
   */
  @Query("SELECT COALESCE(c.name, 'Uncategorized'), COUNT(i) FROM Item i "
          + "LEFT JOIN i.category c GROUP BY c.name ORDER BY COUNT(i) DESC")
  List<Object[]> countItemsByCategory();

  @EntityGraph(attributePaths = { "category", "owner" }, type = EntityGraph.EntityGraphType.LOAD)
  List<Item> findByOwner(User owner);

  @EntityGraph(attributePaths = { "category", "owner" }, type = EntityGraph.EntityGraphType.LOAD)
  Page<Item> findByOwnerAndStatusNot(User owner, Item.ItemStatus status, Pageable pageable);

  long countByOwner(User owner);

  long countByStatus(Item.ItemStatus status);

  long countByStatusNot(Item.ItemStatus status);

  @EntityGraph(attributePaths = { "category", "owner" }, type = EntityGraph.EntityGraphType.LOAD)
  List<Item> findByStatus(Item.ItemStatus status);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("SELECT i FROM Item i WHERE i.itemId = :itemId")
  Optional<Item> findByIdWithLock(@Param("itemId") Long itemId);

  @EntityGraph(attributePaths = { "category", "owner" }, type = EntityGraph.EntityGraphType.LOAD)
  @Query("""
      SELECT i
      FROM Item i
      WHERE i.status <> com.resourcex.resourcex.entity.Item.ItemStatus.DELETED
        AND (:category IS NULL OR TRIM(:category) = '' OR LOWER(i.category.name) = LOWER(TRIM(:category)))
        AND (:availabilityScope IS NULL OR TRIM(:availabilityScope) = '' OR i.availabilityScope = TRIM(:availabilityScope))
        AND (
              :searchQuery IS NULL OR TRIM(:searchQuery) = '' OR
              LOWER(i.title) LIKE LOWER(CONCAT('%', TRIM(:searchQuery), '%')) OR
              LOWER(i.description) LIKE LOWER(CONCAT('%', TRIM(:searchQuery), '%'))
            )
      """)
  Page<Item> findItemsWithFilters(
      @Param("category") String category,
      @Param("availabilityScope") String availabilityScope,
      @Param("searchQuery") String searchQuery,
      Pageable pageable);

  @Query("SELECT i.category.name, COUNT(i) FROM Item i GROUP BY i.category.name ORDER BY COUNT(i) DESC")
  List<Object[]> getCategoryCounts();

  long countByCategory_Name(String category);
}