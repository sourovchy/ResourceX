package com.resourcex.resourcex.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_email", columnList = "email"),
        @Index(name = "idx_users_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "avatar_url", length = 1000)
    private String avatarUrl;

    // ── Suspension ──────────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(name = "suspension_type", length = 30)
    private SuspensionType suspensionType;

    @Column(name = "suspension_reason", length = 500)
    private String suspensionReason;

    @Column(name = "suspended_at")
    private LocalDateTime suspendedAt;

    /** Null for PERMANENT suspensions; non-null for timed suspensions. */
    @Column(name = "suspended_until")
    private LocalDateTime suspendedUntil;

    @Column(name = "suspended_by_user_id")
    private Long suspendedByUserId;

    /** Set for PERMANENT suspensions; account deleted on/after this date. */
    @Column(name = "scheduled_deletion_at")
    private LocalDateTime scheduledDeletionAt;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;

        if (this.email != null) {
            this.email = this.email.trim().toLowerCase();
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();

        if (this.email != null) {
            this.email = this.email.trim().toLowerCase();
        }
    }
}
