package com.resourcex.resourcex.mapper;

import com.resourcex.resourcex.dto.response.AuditLogResponse;
import com.resourcex.resourcex.entity.AuditLog;
import org.springframework.stereotype.Component;

@Component
public class AuditLogMapper {

    public AuditLogResponse toResponse(AuditLog auditLog) {
        if (auditLog == null) {
            return null;
        }

        return AuditLogResponse.builder()
                .auditId(auditLog.getAuditId())
                .actorType(auditLog.getActorType() != null ? auditLog.getActorType().name() : null)
                .actorId(auditLog.getActor() != null ? auditLog.getActor().getUserId() : null)
                .actorName(auditLog.getActor() != null ? auditLog.getActor().getName() : null)
                .actionType(auditLog.getActionType())
                .entityType(auditLog.getEntityType())
                .entityId(auditLog.getEntityId())
                .outcome(auditLog.getOutcome() != null ? auditLog.getOutcome().name() : null)
                .details(auditLog.getDetails())
                .createdAt(auditLog.getCreatedAt())
                .build();
    }
}
