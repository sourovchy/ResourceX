package com.resourcex.resourcex.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "trust_events",
        indexes = {
                @Index(name = "idx_trust_event_user", columnList = "user_id"),
                @Index(name = "idx_trust_event_type", columnList = "event_type")
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
    @Column(name = "event_type", nullable = false, length = 30)
    private TrustEventType eventType;

    @Column(nullable = false)
    private Integer points;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private Staff createdBy;

    private Long sourceId;

    @Column(nullable = false, updatable = false)
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
        STAFF_ACTION
    }
}