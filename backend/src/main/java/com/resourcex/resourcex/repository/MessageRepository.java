package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.Message;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByConversationConversationIdOrderByCreatedAtAsc(Long conversationId);

    Optional<Message> findFirstByConversationConversationIdOrderByCreatedAtDesc(Long conversationId);

    Optional<Message> findByMessageIdAndConversationConversationId(Long messageId, Long conversationId);

    long countByConversationConversationIdAndReceiverUserUserIdAndIsReadFalse(Long conversationId, Long receiverUserId);

    long countByReceiverUserUserIdAndIsReadFalse(Long receiverUserId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update Message m
            set m.isRead = true,
                m.readAt = :readAt
            where m.conversation.conversationId = :conversationId
              and m.receiverUser.userId = :receiverUserId
              and m.isRead = false
            """)
    int markConversationMessagesAsRead(
            @Param("conversationId") Long conversationId,
            @Param("receiverUserId") Long receiverUserId,
            @Param("readAt") LocalDateTime readAt
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update Message m
            set m.isRead = true,
                m.readAt = :readAt
            where m.messageId = :messageId
              and m.receiverUser.userId = :receiverUserId
              and m.isRead = false
            """)
    int markMessageAsRead(
            @Param("messageId") Long messageId,
            @Param("receiverUserId") Long receiverUserId,
            @Param("readAt") LocalDateTime readAt
    );
}