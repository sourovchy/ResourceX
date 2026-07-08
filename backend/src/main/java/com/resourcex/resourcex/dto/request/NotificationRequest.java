package com.resourcex.resourcex.dto.request;

import com.resourcex.resourcex.entity.Notification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Notification type is required")
    private Notification.NotificationType notificationType;

    @NotBlank(message = "Message is required")
    private String message;

    @NotNull(message = "Related entity type is required")
    private Notification.RelatedEntityType relatedEntityType;

    private Long relatedEntityId;

    private Long createdByUserId;
}
