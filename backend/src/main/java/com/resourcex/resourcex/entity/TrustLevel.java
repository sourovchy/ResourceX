package com.resourcex.resourcex.entity;

/**
 * Dynamic reputation tier derived from {@code student_profiles.trust_score}.
 * Mapped by {@link com.resourcex.resourcex.util.TrustLevelCalculator}.
 */
public enum TrustLevel {
    ELITE,           // 150 - 200
    TRUSTED,         // 120 - 149
    STANDARD,        // 80 - 119
    AT_RISK,         // 60 - 79
    HIGH_RISK,       // 40 - 59
    SUSPENDED_RISK   // below 40
}
