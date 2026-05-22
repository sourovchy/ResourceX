package com.resourcex.resourcex.mapper;

import com.resourcex.resourcex.dto.response.ConversationResponse;
import com.resourcex.resourcex.entity.Conversation;
import com.resourcex.resourcex.entity.Message;
import com.resourcex.resourcex.entity.User;
import org.springframework.stereotype.Component;

@Component
public class ConversationMapper {

    public ConversationResponse toResponse(Conversation conversation, Long unreadCount, Message lastMessage) {
        ConversationResponse.ConversationResponseBuilder builder = ConversationResponse.builder()
                .conversationId(conversation.getConversationId())
                .participantOneUserId(getUserId(conversation.getParticipantOneUser()))
                .participantOneName(getUserName(conversation.getParticipantOneUser()))
                .participantOneEmail(getUserEmail(conversation.getParticipantOneUser()))
                .participantTwoUserId(getUserId(conversation.getParticipantTwoUser()))
                .participantTwoName(getUserName(conversation.getParticipantTwoUser()))
                .participantTwoEmail(getUserEmail(conversation.getParticipantTwoUser()))
                .bookingId(conversation.getBooking() != null ? conversation.getBooking().getBookingId() : null)
                .disputeId(conversation.getDispute() != null ? conversation.getDispute().getDisputeId() : null)
                .unreadCount(unreadCount)
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
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
}