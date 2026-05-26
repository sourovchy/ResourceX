package com.resourcex.resourcex.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;

@Service
public class JwtService {

    public static final String ROLES_CLAIM = "roles";
    public static final String USER_ID_CLAIM = "userId";

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @PostConstruct
    public void validateConfiguration() {
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException("JWT secret must not be blank");
        }

        if (secretKey.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "JWT secret must be at least 32 bytes long for HS256"
            );
        }

        if (jwtExpiration <= 0) {
            throw new IllegalStateException("JWT expiration must be greater than zero");
        }
    }

    public String generateToken(String email) {
        return generateToken(new HashMap<>(), email);
    }

    public String generateToken(String email, List<String> roles) {
        return generateToken(null, email, roles);
    }

    public String generateToken(Long userId, String email, List<String> roles) {
        Map<String, Object> claims = new HashMap<>();
        claims.put(ROLES_CLAIM, roles == null ? List.of() : roles);
        if (userId != null) {
            claims.put(USER_ID_CLAIM, userId);
        }

        return generateToken(claims, email);
    }

    public String generateToken(Map<String, Object> extraClaims, String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email must not be blank");
        }

        String normalizedEmail = normalize(email);

        return Jwts.builder()
                .claims(extraClaims == null ? new HashMap<>() : extraClaims)
                .subject(normalizedEmail)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public List<String> extractRoles(String token) {
        return extractClaim(token, claims -> {
            Object roles = claims.get(ROLES_CLAIM);
            if (!(roles instanceof List<?> roleList)) {
                return List.of();
            }

            return roleList.stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .toList();
        });
    }

    public Long extractUserId(String token) {
        return extractClaim(token, claims -> {
            Object value = claims.get(USER_ID_CLAIM);
            if (value instanceof Number number) {
                return number.longValue();
            }
            if (value instanceof String stringValue && !stringValue.isBlank()) {
                return Long.valueOf(stringValue);
            }
            return null;
        });
    }

    public boolean isTokenValid(String token, String email) {
        if (token == null || token.isBlank() || email == null || email.isBlank()) {
            return false;
        }

        try {
            String tokenEmail = normalize(extractEmail(token));
            String expectedEmail = normalize(email);

            return Objects.equals(tokenEmail, expectedEmail) && !isTokenExpired(token);
        } catch (Exception ex) {
            return false;
        }
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    private String normalize(String value) {
        return value == null ? null : value.trim().toLowerCase();
    }
}
