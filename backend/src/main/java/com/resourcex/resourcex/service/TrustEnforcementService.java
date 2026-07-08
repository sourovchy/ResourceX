package com.resourcex.resourcex.service;

import com.resourcex.resourcex.entity.StudentProfile;
import com.resourcex.resourcex.entity.User;

public interface TrustEnforcementService {

    /**
     * Recompute and apply automated enforcement for a user based on their current
     * trust score: warning (&lt;60), restriction (&lt;50), and escalating automatic
     * suspension (&lt;40). Idempotent — safe to call after every score change.
     * Self-heals flags when the score recovers above a threshold.
     */
    void evaluate(User user, StudentProfile profile, int oldScore);
}
