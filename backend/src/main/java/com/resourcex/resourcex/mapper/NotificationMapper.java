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

                .title(notification.getTitle())

                .message(notification.getMessage())

                .relatedEntityType(notification.getRelatedEntityType())

                .relatedEntityId(notification.getRelatedEntityId())

                .isRead(notification.getIsRead())

                .createdByUserId(
                        notification.getCreatedBy() != null
                                ? notification.getCreatedBy().getUserId()
                                : null
                )

                .createdByUserName(
                        notification.getCreatedBy() != null
                                ? notification.getCreatedBy().getName()
                                : null
                )

                .createdAt(notification.getCreatedAt())

                .readAt(notification.getReadAt())

                .build();
    }
}
