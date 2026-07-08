package com.resourcex.resourcex.dto.response;

import com.resourcex.resourcex.entity.Notification;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private Long notificationId;

    private Long userId;

    private String userName;

    private Notification.NotificationType notificationType;

    private String message;

    private Notification.RelatedEntityType relatedEntityType;

    private Long relatedEntityId;

    private Boolean isRead;

    private Long createdByUserId;

    private String createdByUserName;

    private LocalDateTime createdAt;

    private LocalDateTime readAt;
}
