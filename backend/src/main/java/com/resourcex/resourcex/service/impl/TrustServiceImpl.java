package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.response.TrustEventResponse;
import com.resourcex.resourcex.entity.Penalty;
import com.resourcex.resourcex.entity.TrustEvent;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.repository.PenaltyRepository;
import com.resourcex.resourcex.repository.TrustEventRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.AuditLogService;
import com.resourcex.resourcex.service.TrustService;
import com.resourcex.resourcex.entity.AuditLog;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TrustServiceImpl implements TrustService {

    private final TrustEventRepository trustEventRepository;
    private final UserRepository userRepository;
    private final PenaltyRepository penaltyRepository;

    private final com.resourcex.resourcex.repository.StudentProfileRepository studentProfileRepository;
    private final com.resourcex.resourcex.repository.AuditLogRepository auditLogRepository;
    private final AuditLogService auditLogService;

    @Override
    public TrustEventResponse createTrustEvent(
            Long userId,
            TrustEvent.TrustEventType eventType,
            Integer points,
            String reason
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        int oldScore = 100;
        int changeAmount = points == null ? 0 : points;

        TrustEvent trustEvent = TrustEvent.builder()
                .user(user)
                .sourceType(eventType)
                .changeAmount(changeAmount)
                .oldScore(oldScore)
                .newScore(oldScore + changeAmount)
                .reason(reason)
                .build();

        TrustEvent savedEvent = trustEventRepository.save(trustEvent);

        auditLogService.logAction(
                AuditLog.ActorType.SYSTEM,
                null,
                "TRUST_EVENT_CREATED",
                "TRUST_EVENT",
                savedEvent.getTrustEventId(),
                AuditLog.AuditOutcome.SUCCESS,
                "Trust event created for user " + user.getUserId() + ". Points: " + changeAmount
        );

        return mapToResponse(savedEvent);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrustEventResponse> getTrustEventsByUserId(Long userId) {

        return trustEventRepository.findByUser_UserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrustEventResponse> getAllTrustEvents() {

        return trustEventRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long getTrustScore(Long userId) {

        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Integer score = trustEventRepository.sumPointsByUserId(userId);

        return score != null ? score : 0;
    }

    @Override
    public void applyPenaltyImpact(
            Long userId,
            Long penaltyId,
            Integer deductionPoints,
            String reason
    ) {

        Penalty penalty = penaltyRepository.findById(penaltyId)
                .orElseThrow(() -> new ResourceNotFoundException("Penalty not found"));

        createTrustEvent(
                userId,
                TrustEvent.TrustEventType.PENALTY,
                -Math.abs(deductionPoints),
                reason != null ? reason : penalty.getReason()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.resourcex.resourcex.dto.response.AdminTrustUserResponse> getAllUsersForTrustAdmin() {
        List<com.resourcex.resourcex.entity.StudentProfile> profiles = studentProfileRepository.findAllByOrderByUserIdDesc();
        return profiles.stream().map(p -> {
            User u = p.getUser();
            return com.resourcex.resourcex.dto.response.AdminTrustUserResponse.builder()
                    .userId(u != null ? u.getUserId() : null)
                    .name(u != null ? u.getName() : null)
                    .email(u != null ? u.getEmail() : null)
                    .trustScore(p.getTrustScore())
                    .build();
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.resourcex.resourcex.dto.response.TrustAuditResponse> getTrustAuditLog() {
        List<com.resourcex.resourcex.entity.AuditLog> logs = auditLogRepository.findAllByOrderByCreatedAtDesc();
        java.time.format.DateTimeFormatter ISO = java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        return logs.stream().map(l -> com.resourcex.resourcex.dto.response.TrustAuditResponse.builder()
                .id(l.getAuditId())
                .userId(l.getActor() != null ? l.getActor().getUserId() : null)
                .userName(l.getActor() != null ? l.getActor().getName() : null)
                .scoreChange(null)
                .description(l.getDetails())
                .createdAt(l.getCreatedAt() != null ? l.getCreatedAt().format(ISO) : null)
                .build()).toList();
    }

    @Override
    @Transactional
    public void adjustTrust(Long userId, Integer change, String reason) {
        com.resourcex.resourcex.entity.StudentProfile profile = studentProfileRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user"));

        int newScore = profile.getTrustScore() + change;
        if (newScore < 0) newScore = 0;
        if (newScore > 100) newScore = 100;

        profile.setTrustScore(newScore);
        studentProfileRepository.save(profile);

        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        User actor = null;
        if (authentication != null && authentication.getName() != null) {
            actor = userRepository.findByEmailIgnoreCase(authentication.getName()).orElse(null);
        }

        String details = "Manual trust adjustment: change=" + change + ", reason=" + (reason == null ? "" : reason);
        auditLogService.logAction(
                actor != null ? AuditLog.ActorType.USER : AuditLog.ActorType.SYSTEM,
                actor != null ? actor.getUserId() : null,
                "TRUST_ADJUSTMENT",
                "USER",
                userId,
                AuditLog.AuditOutcome.APPLIED,
                details
        );
    }

    private TrustEventResponse mapToResponse(TrustEvent trustEvent) {

        return TrustEventResponse.builder()
                .trustEventId(trustEvent.getTrustEventId())
                .userId(trustEvent.getUser().getUserId())
                .userName(trustEvent.getUser().getName())
                .eventType(trustEvent.getSourceType())
                .points(trustEvent.getChangeAmount())
                .reason(trustEvent.getReason())
                .createdAt(trustEvent.getCreatedAt())
                .build();
    }
}
