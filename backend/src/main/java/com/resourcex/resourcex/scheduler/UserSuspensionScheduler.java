package com.resourcex.resourcex.scheduler;

import com.resourcex.resourcex.entity.AuditLog;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserStatus;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Nightly jobs that enforce the suspension lifecycle:
 * <ol>
 *   <li>Lift expired timed suspensions (ONE_DAY / SEVEN_DAYS / THIRTY_DAYS).</li>
 *   <li>Delete permanently suspended accounts whose 15-day retention window has passed.</li>
 * </ol>
 *
 * Runs at 02:00 UTC every day ({@code 0 0 2 * * *}).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class UserSuspensionScheduler {

    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    // ── 1. Lift expired timed suspensions ───────────────────────────────────

    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void liftExpiredSuspensions() {
        LocalDateTime now = LocalDateTime.now();
        List<User> expired = userRepository.findExpiredTemporarySuspensions(now);

        if (expired.isEmpty()) {
            log.debug("[Scheduler] No expired suspensions to lift.");
            return;
        }

        log.info("[Scheduler] Lifting {} expired suspension(s).", expired.size());

        for (User user : expired) {
            String email = user.getEmail();
            try {
                user.setStatus(UserStatus.ACTIVE);
                user.setSuspensionType(null);
                user.setSuspensionReason(null);
                user.setSuspendedAt(null);
                user.setSuspendedUntil(null);
                user.setSuspendedByUserId(null);
                user.setScheduledDeletionAt(null);
                userRepository.save(user);

                auditLogService.logAction(
                        AuditLog.ActorType.SYSTEM,
                        null,
                        "SUSPENSION_EXPIRED",
                        "USER",
                        user.getUserId(),
                        AuditLog.AuditOutcome.SUCCESS,
                        "Suspension period ended — account restored for " + email
                );
                log.info("[Scheduler] Restored account: {}", email);
            } catch (Exception ex) {
                log.error("[Scheduler] Failed to lift suspension for {}: {}", email, ex.getMessage(), ex);
            }
        }
    }

    // ── 2. Delete permanently suspended accounts past retention ─────────────

    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void deletePermanentlySuspendedAccounts() {
        LocalDateTime now = LocalDateTime.now();
        List<User> toDelete = userRepository.findUsersScheduledForDeletion(now);

        if (toDelete.isEmpty()) {
            log.debug("[Scheduler] No permanently suspended accounts due for deletion.");
            return;
        }

        log.info("[Scheduler] Deleting {} permanently suspended account(s).", toDelete.size());

        for (User user : toDelete) {
            Long userId = user.getUserId();
            String email = user.getEmail();
            try {
                // Audit first — we need the record before deletion
                auditLogService.logAction(
                        AuditLog.ActorType.SYSTEM,
                        null,
                        "USER_PERMANENT_DELETION",
                        "USER",
                        userId,
                        AuditLog.AuditOutcome.SUCCESS,
                        "Permanently suspended account deleted after retention period: " + email
                );

                // Cascade deletes handle related data (items, bookings, profiles, etc.)
                userRepository.delete(user);
                log.info("[Scheduler] Deleted permanently suspended account: {} (id={})", email, userId);
            } catch (Exception ex) {
                log.error("[Scheduler] Failed to delete account {} (id={}): {}",
                        email, userId, ex.getMessage(), ex);
            }
        }
    }
}
