package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.Message;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("""
            select m from Message m
            where m.conversation.conversationId = :conversationId
              and (cast(:clearedAt as timestamp) is null or m.createdAt >= :clearedAt)
            order by m.createdAt asc
            """)
    List<Message> findVisibleMessagesForUser(
            @Param("conversationId") Long conversationId,
            @Param("clearedAt") LocalDateTime clearedAt
    );

    List<Message> findByConversationConversationIdOrderByCreatedAtAsc(Long conversationId);

    Optional<Message> findFirstByConversationConversationIdOrderByCreatedAtDesc(Long conversationId);

    Optional<Message> findByMessageIdAndConversationConversationId(Long messageId, Long conversationId);

    @Query("""
            select count(m) from Message m
            where m.conversation.conversationId = :conversationId
              and m.senderUser.userId <> :userId
              and m.isRead = false
            """)
    long countUnreadMessagesForUser(
            @Param("conversationId") Long conversationId,
            @Param("userId") Long userId
    );

    @Query("""
            select count(m) from Message m
            where m.senderUser.userId <> :userId
              and m.isRead = false
              and (
                m.conversation.participantOneUser.userId = :userId
                or m.conversation.participantTwoUser.userId = :userId
              )
            """)
    long countTotalUnreadMessagesForUser(@Param("userId") Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update Message m
            set m.isRead = true
            where m.conversation.conversationId = :conversationId
              and m.senderUser.userId <> :userId
              and m.isRead = false
            """)
    int markConversationMessagesAsRead(
            @Param("conversationId") Long conversationId,
            @Param("userId") Long userId
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update Message m
            set m.isRead = true
            where m.messageId = :messageId
              and m.senderUser.userId <> :userId
              and m.isRead = false
            """)
    int markMessageAsRead(
            @Param("messageId") Long messageId,
            @Param("userId") Long userId
    );
}