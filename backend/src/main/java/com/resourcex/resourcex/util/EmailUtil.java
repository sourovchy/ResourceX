package com.resourcex.resourcex.util;

import java.util.regex.Pattern;

public final class EmailUtil {

    private static final String EMAIL_REGEX =
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";

    private static final Pattern PATTERN = Pattern.compile(EMAIL_REGEX);

    private EmailUtil() {
    }

    public static boolean isValidEmail(String email) {

        if (email == null || email.isBlank()) {
            return false;
        }

        String normalizedEmail = email.trim();

        if (normalizedEmail.length() > 254) {
            return false;
        }

        return PATTERN.matcher(normalizedEmail).matches();
    }

    public static String normalizeEmail(String email) {

        if (!isValidEmail(email)) {
            throw new IllegalArgumentException("Invalid email address");
        }

        return email.trim().toLowerCase();
    }
}