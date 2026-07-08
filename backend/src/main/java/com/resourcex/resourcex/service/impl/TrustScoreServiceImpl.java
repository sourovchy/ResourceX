package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.entity.AuditLog;
import com.resourcex.resourcex.entity.StudentProfile;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.repository.StudentProfileRepository;
import com.resourcex.resourcex.service.AuditLogService;
import com.resourcex.resourcex.service.NotificationService;
import com.resourcex.resourcex.service.TrustEnforcementService;
import com.resourcex.resourcex.service.TrustScoreService;
import com.resourcex.resourcex.util.constants.TrustPoints;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrustScoreServiceImpl implements TrustScoreService {

    private final StudentProfileRepository studentProfileRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final TrustEnforcementService trustEnforcementService;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void applyTrustChange(Long userId, int points, String reason) {

        // Trust is a property of student accounts; staff/admins have no profile.
        StudentProfile profile = studentProfileRepository.findByUser_UserId(userId).orElse(null);
        if (profile == null) {
            log.debug("[Trust] Skipping trust change for user {} — no student profile", userId);
            return;
        }

        User user = profile.getUser();
        int oldScore = profile.getTrustScore() == null ? TrustPoints.INITIAL_SCORE : profile.getTrustScore();
        int newScore = TrustPoints.clamp(oldScore + points);

        profile.setTrustScore(newScore);
        studentProfileRepository.save(profile);

        auditLogService.logAction(
                AuditLog.ActorType.SYSTEM,
                null,
                "TRUST_SCORE_CHANGED",
                "USER",
                userId,
                AuditLog.AuditOutcome.SUCCESS,
                String.format("TRUST %+d (%d → %d): %s", points, oldScore, newScore, reason)
        );

        if (points != 0) {
            String message = "Your trust score " + (points > 0 ? "increased" : "decreased")
                    + " by " + Math.abs(points) + " points (now " + newScore + "). Reason: " + reason;
            notificationService.createTrustNotification(userId, null, message, null);
        }

        // Recompute automated enforcement from the new score (self-healing).
        trustEnforcementService.evaluate(user, profile, oldScore);
    }
}
