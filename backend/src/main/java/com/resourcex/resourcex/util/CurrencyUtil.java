package com.resourcex.resourcex.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class CurrencyUtil {

    private static final int MONEY_SCALE = 2;

    private CurrencyUtil() {
    }

    public static BigDecimal calculateTotalPrice(
            BigDecimal dailyRate,
            long totalDays
    ) {
        validateMoneyAmount(dailyRate, "Daily rate");
        if (totalDays <= 0) {
            throw new IllegalArgumentException("Total days must be greater than zero");
        }

        return dailyRate.multiply(BigDecimal.valueOf(totalDays))
                .setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }

    public static BigDecimal calculateCommission(
            BigDecimal amount,
            double percentage
    ) {
        return calculateCommission(amount, BigDecimal.valueOf(percentage));
    }

    public static BigDecimal calculateCommission(
            BigDecimal amount,
            BigDecimal percentage
    ) {
        validateMoneyAmount(amount, "Amount");
        if (percentage == null) {
            throw new IllegalArgumentException("Percentage must not be null");
        }
        if (percentage.compareTo(BigDecimal.ZERO) < 0 || percentage.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("Percentage must be between 0 and 100");
        }

        return amount.multiply(percentage)
                .divide(BigDecimal.valueOf(100), MONEY_SCALE, RoundingMode.HALF_UP);
    }

    private static void validateMoneyAmount(BigDecimal value, String fieldName) {
        if (value == null) {
            throw new IllegalArgumentException(fieldName + " must not be null");
        }
        if (value.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(fieldName + " must not be negative");
        }
    }
}