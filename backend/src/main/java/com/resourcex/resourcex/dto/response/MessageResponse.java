package com.resourcex.resourcex.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {

    private Long messageId;
    private Long conversationId;

    private Long senderUserId;
    private String senderName;
    private String senderEmail;

    private Long receiverUserId;
    private String receiverName;
    private String receiverEmail;

    private String content;
    private Boolean isRead;
    private LocalDateTime readAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}