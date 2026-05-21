package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.StudentVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentVerificationRepository extends JpaRepository<StudentVerification, Long> {
    Optional<StudentVerification> findByUserUserId(Long userId);
}
