package com.resourcex.resourcex.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long auditId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ActorType actorType = ActorType.STAFF;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private Staff actor;

    @Column(nullable = false, length = 80)
    private String actionType;

    @Column(nullable = false, length = 50)
    private String entityType;

    private Long entityId;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AuditOutcome outcome = AuditOutcome.SUCCESS;

    @Column(columnDefinition = "TEXT")
    private String details;

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum ActorType {
        STAFF, SYSTEM
    }

    public enum AuditOutcome {
        SUCCESS, FAILED, APPROVED, REJECTED, WAIVED, APPLIED
    }
}
