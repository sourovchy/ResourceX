package com.thirdhand.campusvault.repository;

import com.thirdhand.campusvault.entity.PendingUser;
import com.thirdhand.campusvault.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PendingUserRepository extends JpaRepository<PendingUser, Long> {
    Optional<PendingUser> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByStudentId(String studentId);
    boolean existsByPhone(String phone);
    List<PendingUser> findByStatus(UserStatus status);
}
