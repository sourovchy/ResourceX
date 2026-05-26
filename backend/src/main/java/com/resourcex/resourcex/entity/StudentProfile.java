package com.resourcex.resourcex.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_profiles", indexes = {
        @Index(name = "idx_student_profiles_university_id", columnList = "university_id"),
        @Index(name = "idx_student_profiles_student_id", columnList = "student_id"),
        @Index(name = "idx_student_profiles_phone", columnList = "phone")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "student_id", nullable = false, unique = true, length = 50)
    private String studentId;

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

    @Builder.Default
    @Column(name = "trust_score", nullable = false)
    private Integer trustScore = 100;

    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private Boolean emailVerified = false;

    @Column(name = "phone_verified", nullable = false)
    @Builder.Default
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
        if (this.studentId != null) {
            this.studentId = this.studentId.trim();
        }
        if (this.phone != null) {
            this.phone = this.phone.trim();
        }
        if (this.department != null) {
            this.department = this.department.trim();
        }
    }
}
