package com.resourcex.resourcex.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private Long auditId;
    private String actorType;
    private Long actorId;
    private String actorName; // Include a name if actor is a user for UI convenience
    private String actionType;
    private String entityType;
    private Long entityId;
    private String outcome;
    private String details;
    private LocalDateTime createdAt;
}
