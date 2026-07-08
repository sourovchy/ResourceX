package com.resourcex.resourcex.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_email", columnList = "email"),
        @Index(name = "idx_users_status", columnList = "status"),
        @Index(name = "idx_users_role_id", columnList = "role_id"),
        @Index(name = "idx_users_avatar_file_id", columnList = "avatar_file_id")
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

    /** Exactly one role per user (total participation). */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Avatar lives in the files table (purpose = AVATAR); this is the file reference. */
    @Column(name = "avatar_file_id")
    private Long avatarFileId;

    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    private com.resourcex.resourcex.entity.StudentProfile studentProfile;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;

        if (this.email != null) {
            this.email = this.email.trim().toLowerCase();
        }
    }

    @PreUpdate
    public void onUpdate() {
        if (this.email != null) {
            this.email = this.email.trim().toLowerCase();
        }
    }
}
