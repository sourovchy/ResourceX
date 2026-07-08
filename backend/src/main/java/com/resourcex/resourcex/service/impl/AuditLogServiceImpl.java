package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.response.AuditLogResponse;
import com.resourcex.resourcex.entity.AuditLog;
import com.resourcex.resourcex.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogServiceImpl implements AuditLogService {

    @Override
    @Async
    @Transactional
    public void logAction(AuditLog.ActorType actorType, Long actorId, String actionType,
                          String entityType, Long entityId, AuditLog.AuditOutcome outcome, String details) {
        log.info("AUDIT LOG: [Actor Type: {}] [Actor ID: {}] [Action Type: {}] [Entity Type: {}] [Entity ID: {}] [Outcome: {}] - {}",
                actorType != null ? actorType : AuditLog.ActorType.SYSTEM,
                actorId, actionType, entityType, entityId,
                outcome != null ? outcome : AuditLog.AuditOutcome.SUCCESS,
                details);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAllLogs() {
        return List.of();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getLogsByUser(Long userId) {
        return List.of();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getLogsByActionType(String actionType) {
        return List.of();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getLogsByEntityType(String entityType) {
        return List.of();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return List.of();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getLogsByEntityTypeAndId(String entityType, Long entityId) {
        return List.of();
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<AuditLogResponse> getLogsWithFilters(
            String actionType,
            String entityType,
            String outcome,
            Long actorId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            org.springframework.data.domain.Pageable pageable) {
        return org.springframework.data.domain.Page.empty();
    }

    @Override
    @Transactional
    public void cleanupOldLogs(LocalDateTime threshold) {
        log.info("Audit log cleanup no-op (audit log database storage is removed).");
    }
}
