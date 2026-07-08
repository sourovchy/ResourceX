package com.resourcex.resourcex.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    /** MDC key surfaced in the log pattern (logging.pattern.level) for request correlation. */
    private static final String REQUEST_ID = "requestId";
    /** Standard inbound header to honour so a proxy/client-supplied id flows through. */
    private static final String REQUEST_ID_HEADER = "X-Request-Id";

    private static final Set<String> SENSITIVE_PATHS = Set.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/forgot-password",
            "/api/auth/reset-password"
    );

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String requestId = resolveRequestId(request);
        MDC.put(REQUEST_ID, requestId);
        response.setHeader(REQUEST_ID_HEADER, requestId);

        try {
            String path = request.getRequestURI();
            String logPath = SENSITIVE_PATHS.contains(path) ? path : withQueryString(request);

            log.info(
                    "Incoming Request: {} {} from {}",
                    request.getMethod(),
                    logPath,
                    request.getRemoteAddr()
            );

            filterChain.doFilter(request, response);
        } finally {
            // Always clear so a pooled worker thread never leaks the id into the next request.
            MDC.remove(REQUEST_ID);
        }
    }

    /** Honour a caller-supplied X-Request-Id, otherwise mint a short one. */
    private String resolveRequestId(HttpServletRequest request) {
        String supplied = request.getHeader(REQUEST_ID_HEADER);
        if (supplied != null && !supplied.isBlank()) {
            return supplied.trim();
        }
        return UUID.randomUUID().toString().substring(0, 8);
    }

    private String withQueryString(HttpServletRequest request) {
        String query = request.getQueryString();
        String path = request.getRequestURI();
        return query == null ? path : path + "?" + query;
    }
}
