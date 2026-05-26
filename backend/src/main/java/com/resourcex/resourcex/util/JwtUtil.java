package com.resourcex.resourcex.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import java.util.Date;
import java.util.Objects;

public final class JwtUtil {

        private JwtUtil() {
        }

        private static final String TOKEN = "Token";
        private static final String SECRET_KEY = "Secret key";

        public static String extractEmail(
                        String token,
                        String secretKey) {
                return extractClaims(token, secretKey).getSubject();
        }

        public static Date extractExpiration(
                        String token,
                        String secretKey) {
                return extractClaims(token, secretKey).getExpiration();
        }

        public static boolean isTokenExpired(
                        String token,
                        String secretKey) {
                return extractExpiration(token, secretKey)
                                .before(new Date());
        }

        public static Claims extractClaims(
                        String token,
                        String secretKey) {

                validateInputs(token, secretKey);

                return Jwts.parser()
                                .verifyWith(KeysUtil.getSigningKey(secretKey.trim()))
                                .build()
                                .parseSignedClaims(token.trim())
                                .getPayload();
        }

        private static void validateInputs(
                        String token,
                        String secretKey) {

                Objects.requireNonNull(token, TOKEN + " must not be null");
                Objects.requireNonNull(secretKey, SECRET_KEY + " must not be null");

                if (token.isBlank()) {
                        throw new IllegalArgumentException("Token must not be blank");
                }

                if (secretKey.isBlank()) {
                        throw new IllegalArgumentException("Secret key must not be blank");
                }
        }
}