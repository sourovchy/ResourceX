package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.Item;
import com.resourcex.resourcex.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByRenter(User renter);

    List<Booking> findByItemOwner(User owner);

    List<Booking> findByItem(Item item);

    long countByStatus(Booking.BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.item = :item " +
           "AND b.status NOT IN (com.resourcex.resourcex.entity.Booking.BookingStatus.CANCELLED, com.resourcex.resourcex.entity.Booking.BookingStatus.REJECTED) " +
           "AND (:startDate <= b.endDate AND :endDate >= b.startDate)")
    List<Booking> findOverlappingBookings(
            @Param("item") Item item,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
