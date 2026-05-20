package com.thirdhand.campusvault.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(
        name = "otp_tokens",
        indexes = {
                @Index(
                        name = "idx_otp_email_status",
                        columnList = "email,status"
                ),
                @Index(
                        name = "idx_otp_expires_at",
                        columnList = "expiresAt"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 255)
    private String otpHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50, columnDefinition = "VARCHAR(50)")
    @Builder.Default
    private OtpStatus status = OtpStatus.PENDING;

    @Column(nullable = false)
    @Builder.Default
    private int attemptCount = 0;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant expiresAt;

    private Instant verifiedAt;

    private Instant usedAt;

    private Instant lastSentAt;

    @Version
    private Long version;

    @PrePersist
    public void onCreate() {

        Instant now = Instant.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (lastSentAt == null) {
            lastSentAt = now;
        }
    }
}
