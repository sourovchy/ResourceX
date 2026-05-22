package com.resourcex.resourcex.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "trust_events",
        indexes = {
                @Index(name = "idx_trust_events_user_id", columnList = "user_id"),
                @Index(name = "idx_trust_events_created_by_user_id", columnList = "created_by_user_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user", "createdBy"})
public class TrustEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long trustEventId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 30)
    private TrustEventType sourceType;

    @Column(name = "source_id")
    private Long sourceId;

    @Column(name = "change_amount", nullable = false)
    private Integer changeAmount;

    @Column(name = "old_score", nullable = false)
    private Integer oldScore;

    @Column(name = "new_score", nullable = false)
    private Integer newScore;

    @Column(nullable = false, length = 255)
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum TrustEventType {
        PENALTY,
        REVIEW,
        DISPUTE,
        REPORT,
        SYSTEM,
        ADMIN_ACTION
    }
}
