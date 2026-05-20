package com.thirdhand.campusvault.repository;

import com.thirdhand.campusvault.entity.PendingUser;
import com.thirdhand.campusvault.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PendingUserRepository extends JpaRepository<PendingUser, Long> {

    Optional<PendingUser> findByEmailIgnoreCase(String email);

    Optional<PendingUser> findByStudentId(String studentId);

    Optional<PendingUser> findByPhone(String phone);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByStudentId(String studentId);

    boolean existsByPhone(String phone);

    List<PendingUser> findByStatus(UserStatus status);

    long countByStatus(UserStatus status);
}