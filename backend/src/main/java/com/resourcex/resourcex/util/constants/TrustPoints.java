package com.resourcex.resourcex.util.constants;

/**
 * Central definition of all Trust Score point values, score bounds, and
 * enforcement thresholds. Keeping these in one place makes the scoring policy
 * auditable and unit-testable.
 */
public final class TrustPoints {

    private TrustPoints() {
    }

    // ── Score bounds ────────────────────────────────────────────────────────
    public static final int MIN_SCORE = 0;
    public static final int MAX_SCORE = 200;
    public static final int INITIAL_SCORE = 100;

    // ── Enforcement thresholds (score strictly below value triggers action) ──
    public static final int WARNING_THRESHOLD = 60;
    public static final int RESTRICTION_THRESHOLD = 50;
    public static final int SUSPENSION_THRESHOLD = 40;

    // ── Review rating → trust delta ──────────────────────────────────────────
    public static int forRating(int rating) {
        return switch (rating) {
            case 5 -> 3;
            case 4 -> 1;
            case 3 -> 0;
            case 2 -> -4;
            case 1 -> -8;
            default -> 0;
        };
    }

    // ── Behaviour — positive ─────────────────────────────────────────────────
    public static final int BOOKING_COMPLETED_RENTER = 2;
    public static final int BOOKING_COMPLETED_OWNER = 2;
    public static final int ON_TIME_RETURN = 2;
    public static final int NO_DISPUTE = 1;
    public static final int ACCOUNT_AGE_6_MONTHS = 5;
    public static final int ACCOUNT_AGE_12_MONTHS = 10;

    // ── Behaviour — negative ─────────────────────────────────────────────────
    public static final int LATE_RETURN = -5;
    public static final int ITEM_NOT_RETURNED = -10;
    public static final int CANCELLATION_AFTER_APPROVAL = -5;
    public static final int CONFIRMED_FALSE_REPORT = -10;
    public static final int VALID_REPORT = -10;
    public static final int ITEM_UNAVAILABLE_AFTER_APPROVAL = -5;
    public static final int POLICY_VIOLATION = -15;
    public static final int MODERATOR_WARNING = -20;
    public static final int TEMPORARY_SUSPENSION = -30;

    // ── Passive recovery ─────────────────────────────────────────────────────
    public static final int PASSIVE_RECOVERY = 2;
    public static final int PASSIVE_RECOVERY_WINDOW_DAYS = 30;

    /** Clamp any score into the valid [MIN_SCORE, MAX_SCORE] range. */
    public static int clamp(int score) {
        if (score < MIN_SCORE) return MIN_SCORE;
        if (score > MAX_SCORE) return MAX_SCORE;
        return score;
    }
}
