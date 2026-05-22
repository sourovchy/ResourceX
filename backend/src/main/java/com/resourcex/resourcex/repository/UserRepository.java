package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByStatus(UserStatus status);
}