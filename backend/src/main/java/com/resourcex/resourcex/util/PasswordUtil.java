package com.resourcex.resourcex.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class PasswordUtil {

    private static final PasswordEncoder encoder = new BCryptPasswordEncoder();

    private PasswordUtil() {
    }

    public static String hashPassword(String rawPassword) {
        return encoder.encode(rawPassword);
    }

    public static boolean matches(
            String rawPassword,
            String hashedPassword) {
        if (rawPassword == null || hashedPassword == null) {
            return false;
        }

        return encoder.matches(rawPassword, hashedPassword);
    }
}