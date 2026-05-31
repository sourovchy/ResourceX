package com.resourcex.resourcex.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "notifications",
        indexes = {
                @Index(name = "idx_notifications_user_id", columnList = "user_id"),
                @Index(name = "idx_notifications_read", columnList = "is_read"),
                @Index(name = "idx_notifications_created_at", columnList = "created_at"),
                @Index(name = "idx_notifications_related_entity", columnList = "related_entity_type, related_entity_id"),
                @Index(name = "idx_notifications_created_by_user_id", columnList = "created_by_user_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user", "createdBy"})
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    /**
     * User receiving the notification
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Type of notification (BOOKING, DISPUTE, PENALTY, TRUST, ADMIN)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false, length = 30)
    private NotificationType notificationType;

    /**
     * Notification title
     */
    @Column(nullable = false, length = 255)
    private String title;

    /**
     * Notification message
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    /**
     * Type of related entity (BOOKING, DISPUTE, PENALTY, TRUST, ITEM, ADMIN)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "related_entity_type", nullable = false, length = 30)
    private RelatedEntityType relatedEntityType;

    /**
     * ID of the related entity
     */
    @Column(name = "related_entity_id")
    private Long relatedEntityId;

    /**
     * Whether the notification has been read
     */
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    /**
     * Admin/User who created the notification (nullable for system notifications)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    /**
     * Timestamp when the notification was created
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp when the notification was marked as read
     */
    @Column(name = "read_at")
    private LocalDateTime readAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum NotificationType {
        BOOKING,
        DISPUTE,
        PENALTY,
        TRUST,
        ADMIN,
        MESSAGE,
        REVIEW
    }

    public enum RelatedEntityType {
        BOOKING,
        DISPUTE,
        PENALTY,
        TRUST,
        ITEM,
        ADMIN,
        MESSAGE,
        REVIEW
    }
}
