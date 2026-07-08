package com.resourcex.resourcex.util;

import com.resourcex.resourcex.entity.TrustLevel;

/**
 * Maps a numeric trust score to a {@link TrustLevel} tier and human-readable badge label.
 *
 * <pre>
 *   150 - 200  ELITE           120 - 149  TRUSTED        80 - 119  STANDARD
 *    60 -  79  AT_RISK          40 -  59  HIGH_RISK     below 40   SUSPENDED_RISK
 * </pre>
 */
public final class TrustLevelCalculator {

    private TrustLevelCalculator() {
    }

    public static TrustLevel levelFor(int score) {
        if (score >= 150) return TrustLevel.ELITE;
        if (score >= 120) return TrustLevel.TRUSTED;
        if (score >= 80)  return TrustLevel.STANDARD;
        if (score >= 60)  return TrustLevel.AT_RISK;
        if (score >= 40)  return TrustLevel.HIGH_RISK;
        return TrustLevel.SUSPENDED_RISK;
    }

    public static String badgeLabel(TrustLevel level) {
        return switch (level) {
            case ELITE          -> "Elite Member";
            case TRUSTED        -> "Trusted Member";
            case STANDARD       -> "Standard Member";
            case AT_RISK        -> "At-Risk Member";
            case HIGH_RISK      -> "High Risk Member";
            case SUSPENDED_RISK -> "Suspended Risk Member";
        };
    }
}
