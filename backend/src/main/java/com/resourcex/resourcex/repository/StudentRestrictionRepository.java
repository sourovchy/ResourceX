package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.StudentRestriction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface StudentRestrictionRepository extends JpaRepository<StudentRestriction, Long> {

    Optional<StudentRestriction> findByStudentUserId(Long studentUserId);

    /** Timed suspensions whose suspendedUntil has passed — to be auto-lifted. */
    @Query("SELECT r FROM StudentRestriction r " +
           "WHERE r.suspendedUntil IS NOT NULL AND r.suspendedUntil <= :now")
    List<StudentRestriction> findExpiredTimedSuspensions(@Param("now") LocalDateTime now);

    /** Permanently suspended students whose retention window has elapsed — to be deleted. */
    @Query("SELECT r FROM StudentRestriction r " +
           "WHERE r.suspendedUntil IS NULL " +
           "AND r.scheduledDeletionAt IS NOT NULL AND r.scheduledDeletionAt <= :now")
    List<StudentRestriction> findScheduledForDeletion(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(r) FROM StudentRestriction r WHERE r.suspendedAt IS NOT NULL AND " +
           "(r.suspendedUntil IS NULL OR r.suspendedUntil > :now)")
    long countActiveSuspensions(@Param("now") LocalDateTime now);
}
