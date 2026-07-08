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
                @Index(name = "idx_notifications_related_entity", columnList = "related_entity_type, related_entity_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user"})
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
        TRUST,
        ADMIN,
        MESSAGE,
        REVIEW;

        public String getHeading() {
            return switch (this) {
                case BOOKING -> "Booking Update";
                case MESSAGE -> "New Message";
                case REVIEW -> "New Review";
                case TRUST -> "Trust Score Update";
                case ADMIN -> "Administrative Notice";
            };
        }
    }

    public enum RelatedEntityType {
        BOOKING,
        TRUST,
        ITEM,
        ADMIN,
        MESSAGE,
        REVIEW
    }
}
