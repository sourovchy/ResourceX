package com.resourcex.resourcex.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "penalties",
        indexes = {
                @Index(name = "idx_penalty_user", columnList = "user_id"),
                @Index(name = "idx_penalty_booking", columnList = "booking_id"),
                @Index(name = "idx_penalty_dispute", columnList = "dispute_id"),
                @Index(name = "idx_penalty_status", columnList = "status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user", "booking", "dispute", "issuedBy"})
public class Penalty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long penaltyId;

    /**
     * User receiving the penalty
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Related booking (optional)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    /**
     * Related dispute (optional)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispute_id")
    private Dispute dispute;

    /**
     * Penalty amount
     */
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(precision = 10, scale = 2)
    private BigDecimal amount;

    /**
     * Reason for penalty
     */
    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    /**
     * Current penalty status
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PenaltyStatus status = PenaltyStatus.PENDING;

    /**
     * Staff/Admin who issued the penalty
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "issued_by", nullable = false)
    private Staff issuedBy;

    /**
     * Creation timestamp
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * When penalty was applied
     */
    private LocalDateTime appliedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {

        if (this.status == PenaltyStatus.APPLIED && this.appliedAt == null) {
            this.appliedAt = LocalDateTime.now();
        }

        if (this.status != PenaltyStatus.APPLIED) {
            this.appliedAt = null;
        }
    }

    public enum PenaltyStatus {
        PENDING,
        APPLIED,
        WAIVED
    }
}