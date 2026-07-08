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

    @Query("SELECT u FROM User u WHERE u.role.name IN :roleNames")
    Page<User> findAllByRoleNames(@Param("roleNames") List<String> roleNames, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.role.name IN :roleNames")
    List<User> findAllByRoleNamesList(@Param("roleNames") List<String> roleNames);

    @Query("SELECT u FROM User u WHERE u.role.name NOT IN :excludedRoles")
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

    Page<User> findByStatus(UserStatus status, Pageable pageable);

    List<User> findAllByOrderByUserIdDesc();

    List<User> findByStatusOrderByUserIdDesc(UserStatus status);

    Optional<User> findByEmail(String email);

    List<User> findByCreatedAtBetweenOrderByUserIdDesc(
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    long countByStatus(UserStatus status);

    // Suspension lifecycle queries moved to StudentRestrictionRepository
    // (suspension state now lives on student_restrictions).
}