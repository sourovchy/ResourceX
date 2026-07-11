package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.entity.StudentProfile;
import com.resourcex.resourcex.entity.StudentRestriction;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserStatus;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.EmailService;
import com.resourcex.resourcex.service.NotificationService;
import com.resourcex.resourcex.service.StudentRestrictionManager;
import com.resourcex.resourcex.service.TrustEnforcementService;
import com.resourcex.resourcex.util.constants.TrustPoints;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Applies the automated Trust Score enforcement ladder. Runs inside the caller's
 * transaction (invoked from {@code TrustScoreServiceImpl.applyTrustChange}).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TrustEnforcementServiceImpl implements TrustEnforcementService {

    private static final String WARNING_MESSAGE =
            "Your Trust Score has fallen below the acceptable community standard. "
            + "Continued negative behavior may result in account restrictions or suspension. "
            + "Please complete transactions responsibly and follow platform guidelines.";

    private static final String RESTRICTION_MESSAGE =
            "Your account has been temporarily restricted due to a low Trust Score. "
            + "Improve your standing through successful transactions and positive community interactions.";

    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final StudentRestrictionManager restrictionManager;

    @Override
    @Transactional
    public void evaluate(User user, StudentProfile profile, int oldScore) {
        if (user == null || profile == null) {
            return;
        }

        int score = profile.getTrustScore() == null ? TrustPoints.INITIAL_SCORE : profile.getTrustScore();
        Long userId = user.getUserId();

        // Suspension/restriction state lives on the student's restriction record (0..1).
        StudentRestriction restriction = restrictionManager.find(userId).orElse(null);
        boolean restrictionDirty = false;

        // ── Warning (<60) ────────────────────────────────────────────────────
        if (score < TrustPoints.WARNING_THRESHOLD && oldScore >= TrustPoints.WARNING_THRESHOLD) {
            notificationService.createTrustNotification(
                    userId, null, WARNING_MESSAGE, null);
            emailService.sendTrustNotificationEmail(
                    user.getEmail(), "ResourceX — Trust Score Warning", "Trust Score Warning", WARNING_MESSAGE);
        }

        // ── Restriction (<50) ────────────────────────────────────────────────
        if (score < TrustPoints.RESTRICTION_THRESHOLD && oldScore >= TrustPoints.RESTRICTION_THRESHOLD) {
            notificationService.createTrustNotification(
                    userId, null, RESTRICTION_MESSAGE, null);
            emailService.sendTrustNotificationEmail(
                    user.getEmail(), "ResourceX — Account Restricted", "Account Restricted", RESTRICTION_MESSAGE);
        } else if (score >= TrustPoints.RESTRICTION_THRESHOLD && oldScore < TrustPoints.RESTRICTION_THRESHOLD) {
            notificationService.createTrustNotification(
                    userId, null,
                    "Your account restriction has been lifted as your Trust Score recovered. Thank you for improving your standing.",
                    null);
        }

        // ── Automatic suspension (<40) ───────────────────────────────────────
        if (score < TrustPoints.SUSPENSION_THRESHOLD && !isSuspended(restriction)) {
            restriction = ensureRestriction(restriction, userId);
            autoSuspend(user, restriction, score);
            restrictionDirty = true;
        }

        if (restrictionDirty && restriction != null) {
            restrictionManager.save(restriction);
        }
        userRepository.save(user);
    }

    private StudentRestriction ensureRestriction(StudentRestriction restriction, Long userId) {
        return restriction != null ? restriction : restrictionManager.getOrCreate(userId);
    }

    private boolean isSuspended(StudentRestriction restriction) {
        if (restriction == null || restriction.getSuspendedAt() == null) {
            return false;
        }
        LocalDateTime until = restriction.getSuspendedUntil();
        return until == null || LocalDateTime.now().isBefore(until);
    }

    private void autoSuspend(User user, StudentRestriction restriction, int score) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime until = null;

        String reason = "Automatic suspension — Trust Score fell below " + TrustPoints.SUSPENSION_THRESHOLD
                + " (score " + score + ").";

        restriction.setSuspensionReason(reason);
        restriction.setSuspendedAt(now);
        restriction.setSuspendedUntil(until);
        restriction.setScheduledDeletionAt(now.plusDays(15));

        String message = "Your account has been automatically suspended (pending administrator review) "
                + "because your Trust Score dropped below the safety threshold. "
                + "Login remains available, but marketplace actions are disabled.";

        notificationService.createTrustNotification(
                user.getUserId(), null, message, null);
        emailService.sendTrustNotificationEmail(
                user.getEmail(), "ResourceX — Account Suspended", "Account Suspended", message);

        log.info("[Trust] Auto-suspended user {} (PERMANENT) due to low score", user.getUserId());
    }

}
