package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.NotificationRequest;
import com.resourcex.resourcex.dto.response.NotificationResponse;
import com.resourcex.resourcex.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {

    /**
     * Create a new notification
     */
    NotificationResponse createNotification(NotificationRequest request);

    /**
     * Get notifications for a user, paginated and ordered newest-first.
     */
    Page<NotificationResponse> getNotificationsByUserId(Long userId, Pageable pageable);

    /**
     * Get notification by ID
     */
    NotificationResponse getNotificationById(Long notificationId);

    /**
     * Get all notifications for a user (paginated and ordered)
     */
    List<NotificationResponse> getNotificationsByUserId(Long userId);

    /**
     * Get unread notifications for a user
     */
    List<NotificationResponse> getUnreadNotificationsByUserId(Long userId);

    /**
     * Get read notifications for a user
     */
    List<NotificationResponse> getReadNotificationsByUserId(Long userId);

    /**
     * Get notifications by type for a user
     */
    List<NotificationResponse> getNotificationsByUserIdAndType(Long userId, Notification.NotificationType type);

    /**
     * Get notifications related to a specific entity
     */
    List<NotificationResponse> getNotificationsByEntity(
            Notification.RelatedEntityType entityType,
            Long entityId);

    /**
     * Get unread count for a user
     */
    Long getUnreadCountByUserId(Long userId);

    /**
     * Get total count for a user
     */
    Long getTotalCountByUserId(Long userId);

    /**
     * Mark a notification as read
     */
    NotificationResponse markAsRead(Long notificationId);

    /**
     * Mark all notifications as read for a user
     */
    void markAllAsRead(Long userId);

    /**
     * Mark a notification as unread
     */
    NotificationResponse markAsUnread(Long notificationId);

    /**
     * Delete a notification
     */
    void deleteNotification(Long notificationId);

    /**
     * Delete all read notifications for a user
     */
    void deleteReadNotifications(Long userId);

    /**
     * Create notification for booking event
     */
    NotificationResponse createBookingNotification(
            Long userId,
            Long bookingId,
            String message,
            Long createdByUserId);

    /**
     * Create notification for trust event
     */
    NotificationResponse createTrustNotification(
            Long userId,
            Long trustEventId,
            String message,
            Long createdByUserId);

    /**
     * Create notification for a new chat message.
     * relatedEntityId is the conversation id (used for deep-linking to the inbox).
     */
    NotificationResponse createMessageNotification(
            Long userId,
            Long conversationId,
            String message,
            Long createdByUserId);

    /**
     * Create notification for a submitted review.
     */
    NotificationResponse createReviewNotification(
            Long userId,
            Long reviewId,
            String message,
            Long createdByUserId);

    /**
     * Create admin notification
     */
    NotificationResponse createAdminNotification(
            Long userId,
            String message,
            Long createdByUserId);

    /**
     * Broadcast notification to multiple users
     */
    void broadcastNotification(
            List<Long> userIds,
            Notification.NotificationType type,
            String message,
            Notification.RelatedEntityType entityType,
            Long entityId,
            Long createdByUserId);

    /**
     * Cleanup stale notifications
     */
    void cleanupStaleNotifications(java.time.LocalDateTime threshold);
}
