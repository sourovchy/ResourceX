package com.resourcex.resourcex.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

import java.util.Date;

public class JwtUtil {

    private JwtUtil() {
    }

    public static String extractEmail(
            String token,
            String secretKey
    ) {
        return extractClaims(token, secretKey).getSubject();
    }

    public static Date extractExpiration(
            String token,
            String secretKey
    ) {
        return extractClaims(token, secretKey).getExpiration();
    }

    public static boolean isTokenExpired(
            String token,
            String secretKey
    ) {
        return extractExpiration(token, secretKey)
                .before(new Date());
    }

    public static Claims extractClaims(
            String token,
            String secretKey
    ) {
        return Jwts.parser()
                .verifyWith(KeysUtil.getSigningKey(secretKey))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}