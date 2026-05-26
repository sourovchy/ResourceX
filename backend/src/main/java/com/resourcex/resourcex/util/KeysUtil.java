package com.resourcex.resourcex.util;

import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Objects;

public final class KeysUtil {

    private KeysUtil() {
    }

    private static final int MIN_SECRET_LENGTH = 32;

    public static SecretKey getSigningKey(String secretKey) {

        Objects.requireNonNull(secretKey, "Secret key must not be null");

        String normalizedSecretKey = secretKey.trim();

        if (normalizedSecretKey.isBlank()) {
            throw new IllegalArgumentException("Secret key must not be blank");
        }

        if (normalizedSecretKey.length() < MIN_SECRET_LENGTH) {
            throw new IllegalArgumentException(
                    "Secret key must be at least 32 characters long"
            );
        }

        return Keys.hmacShaKeyFor(
                normalizedSecretKey.getBytes(StandardCharsets.UTF_8)
        );
    }
}