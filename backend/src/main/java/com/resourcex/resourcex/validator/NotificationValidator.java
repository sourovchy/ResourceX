package com.resourcex.resourcex.validator;

import com.resourcex.resourcex.dto.request.NotificationRequest;
import com.resourcex.resourcex.exception.BadRequestException;
import org.springframework.stereotype.Component;

@Component
public class NotificationValidator {

    /**
     * Validate notification creation request
     */
    public void validateCreateRequest(NotificationRequest request) {
        if (request == null) {
            throw new BadRequestException("Notification request cannot be null");
        }

        if (request.getUserId() == null || request.getUserId() <= 0) {
            throw new BadRequestException("User ID must be valid");
        }

        if (request.getNotificationType() == null) {
            throw new BadRequestException("Notification type is required");
        }

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new BadRequestException("Notification title cannot be empty");
        }

        if (request.getTitle().length() > 255) {
            throw new BadRequestException("Notification title cannot exceed 255 characters");
        }

        if (request.getMessage() == null || request.getMessage().isBlank()) {
            throw new BadRequestException("Notification message cannot be empty");
        }

        if (request.getRelatedEntityType() == null) {
            throw new BadRequestException("Related entity type is required");
        }

        // Validate that title and message are reasonable lengths
        if (request.getMessage().length() > 10000) {
            throw new BadRequestException("Notification message is too long");
        }
    }

    /**
     * Validate that the user has access to view a notification
     */
    public void validateUserAccess(Long notificationUserId, Long requestingUserId) {
        if (!notificationUserId.equals(requestingUserId)) {
            throw new BadRequestException("User does not have access to this notification");
        }
    }
}
