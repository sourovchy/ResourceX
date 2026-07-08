package com.resourcex.resourcex.entity;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    private Long auditId;

    @Builder.Default
    private ActorType actorType = ActorType.USER;

    private User actor;

    private String actionType;

    private String entityType;

    private Long entityId;

    @Builder.Default
    private AuditOutcome outcome = AuditOutcome.SUCCESS;

    private String details;

    private LocalDateTime createdAt;

    public enum ActorType {
        USER, SYSTEM
    }

    public enum AuditOutcome {
        SUCCESS, FAILED, APPROVED, REJECTED, WAIVED, APPLIED
    }
}
