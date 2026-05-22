package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.StudentProfile;
import com.resourcex.resourcex.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {

    Optional<StudentProfile> findByUser(User user);

    Optional<StudentProfile> findByUser_UserId(Long userId);

    boolean existsByStudentId(String studentId);

    boolean existsByPhone(String phone);
}
