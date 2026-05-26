package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.Dispute;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.Dispute.DisputeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, Long> {

    List<Dispute> findByRaisedBy(User user);

    List<Dispute> findByBooking(Booking booking);

    List<Dispute> findByStatus(DisputeStatus status);

    boolean existsByBookingAndRaisedBy(Booking booking, User user);

    long countByStatus(DisputeStatus status);

    List<Dispute> findAllByOrderByCreatedAtDesc();

    List<Dispute> findByRaisedByOrderByCreatedAtDesc(User user);

    List<Dispute> findByStatusOrderByCreatedAtDesc(DisputeStatus status);

    List<Dispute> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    List<Dispute> findByStatusInAndUpdatedAtBefore(List<DisputeStatus> statuses, LocalDateTime dateTime);
}