package com.resourcex.resourcex.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "pending_users",
        indexes = {
                @Index(name = "idx_pending_users_email", columnList = "email"),
                @Index(name = "idx_pending_users_student_id", columnList = "studentId"),
                @Index(name = "idx_pending_users_status", columnList = "status")
        }
)
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

    @Column(nullable = false, unique = true, length = 100)
    private String studentId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String password;

    @Column(nullable = false, unique = true, length = 30)
    private String phone;

    @Column(length = 150)
    private String university;

    @Column(length = 120)
    private String department;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String idCardDataUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    @Builder.Default
    private UserStatus status = UserStatus.PENDING_VERIFICATION;

    @Builder.Default
    @Column(nullable = false)
    private Boolean emailVerified = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean phoneVerified = false;

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

        if (this.university != null) {
            this.university = this.university.trim();
        }

        if (this.department != null) {
            this.department = this.department.trim();
        }
    }
}