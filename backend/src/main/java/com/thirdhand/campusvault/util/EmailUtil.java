package com.thirdhand.campusvault.util;

import java.util.regex.Pattern;

public class EmailUtil {

    private static final String EMAIL_REGEX =
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";

    private static final Pattern PATTERN =
            Pattern.compile(EMAIL_REGEX);

    private EmailUtil() {
    }

    public static boolean isValidEmail(String email) {

        if (email == null || email.isBlank()) {
            return false;
        }

        return PATTERN.matcher(email).matches();
    }
}