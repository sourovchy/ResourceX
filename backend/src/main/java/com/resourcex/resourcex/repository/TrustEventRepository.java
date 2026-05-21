package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.TrustEvent;
import com.resourcex.resourcex.entity.TrustEvent.TrustEventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrustEventRepository extends JpaRepository<TrustEvent, Long> {

    List<TrustEvent> findByUser_UserId(Long userId);

    List<TrustEvent> findByEventType(TrustEventType eventType);

    long countByUser_UserId(Long userId);

    long countByEventType(TrustEventType eventType);

    @Query("""
            SELECT COALESCE(SUM(t.points), 0)
            FROM TrustEvent t
            WHERE t.user.userId = :userId
            """)
    Integer sumPointsByUserId(Long userId);
}