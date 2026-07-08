package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.Item;
import com.resourcex.resourcex.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Most-booked items (for analytics). Returns rows of [itemTitle (String), bookingCount (Long)].
     */
    @Query("SELECT b.item.title, COUNT(b) FROM Booking b "
            + "GROUP BY b.item.itemId, b.item.title ORDER BY COUNT(b) DESC")
    List<Object[]> findTopBookedItems(Pageable pageable);

    @EntityGraph(attributePaths = { "item", "item.category", "item.owner", "renter" }, type = EntityGraph.EntityGraphType.LOAD)
    List<Booking> findByRenter(User renter);

    @EntityGraph(attributePaths = { "item", "item.category", "item.owner", "renter" }, type = EntityGraph.EntityGraphType.LOAD)
    List<Booking> findByItem_Owner(User owner);

    @EntityGraph(attributePaths = { "item", "item.category", "item.owner", "renter" }, type = EntityGraph.EntityGraphType.LOAD)
    List<Booking> findByItem(Item item);

    /** Completed bookings a given renter made for a given item — used for review eligibility. */
    List<Booking> findByItemAndRenterAndStatus(Item item, User renter, Booking.BookingStatus status);

    long countByStatus(Booking.BookingStatus status);

    @Query("""
            SELECT b
            FROM Booking b
            WHERE b.item = :item
              AND b.status NOT IN (com.resourcex.resourcex.entity.Booking.BookingStatus.CANCELLED,
                                   com.resourcex.resourcex.entity.Booking.BookingStatus.REJECTED)
              AND (:startDate <= b.endDate AND :endDate >= b.startDate)
            """)
    List<Booking> findOverlappingBookings(
            @Param("item") Item item,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    boolean existsByItemAndStatusIn(Item item, List<Booking.BookingStatus> statuses);

    /** Is the item occupied by an APPROVED/ACTIVE booking whose window covers {@code date}? */
    @Query("""
            SELECT COUNT(b) > 0
            FROM Booking b
            WHERE b.item = :item
              AND b.status IN (com.resourcex.resourcex.entity.Booking.BookingStatus.APPROVED,
                               com.resourcex.resourcex.entity.Booking.BookingStatus.ACTIVE)
              AND b.startDate <= :date
              AND b.endDate >= :date
            """)
    boolean existsOccupyingBookingOn(@Param("item") Item item, @Param("date") LocalDate date);

    List<Booking> findByStatusAndCreatedAtBefore(Booking.BookingStatus status, java.time.LocalDateTime dateTime);

    List<Booking> findByStatusAndEndDateBeforeAndReturnedDateIsNull(Booking.BookingStatus status, LocalDate date);

    long countByItem_Owner_UserIdAndStatus(Long ownerId, Booking.BookingStatus status);
}