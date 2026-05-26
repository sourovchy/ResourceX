package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.NotificationRequest;
import com.resourcex.resourcex.dto.response.NotificationResponse;
import com.resourcex.resourcex.entity.Notification;

import java.util.List;

public interface NotificationService {

    /**
     * Create a new notification
     */
    NotificationResponse createNotification(NotificationRequest request);

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
            String title,
            String message,
            Long createdByUserId);

    /**
     * Create notification for dispute event
     */
    NotificationResponse createDisputeNotification(
            Long userId,
            Long disputeId,
            String title,
            String message,
            Long createdByUserId);

    /**
     * Create notification for penalty event
     */
    NotificationResponse createPenaltyNotification(
            Long userId,
            Long penaltyId,
            String title,
            String message,
            Long createdByUserId);

    /**
     * Create notification for trust event
     */
    NotificationResponse createTrustNotification(
            Long userId,
            Long trustEventId,
            String title,
            String message,
            Long createdByUserId);

    /**
     * Create admin notification
     */
    NotificationResponse createAdminNotification(
            Long userId,
            String title,
            String message,
            Long createdByUserId);

    /**
     * Broadcast notification to multiple users
     */
    void broadcastNotification(
            List<Long> userIds,
            Notification.NotificationType type,
            String title,
            String message,
            Notification.RelatedEntityType entityType,
            Long entityId,
            Long createdByUserId);

    /**
     * Cleanup stale notifications
     */
    void cleanupStaleNotifications(java.time.LocalDateTime threshold);
}
