package com.resourcex.resourcex.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final Map<String, Long> requestCounts = new ConcurrentHashMap<>();
    private static final long RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String clientIp = getClientIp(request);
        long currentTime = System.currentTimeMillis();

        requestCounts.entrySet().removeIf(entry -> currentTime - entry.getValue() > RATE_LIMIT_WINDOW_MS);

        if (requestCounts.containsKey(clientIp)) {
            long lastRequestTime = requestCounts.get(clientIp);
            if (currentTime - lastRequestTime < RATE_LIMIT_WINDOW_MS) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Too many requests. Please wait before requesting another OTP.");
                return false;
            }
        }

        requestCounts.put(clientIp, currentTime);
        return true;
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
