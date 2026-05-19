package com.thirdhand.campusvault.repository;

import com.thirdhand.campusvault.entity.ApprovalLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApprovalLogRepository extends JpaRepository<ApprovalLog, Long> {
}