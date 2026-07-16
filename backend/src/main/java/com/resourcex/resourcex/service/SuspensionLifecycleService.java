package com.resourcex.resourcex.service;

import com.resourcex.resourcex.entity.StudentRestriction;
import com.resourcex.resourcex.entity.User;

/**
 * Per-row work extracted from {@code UserSuspensionScheduler} so each user is
 * committed (or rolled back) independently of the others.
 *
 * <p>Both methods run in their own transaction
 * ({@link org.springframework.transaction.annotation.Propagation#REQUIRES_NEW})
 * so a failure on one row never leaves the batch in a partial state — either
 * the row is fully restored/cleared/audited, or none of those side-effects
 * are persisted. The outer scheduler loop keeps its own try/catch purely to
 * log the failure and continue with the next user.
 */
public interface SuspensionLifecycleService {

    /**
     * Restore one user's account and clear the matching expired
     * {@link StudentRestriction}. Runs in a fresh transaction.
     *
     * @param user        the user to restore (already fetched by the caller)
     * @param restriction the expired restriction to clear (already fetched by
     *                    the caller)
     */
    void liftExpiredFor(User user, StudentRestriction restriction);

    /**
     * Delete a permanently suspended account whose retention window has passed.
     * Runs in a fresh transaction.
     *
     * @param user the user to delete (already fetched by the caller)
     */
    void deletePermanentlySuspendedFor(User user);
}