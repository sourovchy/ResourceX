package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("""
            select c
            from Conversation c
            where (
                   (c.participantOneUser.userId = :userId and c.participantOneDeleted = false)
                or (c.participantTwoUser.userId = :userId and c.participantTwoDeleted = false)
            )
            order by coalesce(c.lastMessageAt, c.createdAt) desc, c.conversationId desc
            """)
    List<Conversation> findAllByUserIdOrderByActivityDesc(@Param("userId") Long userId);

    @Query("""
            select c
            from Conversation c
            where (
                    (c.participantOneUser.userId = :participantOneUserId
                     and c.participantTwoUser.userId = :participantTwoUserId)
                 or (c.participantOneUser.userId = :participantTwoUserId
                     and c.participantTwoUser.userId = :participantOneUserId)
            )
              and ((:bookingId is null and c.booking is null) or c.booking.bookingId = :bookingId)
              and ((:disputeId is null and c.dispute is null) or c.dispute.disputeId = :disputeId)
            """)
    Optional<Conversation> findExistingConversation(
            @Param("participantOneUserId") Long participantOneUserId,
            @Param("participantTwoUserId") Long participantTwoUserId,
            @Param("bookingId") Long bookingId,
            @Param("disputeId") Long disputeId
    );
}