package com.resourcex.resourcex.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public final class PasswordUtil {

    private static final int BCRYPT_STRENGTH = 12;

    private static final PasswordEncoder ENCODER =
            new BCryptPasswordEncoder(BCRYPT_STRENGTH);

    private PasswordUtil() {
    }

    public static String hashPassword(String rawPassword) {

        validatePassword(rawPassword);

        return ENCODER.encode(rawPassword);
    }

    public static boolean matches(
            String rawPassword,
            String hashedPassword) {
        if (rawPassword == null || hashedPassword == null) {
            return false;
        }

        if (rawPassword.isBlank() || hashedPassword.isBlank()) {
            return false;
        }

        return ENCODER.matches(rawPassword, hashedPassword);
    }

    private static void validatePassword(String rawPassword) {

        if (rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException("Password must not be blank");
        }

        if (rawPassword.length() < 8) {
            throw new IllegalArgumentException(
                    "Password must be at least 8 characters long"
            );
        }
    }
}