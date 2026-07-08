package com.resourcex.resourcex.mapper;

import com.resourcex.resourcex.dto.response.NotificationResponse;
import com.resourcex.resourcex.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationResponse toResponse(Notification notification) {

        if (notification == null) {
            return null;
        }

        return NotificationResponse.builder()
                .notificationId(notification.getNotificationId())

                .userId(
                        notification.getUser() != null
                                ? notification.getUser().getUserId()
                                : null
                )

                .userName(
                        notification.getUser() != null
                                ? notification.getUser().getName()
                                : null
                )

                .notificationType(notification.getNotificationType())

                .message(notification.getMessage())

                .relatedEntityType(notification.getRelatedEntityType())

                .relatedEntityId(notification.getRelatedEntityId())

                .isRead(notification.getIsRead())

                .createdByUserId(null)

                .createdByUserName(null)

                .createdAt(notification.getCreatedAt())

                .readAt(notification.getReadAt())

                .build();
    }
}
