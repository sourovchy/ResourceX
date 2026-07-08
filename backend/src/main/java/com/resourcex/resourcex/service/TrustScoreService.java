package com.resourcex.resourcex.service;

/**
 * The single authority for mutating a user's trust score. Every score change in
 * the system funnels through {@link #applyTrustChange}, which keeps
 * {@code student_profiles.trust_score} (the source of truth, clamped 0..200),
 * notifications, audit logs, and automated enforcement consistent.
 */
public interface TrustScoreService {

    /**
     * Apply a trust change to a user.
     *
     * @param userId            target user
     * @param points            signed delta (clamped into [0,200] against the current score)
     * @param reason            stable, human-readable reason
     */
    void applyTrustChange(Long userId, int points, String reason);
}
