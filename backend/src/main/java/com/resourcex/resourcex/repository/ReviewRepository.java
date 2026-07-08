package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.Review;
import com.resourcex.resourcex.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Deep to-one graph matching ReviewMapper's reads (reviewer + owner, each with
    // role/studentProfile/university). All associations are to-one, so joining them
    // cannot produce duplicate rows or break pagination.
    @EntityGraph(attributePaths = {
            "reviewer", "reviewer.role", "reviewer.studentProfile", "reviewer.studentProfile.university",
            "booking", "booking.item", "booking.item.owner", "booking.item.owner.role",
            "booking.item.owner.studentProfile", "booking.item.owner.studentProfile.university"
    }, type = EntityGraph.EntityGraphType.LOAD)
    List<Review> findByReviewer(User reviewer);

    @EntityGraph(attributePaths = {
            "reviewer", "reviewer.role", "reviewer.studentProfile", "reviewer.studentProfile.university",
            "booking", "booking.item", "booking.item.owner", "booking.item.owner.role",
            "booking.item.owner.studentProfile", "booking.item.owner.studentProfile.university"
    }, type = EntityGraph.EntityGraphType.LOAD)
    @Query("SELECT r FROM Review r WHERE r.booking.item.owner = :reviewee")
    List<Review> findByReviewee(@Param("reviewee") User reviewee);

    boolean existsByBookingAndReviewer(Booking booking, User reviewer);

    List<Review> findAllByOrderByReviewIdDesc();

    List<Review> findByReviewerOrderByReviewIdDesc(User reviewer);

    @EntityGraph(attributePaths = {
            "reviewer", "reviewer.role", "reviewer.studentProfile", "reviewer.studentProfile.university",
            "booking", "booking.item", "booking.item.owner", "booking.item.owner.role",
            "booking.item.owner.studentProfile", "booking.item.owner.studentProfile.university"
    }, type = EntityGraph.EntityGraphType.LOAD)
    @Query("SELECT r FROM Review r WHERE r.booking.item.owner = :reviewee ORDER BY r.reviewId DESC")
    List<Review> findByRevieweeOrderByReviewIdDesc(@Param("reviewee") User reviewee);

    List<Review> findByCreatedAtBetweenOrderByReviewIdDesc(
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    @Query("SELECT COUNT(r) FROM Review r WHERE r.booking.item.owner = :reviewee")
    long countByReviewee(@Param("reviewee") User reviewee);

    /** Review-farming guard: how many reviews this reviewer left for this reviewee since {@code after}. */
    @Query("SELECT COUNT(r) FROM Review r WHERE r.reviewer = :reviewer AND r.booking.item.owner = :reviewee AND r.createdAt > :after")
    long countByReviewerAndRevieweeAndCreatedAtAfter(
            @Param("reviewer") User reviewer,
            @Param("reviewee") User reviewee,
            @Param("after") LocalDateTime after
    );

    /** Paginated reviews tied to bookings of a single item (newest first via Pageable sort). */
    @EntityGraph(attributePaths = {
            "reviewer", "reviewer.role", "reviewer.studentProfile", "reviewer.studentProfile.university",
            "booking", "booking.item", "booking.item.owner", "booking.item.owner.role",
            "booking.item.owner.studentProfile", "booking.item.owner.studentProfile.university"
    }, type = EntityGraph.EntityGraphType.LOAD)
    Page<Review> findByBooking_Item_ItemId(Long itemId, Pageable pageable);

    /** Rating histogram for an item: rows of [rating (Integer), count (Long)]. */
    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.booking.item.itemId = :itemId GROUP BY r.rating")
    List<Object[]> ratingDistributionByItem(@Param("itemId") Long itemId);

    /** Rating histogram for everything an owner has received: rows of [rating (Integer), count (Long)]. */
    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.booking.item.owner.userId = :ownerId GROUP BY r.rating")
    List<Object[]> ratingDistributionByReviewee(@Param("ownerId") Long ownerId);

    @Query("SELECT r.booking.item.itemId, AVG(cast(r.rating as double)), COUNT(r) FROM Review r WHERE r.booking.item.itemId IN :itemIds GROUP BY r.booking.item.itemId")
    List<Object[]> findReviewStatsByItemIds(@Param("itemIds") List<Long> itemIds);
}