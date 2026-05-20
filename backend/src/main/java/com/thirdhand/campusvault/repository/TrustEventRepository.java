package com.thirdhand.campusvault.repository;

import com.thirdhand.campusvault.entity.TrustEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrustEventRepository extends JpaRepository<TrustEvent, Long> {
}
