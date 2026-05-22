package com.resourcex.resourcex.repository;

import com.resourcex.resourcex.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Get all notifications for a user ordered by creation time (newest first)
     */
    List<Notification> findByUserUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Get unread notifications for a user
     */
    List<Notification> findByUserUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    /**
     * Get read notifications for a user
     */
    List<Notification> findByUserUserIdAndIsReadTrueOrderByCreatedAtDesc(Long userId);

    /**
     * Count unread notifications for a user
     */
    Long countByUserUserIdAndIsReadFalse(Long userId);

    /**
     * Count total notifications for a user
     */
    Long countByUserUserId(Long userId);

    /**
     * Get notifications by type for a user
     */
    List<Notification> findByUserUserIdAndNotificationTypeOrderByCreatedAtDesc(
            Long userId, 
            Notification.NotificationType notificationType
    );

    /**
     * Get notifications related to a specific entity
     */
    List<Notification> findByRelatedEntityTypeAndRelatedEntityIdOrderByCreatedAtDesc(
            Notification.RelatedEntityType entityType,
            Long entityId
    );

    /**
     * Get notifications for a user related to a specific entity
     */
    List<Notification> findByUserUserIdAndRelatedEntityTypeAndRelatedEntityIdOrderByCreatedAtDesc(
            Long userId,
            Notification.RelatedEntityType entityType,
            Long entityId
    );

    /**
     * Check if a notification exists for a user
     */
    boolean existsByUserUserIdAndNotificationId(Long userId, Long notificationId);

    /**
     * Get a notification by ID if it belongs to the specified user
     */
    Optional<Notification> findByNotificationIdAndUserUserId(Long notificationId, Long userId);

    /**
     * Delete all read notifications for a user older than a certain point
     * (useful for cleanup)
     */
    @Query("DELETE FROM Notification n WHERE n.user.userId = :userId AND n.isRead = true")
    void deleteReadNotificationsByUserId(@Param("userId") Long userId);
}
