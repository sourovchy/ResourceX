package com.resourcex.resourcex.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "pending_users", indexes = {
        @Index(name = "idx_pending_users_email", columnList = "email"),
        @Index(name = "idx_pending_users_student_id", columnList = "student_id"),
        @Index(name = "idx_pending_users_status", columnList = "status"),
        @Index(name = "idx_pending_users_university_id", columnList = "university_id"),
        @Index(name = "idx_pending_users_reviewed_by", columnList = "reviewed_by_user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long pendingUserId;

    @Column(name = "student_id", nullable = false, unique = true, length = 50)
    private String studentId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false, unique = true, length = 20)
    private String phone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id")
    private University university;

    @Column(length = 100)
    private String department;

    @Lob
    @Column(name = "id_card_data_url", columnDefinition = "LONGTEXT")
    private String idCardDataUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PendingUserStatus status = PendingUserStatus.REGISTERED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_user_id")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private boolean emailVerified = false;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;

        normalizeFields();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();

        normalizeFields();
    }

    private void normalizeFields() {

        if (this.email != null) {
            this.email = this.email.trim().toLowerCase();
        }

        if (this.phone != null) {
            this.phone = this.phone.trim();
        }

        if (this.studentId != null) {
            this.studentId = this.studentId.trim();
        }

        if (this.name != null) {
            this.name = this.name.trim();
        }

        if (this.department != null) {
            this.department = this.department.trim();
        }
    }
}
