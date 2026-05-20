package com.thirdhand.campusvault.repository;

import com.thirdhand.campusvault.entity.Booking;
import com.thirdhand.campusvault.entity.Item;
import com.thirdhand.campusvault.entity.User;
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

    @Query("SELECT b FROM Booking b WHERE b.item = :item " +
           "AND b.status NOT IN (com.thirdhand.campusvault.entity.Booking.BookingStatus.CANCELLED, com.thirdhand.campusvault.entity.Booking.BookingStatus.REJECTED) " +
           "AND (:startDate <= b.endDate AND :endDate >= b.startDate)")
    List<Booking> findOverlappingBookings(
            @Param("item") Item item,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}