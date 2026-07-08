package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.Conversation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @EntityGraph(attributePaths = { "participantOneUser", "participantTwoUser" }, type = EntityGraph.EntityGraphType.LOAD)
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
            """)
    Optional<Conversation> findExistingConversation(
            @Param("participantOneUserId") Long participantOneUserId,
            @Param("participantTwoUserId") Long participantTwoUserId
    );
}