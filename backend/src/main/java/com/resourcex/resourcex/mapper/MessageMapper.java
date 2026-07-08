package com.resourcex.resourcex.mapper;

import com.resourcex.resourcex.dto.response.MessageResponse;
import com.resourcex.resourcex.entity.Message;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.service.AvatarUrlResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MessageMapper {

    private final AvatarUrlResolver avatarUrlResolver;

    public MessageResponse toResponse(Message message) {
        return MessageResponse.builder()
                .messageId(message.getMessageId())
                .conversationId(message.getConversation() != null ? message.getConversation().getConversationId() : null)
                .senderUserId(getUserId(message.getSenderUser()))
                .senderName(getUserName(message.getSenderUser()))
                .senderEmail(getUserEmail(message.getSenderUser()))
                .senderAvatarUrl(getUserAvatar(message.getSenderUser()))
                .content(message.getContent())
                .isRead(message.isRead())
                .createdAt(message.getCreatedAt())
                .updatedAt(null)
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

    private String getUserAvatar(User user) {
        return user != null ? avatarUrlResolver.resolve(user.getAvatarFileId()) : null;
    }
}