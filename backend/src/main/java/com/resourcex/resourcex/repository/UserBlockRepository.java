package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.UserBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBlockRepository extends JpaRepository<UserBlock, Long> {

    boolean existsByBlocker_UserIdAndBlocked_UserId(Long blockerId, Long blockedId);

    Optional<UserBlock> findByBlocker_UserIdAndBlocked_UserId(Long blockerId, Long blockedId);

    List<UserBlock> findByBlocker_UserIdOrderByCreatedAtDesc(Long blockerId);

    /**
     * True when a block exists in EITHER direction between the two users.
     * Used to enforce read-only conversations and block messaging.
     */
    @Query("""
            SELECT COUNT(b) > 0 FROM UserBlock b
            WHERE (b.blocker.userId = :userIdA AND b.blocked.userId = :userIdB)
               OR (b.blocker.userId = :userIdB AND b.blocked.userId = :userIdA)
            """)
    boolean existsBlockBetween(@Param("userIdA") Long userIdA, @Param("userIdB") Long userIdB);
}
