package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.TrustEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrustEventRepository extends JpaRepository<TrustEvent, Long> {
}
