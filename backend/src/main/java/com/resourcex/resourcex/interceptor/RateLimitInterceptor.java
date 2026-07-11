package com.resourcex.resourcex.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * Sliding-window rate limiter.
 * Limits are per-IP per path prefix, configurable via PATH_LIMITS.
 * Auth endpoints: login 10/min, register/forgot/reset 3/min.
 * OTP endpoints: 1/min.
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final long WINDOW_MS = 60_000L;

    private static final Map<String, Integer> PATH_LIMITS = new java.util.LinkedHashMap<>();

    static {
        PATH_LIMITS.put("/api/auth/login", 10);
        PATH_LIMITS.put("/api/auth/register", 3);
        PATH_LIMITS.put("/api/auth/forgot-password", 3);
        PATH_LIMITS.put("/api/auth/reset-password", 3);
        PATH_LIMITS.put("/api/otp/", 1);
        // Upload allows anonymous STUDENT_ID submissions during registration —
        // throttle so unauthenticated clients cannot fill the disk.
        PATH_LIMITS.put("/api/files/upload", 10);
    }

    private final Map<String, Deque<Long>> timestamps = new ConcurrentHashMap<>();

    /**
     * Whether to trust the {@code X-Forwarded-For} header for client identity.
     * MUST stay false unless the app sits behind a trusted reverse proxy that
     * overwrites this header. When true on a directly-exposed app, an attacker
     * can rotate X-Forwarded-For to mint a fresh rate-limit bucket per request,
     * defeating brute-force protection on login / OTP / password-reset entirely.
     */
    @Value("${app.security.trust-forwarded-for:false}")
    private boolean trustForwardedFor;

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler) throws Exception {

        String path = request.getRequestURI();
        int limit = resolveLimit(path);

        if (limit == Integer.MAX_VALUE) {
            return true;
        }

        String key = getClientIp(request) + ":" + path;
        long now = System.currentTimeMillis();
        long windowStart = now - WINDOW_MS;

        Deque<Long> window = timestamps.computeIfAbsent(key, k -> new ConcurrentLinkedDeque<>());
        window.removeIf(t -> t < windowStart);

        if (window.size() >= limit) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Too many requests. Please try again later.\"}");
            return false;
        }

        window.addLast(now);
        return true;
    }

    private int resolveLimit(String path) {
        for (Map.Entry<String, Integer> entry : PATH_LIMITS.entrySet()) {
            if (path.startsWith(entry.getKey())) {
                return entry.getValue();
            }
        }
        return Integer.MAX_VALUE;
    }

    private String getClientIp(HttpServletRequest request) {
        // Only honour X-Forwarded-For when explicitly configured to trust a fronting proxy.
        // Otherwise the header is attacker-controlled and would defeat rate limiting.
        if (trustForwardedFor) {
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                return forwarded.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }
}
