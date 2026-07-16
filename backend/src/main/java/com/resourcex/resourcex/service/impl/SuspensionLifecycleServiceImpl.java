package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.entity.AuditLog;
import com.resourcex.resourcex.entity.StudentRestriction;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserStatus;
import com.resourcex.resourcex.repository.StudentRestrictionRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.AuditLogService;
import com.resourcex.resourcex.service.SuspensionLifecycleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Each method runs in its own transaction
 * ({@link Propagation#REQUIRES_NEW REQUIRES_NEW}) so a failure on one user
 * cannot leave the rest of the batch in a partial state — every side-effect
 * for a single user commits atomically, or none of them do.
 *
 * <p>This is the fix for the partial-state-corruption bug surfaced by
 * {@code UserSuspensionSchedulerTransactionIntegrationTest}: with the previous
 * design the scheduler was itself {@code @Transactional}, so when one
 * {@code userRepository.save(...)} threw mid-loop, the dirty managed entity
 * ({@code user.status = ACTIVE}) was still flushed at outer-commit while
 * {@code student_restrictions} and {@code audit_log} were skipped.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SuspensionLifecycleServiceImpl implements SuspensionLifecycleService {

    private final UserRepository userRepository;
    private final StudentRestrictionRepository restrictionRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void liftExpiredFor(User user, StudentRestriction restriction) {
        String email = user.getEmail();

        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        restriction.clearSuspension();
        restrictionRepository.save(restriction);

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
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void deletePermanentlySuspendedFor(User user) {
        Long userId = user.getUserId();
        String email = user.getEmail();

        // Audit first — we need the record before deletion.
        auditLogService.logAction(
                AuditLog.ActorType.SYSTEM,
                null,
                "USER_PERMANENT_DELETION",
                "USER",
                userId,
                AuditLog.AuditOutcome.SUCCESS,
                "Permanently suspended account deleted after retention period: " + email
        );

        // Cascade deletes handle related data (items, bookings, profiles, etc.).
        userRepository.delete(user);
        log.info("[Scheduler] Deleted permanently suspended account: {} (id={})", email, userId);
    }
}