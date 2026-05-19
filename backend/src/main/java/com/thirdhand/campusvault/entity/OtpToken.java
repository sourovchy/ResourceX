package com.thirdhand.campusvault.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
        name = "otp_tokens",
        indexes = {
                @Index(name = "idx_otp_email_status", columnList = "email,status"),
                @Index(name = "idx_otp_expires_at", columnList = "expiresAt")
        }
)
public class OtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 100)
    private String otpHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OtpStatus status;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant expiresAt;

    private Instant verifiedAt;

    private Instant usedAt;

    @Column(nullable = false)
    private int attemptCount = 0;

    private Instant lastSentAt;

    @Version
    private Long version;

    public OtpToken() {}

    public OtpToken(String email, String otpHash, OtpStatus status, Instant createdAt, Instant expiresAt) {
        this.email = email;
        this.otpHash = otpHash;
        this.status = status;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.lastSentAt = createdAt;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getOtpHash() { return otpHash; }
    public OtpStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getExpiresAt() { return expiresAt; }
    public Instant getVerifiedAt() { return verifiedAt; }
    public Instant getUsedAt() { return usedAt; }
    public int getAttemptCount() { return attemptCount; }
    public Instant getLastSentAt() { return lastSentAt; }

    public void setOtpHash(String otpHash) { this.otpHash = otpHash; }
    public void setStatus(OtpStatus status) { this.status = status; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public void setVerifiedAt(Instant verifiedAt) { this.verifiedAt = verifiedAt; }
    public void setUsedAt(Instant usedAt) { this.usedAt = usedAt; }
    public void setAttemptCount(int attemptCount) { this.attemptCount = attemptCount; }
    public void setLastSentAt(Instant lastSentAt) { this.lastSentAt = lastSentAt; }
}