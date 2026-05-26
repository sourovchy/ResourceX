package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.PendingUser;
import com.resourcex.resourcex.entity.PendingUserStatus;
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
import java.time.LocalDateTime;

@Repository
public interface PendingUserRepository extends JpaRepository<PendingUser, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from PendingUser p where p.pendingUserId = :id")
    Optional<PendingUser> findByIdForUpdate(@Param("id") Long id);

    Optional<PendingUser> findByEmailIgnoreCase(String email);

    Optional<PendingUser> findByStudentId(String studentId);

    Optional<PendingUser> findByPhone(String phone);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByStudentId(String studentId);

    boolean existsByPhone(String phone);

    Page<PendingUser> findByStatus(PendingUserStatus status, Pageable pageable);

    long countByStatus(PendingUserStatus status);

    List<PendingUser> findAllByOrderByPendingUserIdDesc();

    List<PendingUser> findByCreatedAtBetweenOrderByPendingUserIdDesc(
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    long countByCreatedAtBetween(
            LocalDateTime startDate,
            LocalDateTime endDate
    );
}