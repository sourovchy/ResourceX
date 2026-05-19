package com.thirdhand.campusvault.repository;

import com.thirdhand.campusvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByStudentId(String studentId);

    boolean existsByPhone(String phone);
}