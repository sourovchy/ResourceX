package com.resourcex.resourcex.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResponse {

    private Long conversationId;

    private Long participantOneUserId;
    private String participantOneName;
    private String participantOneEmail;
    private Boolean participantOneIsStaff;
    private String participantOneAvatarUrl;

    private Long participantTwoUserId;
    private String participantTwoName;
    private String participantTwoEmail;
    private Boolean participantTwoIsStaff;
    private String participantTwoAvatarUrl;

    private Long bookingId;
    private Long disputeId;

    private Long lastMessageId;
    private String lastMessageContent;
    private Long lastMessageSenderId;
    private String lastMessageSenderName;
    private LocalDateTime lastMessageAt;

    private Long unreadCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}