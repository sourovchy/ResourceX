package com.resourcex.resourcex.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public class DateUtil {

    private DateUtil() {
    }

    public static long calculateDaysBetween(
            LocalDate startDate,
            LocalDate endDate
    ) {
        return ChronoUnit.DAYS.between(startDate, endDate);
    }

    public static boolean isPastDate(LocalDate date) {
        return date.isBefore(LocalDate.now());
    }

    public static boolean isPastDateTime(LocalDateTime dateTime) {
        return dateTime.isBefore(LocalDateTime.now());
    }

    public static LocalDateTime now() {
        return LocalDateTime.now();
    }
}