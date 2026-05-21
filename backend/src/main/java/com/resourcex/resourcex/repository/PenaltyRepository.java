package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.Penalty;
import com.resourcex.resourcex.entity.Penalty.PenaltyStatus;
import com.resourcex.resourcex.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PenaltyRepository extends JpaRepository<Penalty, Long> {

    List<Penalty> findByUser(User user);

    List<Penalty> findByUser_UserId(Long userId);

    List<Penalty> findByStatus(PenaltyStatus status);

    List<Penalty> findByUser_UserIdAndStatus(Long userId, PenaltyStatus status);

    List<Penalty> findByBooking_BookingId(Long bookingId);

    List<Penalty> findByDispute_DisputeId(Long disputeId);

    Optional<Penalty> findFirstByDispute_DisputeId(Long disputeId);

    long countByStatus(PenaltyStatus status);

    long countByUser_UserId(Long userId);

    long countByUser_UserIdAndStatus(Long userId, PenaltyStatus status);

    boolean existsByDispute_DisputeId(Long disputeId);
}