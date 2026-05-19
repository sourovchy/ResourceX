package com.thirdhand.campusvault.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class CurrencyUtil {

    private CurrencyUtil() {
    }

    public static BigDecimal calculateTotalPrice(
            BigDecimal dailyRate,
            long totalDays
    ) {
        return dailyRate.multiply(BigDecimal.valueOf(totalDays))
                .setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal calculateCommission(
            BigDecimal amount,
            double percentage
    ) {
        return amount.multiply(BigDecimal.valueOf(percentage / 100))
                .setScale(2, RoundingMode.HALF_UP);
    }
}