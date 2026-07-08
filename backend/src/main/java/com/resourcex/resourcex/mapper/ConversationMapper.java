package com.resourcex.resourcex.mapper;

import com.resourcex.resourcex.dto.response.ConversationResponse;
import com.resourcex.resourcex.entity.Conversation;
import com.resourcex.resourcex.entity.Message;
import com.resourcex.resourcex.entity.User;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import com.resourcex.resourcex.service.AvatarUrlResolver;

@Component
@RequiredArgsConstructor
public class ConversationMapper {

    private final AvatarUrlResolver avatarUrlResolver;

    public ConversationResponse toResponse(Conversation conversation, Long unreadCount, Message lastMessage) {
        boolean participantOneIsStaff = isUserStaff(conversation.getParticipantOneUser());
        boolean participantTwoIsStaff = isUserStaff(conversation.getParticipantTwoUser());

        ConversationResponse.ConversationResponseBuilder builder = ConversationResponse.builder()
                .conversationId(conversation.getConversationId())
                .participantOneUserId(getUserId(conversation.getParticipantOneUser()))
                .participantOneName(getUserName(conversation.getParticipantOneUser()))
                .participantOneEmail(participantOneIsStaff ? null : getUserEmail(conversation.getParticipantOneUser()))
                .participantOneIsStaff(participantOneIsStaff)
                .participantOneAvatarUrl(getUserAvatar(conversation.getParticipantOneUser()))
                .participantTwoUserId(getUserId(conversation.getParticipantTwoUser()))
                .participantTwoName(getUserName(conversation.getParticipantTwoUser()))
                .participantTwoEmail(participantTwoIsStaff ? null : getUserEmail(conversation.getParticipantTwoUser()))
                .participantTwoIsStaff(participantTwoIsStaff)
                .participantTwoAvatarUrl(getUserAvatar(conversation.getParticipantTwoUser()))
                .unreadCount(unreadCount)
                .createdAt(conversation.getCreatedAt())
                .updatedAt(null)
                .lastMessageAt(conversation.getLastMessageAt());

        if (lastMessage != null) {
            builder.lastMessageId(lastMessage.getMessageId())
                    .lastMessageContent(lastMessage.getContent())
                    .lastMessageSenderId(getUserId(lastMessage.getSenderUser()))
                    .lastMessageSenderName(getUserName(lastMessage.getSenderUser()));
        }

        return builder.build();
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

    private boolean isUserStaff(User user) {
        if (user == null || user.getRole() == null || user.getRole().getName() == null) {
            return false;
        }
        String role = user.getRole().getName().toUpperCase();
        return role.equals("ROLE_ADMIN") || role.equals("ROLE_SUPER_ADMIN") || role.equals("ROLE_MODERATOR");
    }
}