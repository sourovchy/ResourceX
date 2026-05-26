package com.resourcex.resourcex.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Objects;

public final class DateUtil {

    private static final String START_DATE = "Start date";
    private static final String END_DATE = "End date";
    private static final String DATE = "Date";
    private static final String DATE_TIME = "Date time";

    private DateUtil() {
    }

    public static long calculateDaysBetween(
            LocalDate startDate,
            LocalDate endDate
    ) {
        validateLocalDate(startDate, START_DATE);
        validateLocalDate(endDate, END_DATE);

        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date must not be before start date");
        }

        return ChronoUnit.DAYS.between(startDate, endDate);
    }

    public static boolean isPastDate(LocalDate date) {
        validateLocalDate(date, DATE);
        return date.isBefore(LocalDate.now());
    }

    public static boolean isPastDateTime(LocalDateTime dateTime) {
        validateLocalDateTime(dateTime, DATE_TIME);
        return dateTime.isBefore(LocalDateTime.now());
    }

    public static LocalDate today() {
        return LocalDate.now();
    }

    public static LocalDateTime now() {
        return LocalDateTime.now();
    }

    private static void validateLocalDate(LocalDate date, String fieldName) {
        Objects.requireNonNull(date, fieldName + " must not be null");
    }

    private static void validateLocalDateTime(LocalDateTime dateTime, String fieldName) {
        Objects.requireNonNull(dateTime, fieldName + " must not be null");
    }
}