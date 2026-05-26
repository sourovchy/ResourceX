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
}