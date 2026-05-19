package com.thirdhand.campusvault.repository;

import com.thirdhand.campusvault.entity.Booking;
import com.thirdhand.campusvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByRenter(User renter);

    List<Booking> findByItemOwner(User owner);
}