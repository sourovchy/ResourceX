package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.response.AuditLogResponse;
import com.resourcex.resourcex.entity.AuditLog;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.mapper.AuditLogMapper;
import com.resourcex.resourcex.repository.AuditLogRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final AuditLogMapper auditLogMapper;

    @Override
    @Async
    @Transactional
    public void logAction(AuditLog.ActorType actorType, Long actorId, String actionType,
                          String entityType, Long entityId, AuditLog.AuditOutcome outcome, String details) {
        try {
            User actor = null;
            if (actorId != null) {
                actor = userRepository.findById(actorId).orElse(null);
            }

            AuditLog auditLog = AuditLog.builder()
                    .actorType(actorType != null ? actorType : AuditLog.ActorType.SYSTEM)
                    .actor(actor)
                    .actionType(actionType)
                    .entityType(entityType)
                    .entityId(entityId)
                    .outcome(outcome != null ? outcome : AuditLog.AuditOutcome.SUCCESS)
                    .details(details)
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit log saved successfully: {} on {} {} by {}", actionType, entityType, entityId, actorId);
        } catch (Exception e) {
            log.error("Failed to save audit log: {} on {} {}", actionType, entityType, entityId, e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAllLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(auditLogMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getLogsByUser(Long userId) {
        return auditLogRepository.findByActorUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(auditLogMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getLogsByActionType(String actionType) {
        return auditLogRepository.findByActionTypeOrderByCreatedAtDesc(actionType)
                .stream()
                .map(auditLogMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getLogsByEntityType(String entityType) {
        return auditLogRepository.findByEntityTypeOrderByCreatedAtDesc(entityType)
                .stream()
                .map(auditLogMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return auditLogRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(startDate, endDate)
                .stream()
                .map(auditLogMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getLogsByEntityTypeAndId(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId)
                .stream()
                .map(auditLogMapper::toResponse)
                .collect(Collectors.toList());
    }
}
