package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT DISTINCT u FROM User u JOIN UserRole ur ON ur.user = u JOIN Role r ON ur.role = r WHERE r.name IN :roleNames")
    Page<User> findAllByRoleNames(@Param("roleNames") List<String> roleNames, Pageable pageable);

    @Query("SELECT DISTINCT u FROM User u JOIN UserRole ur ON ur.user = u JOIN Role r ON ur.role = r WHERE r.name IN :roleNames")
    List<User> findAllByRoleNamesList(@Param("roleNames") List<String> roleNames);

    @Query("SELECT DISTINCT u FROM User u WHERE NOT EXISTS (SELECT 1 FROM UserRole ur JOIN Role r ON ur.role = r WHERE ur.user = u AND r.name IN :excludedRoles)")
    Page<User> findAllExcludingRoles(@Param("excludedRoles") List<String> excludedRoles, Pageable pageable);

    /**
     * Search active users by name or email (case-insensitive), excluding one user (the searcher).
     */
    @Query("SELECT u FROM User u WHERE u.status = com.resourcex.resourcex.entity.UserStatus.ACTIVE "
            + "AND u.userId <> :excludeUserId "
            + "AND (LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) "
            + "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))) "
            + "ORDER BY u.name ASC")
    List<User> searchActiveUsers(@Param("query") String query,
                                 @Param("excludeUserId") Long excludeUserId,
                                 Pageable pageable);

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByStatus(UserStatus status);

    List<User> findAllByOrderByUserIdDesc();

    List<User> findByStatusOrderByUserIdDesc(UserStatus status);

    Optional<User> findByEmail(String email);

    List<User> findByCreatedAtBetweenOrderByUserIdDesc(
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    long countByStatus(UserStatus status);

    /** Timed suspensions whose suspendedUntil has passed — to be auto-lifted. */
    @Query("SELECT u FROM User u WHERE u.status = com.resourcex.resourcex.entity.UserStatus.SUSPENDED " +
           "AND u.suspensionType <> com.resourcex.resourcex.entity.SuspensionType.PERMANENT " +
           "AND u.suspendedUntil IS NOT NULL AND u.suspendedUntil <= :now")
    List<User> findExpiredTemporarySuspensions(@Param("now") LocalDateTime now);

    /** Permanently suspended users whose retention window has elapsed — to be deleted. */
    @Query("SELECT u FROM User u WHERE u.status = com.resourcex.resourcex.entity.UserStatus.SUSPENDED " +
           "AND u.suspensionType = com.resourcex.resourcex.entity.SuspensionType.PERMANENT " +
           "AND u.scheduledDeletionAt IS NOT NULL AND u.scheduledDeletionAt <= :now")
    List<User> findUsersScheduledForDeletion(@Param("now") LocalDateTime now);
}