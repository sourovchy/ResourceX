package com.resourcex.resourcex.security;

import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserStatus;
import com.resourcex.resourcex.exception.ForbiddenException;
import org.springframework.stereotype.Component;

/**
 * Centralized account-state gate for protected marketplace actions.
 *
 * <p>Only {@link UserStatus#ACTIVE} accounts may create items, create bookings,
 * send messages, or leave reviews. Accounts that are PENDING, REJECTED,
 * SUSPENDED, or DELETED are rejected with a status-specific reason. Admins,
 * moderators, and super-admins are ACTIVE and therefore pass.
 */
@Component
public class AccountAccessGuard {

    /**
     * Throws {@link ForbiddenException} unless the user's account is ACTIVE.
     */
    public void requireActive(User user) {
        if (user == null || user.getStatus() != UserStatus.ACTIVE) {
            throw new ForbiddenException(reasonFor(user));
        }
    }

    private String reasonFor(User user) {
        if (user == null || user.getStatus() == null) {
            return "Your account is not active.";
        }
        return switch (user.getStatus()) {
            case PENDING -> "Your account is pending admin review and cannot perform this action yet.";
            case DELETED -> "Your account has been deleted.";
            default -> "Your account is not active.";
        };
    }
}
