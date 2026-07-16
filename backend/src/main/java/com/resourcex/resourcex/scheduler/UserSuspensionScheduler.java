package com.resourcex.resourcex.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.resourcex.resourcex.entity.StudentRestriction;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.repository.StudentRestrictionRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.SuspensionLifecycleService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Nightly jobs that enforce the suspension lifecycle:
 * <ol>
 *   <li>Lift expired timed suspensions (ONE_DAY / SEVEN_DAYS / THIRTY_DAYS).</li>
 *   <li>Delete permanently suspended accounts whose 15-day retention window has passed.</li>
 * </ol>
 *
 * Runs at 02:00 UTC every day ({@code 0 0 2 * * *}).
 *
 * <p>The scheduler itself is intentionally NOT {@code @Transactional}. Each
 * per-user side-effect runs in its own
 * {@link org.springframework.transaction.annotation.Propagation#REQUIRES_NEW REQUIRES_NEW}
 * transaction via {@link SuspensionLifecycleService}, so a failure on one row
 * cannot leave the rest of the batch in a partial state. The outer try/catch
 * in this class is only for logging and continuing with the next user.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class UserSuspensionScheduler {

    private final UserRepository userRepository;
    private final StudentRestrictionRepository restrictionRepository;
    private final SuspensionLifecycleService suspensionLifecycleService;

    // ── 1. Lift expired timed suspensions ────────────────────────────────────────
    @Scheduled(cron = "0 0 2 * * *")
    public void liftExpiredSuspensions() {
        LocalDateTime now = LocalDateTime.now();
        List<StudentRestriction> expired = restrictionRepository.findExpiredTimedSuspensions(now);
        if (expired.isEmpty()) {
            log.debug("[Scheduler] No expired suspensions to lift.");
            return;
        }

        log.info("[Scheduler] Lifting {} expired suspension(s).", expired.size());
        for (StudentRestriction restriction : expired) {
            User user = userRepository.findById(restriction.getStudentUserId()).orElse(null);
            if (user == null) {
                continue;
            }
            String email = user.getEmail();
            try {
                suspensionLifecycleService.liftExpiredFor(user, restriction);
            } catch (Exception ex) {
                log.error("[Scheduler] Failed to lift suspension for {}: {}", email, ex.getMessage(), ex);
            }
        }
    }

    // ── 2. Delete permanently suspended accounts past retention ───────────────────
    @Scheduled(cron = "0 0 2 * * *")
    public void deletePermanentlySuspendedAccounts() {
        LocalDateTime now = LocalDateTime.now();
        List<StudentRestriction> toDelete = restrictionRepository.findScheduledForDeletion(now);
        if (toDelete.isEmpty()) {
            log.debug("[Scheduler] No permanently suspended accounts due for deletion.");
            return;
        }

        log.info("[Scheduler] Deleting {} permanently suspended account(s).", toDelete.size());
        for (StudentRestriction restriction : toDelete) {
            User user = userRepository.findById(restriction.getStudentUserId()).orElse(null);
            if (user == null) {
                continue;
            }
            Long userId = user.getUserId();
            String email = user.getEmail();
            try {
                suspensionLifecycleService.deletePermanentlySuspendedFor(user);
            } catch (Exception ex) {
                log.error("[Scheduler] Failed to delete account {} (id={}): {}",
                        email, userId, ex.getMessage(), ex);
            }
        }
    }
}
