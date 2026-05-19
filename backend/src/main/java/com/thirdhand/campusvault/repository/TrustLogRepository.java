package com.thirdhand.campusvault.repository;

import com.thirdhand.campusvault.entity.TrustLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrustLogRepository extends JpaRepository<TrustLog, Long> {
}