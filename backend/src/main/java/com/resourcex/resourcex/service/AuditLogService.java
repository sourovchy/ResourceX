package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.response.AuditLogResponse;
import com.resourcex.resourcex.entity.AuditLog;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogService {

    void logAction(
            AuditLog.ActorType actorType,
            Long actorId,
            String actionType,
            String entityType,
            Long entityId,
            AuditLog.AuditOutcome outcome,
            String details
    );

    List<AuditLogResponse> getAllLogs();

    List<AuditLogResponse> getLogsByUser(Long userId);

    List<AuditLogResponse> getLogsByActionType(String actionType);

    List<AuditLogResponse> getLogsByEntityType(String entityType);

    List<AuditLogResponse> getLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    List<AuditLogResponse> getLogsByEntityTypeAndId(String entityType, Long entityId);

    org.springframework.data.domain.Page<AuditLogResponse> getLogsWithFilters(
            String actionType,
            String entityType,
            String outcome,
            Long actorId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            org.springframework.data.domain.Pageable pageable
    );

    void cleanupOldLogs(LocalDateTime threshold);
}
