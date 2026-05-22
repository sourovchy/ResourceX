package com.resourcex.resourcex.mapper;

import com.resourcex.resourcex.dto.response.MessageResponse;
import com.resourcex.resourcex.entity.Message;
import com.resourcex.resourcex.entity.User;
import org.springframework.stereotype.Component;

@Component
public class MessageMapper {

    public MessageResponse toResponse(Message message) {
        return MessageResponse.builder()
                .messageId(message.getMessageId())
                .conversationId(message.getConversation() != null ? message.getConversation().getConversationId() : null)
                .senderUserId(getUserId(message.getSenderUser()))
                .senderName(getUserName(message.getSenderUser()))
                .senderEmail(getUserEmail(message.getSenderUser()))
                .receiverUserId(getUserId(message.getReceiverUser()))
                .receiverName(getUserName(message.getReceiverUser()))
                .receiverEmail(getUserEmail(message.getReceiverUser()))
                .content(message.getContent())
                .isRead(message.isRead())
                .readAt(message.getReadAt())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .build();
    }

    private Long getUserId(User user) {
        return user != null ? user.getUserId() : null;
    }

    private String getUserName(User user) {
        return user != null ? user.getName() : null;
    }

    private String getUserEmail(User user) {
        return user != null ? user.getEmail() : null;
    }
}