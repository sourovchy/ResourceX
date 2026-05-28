package com.resourcex.resourcex.entity;

/**
 * Duration categories for user suspensions.
 * PERMANENT suspensions trigger a scheduled deletion after the configured retention period.
 */
public enum SuspensionType {
    ONE_DAY,
    SEVEN_DAYS,
    THIRTY_DAYS,
    PERMANENT
}
