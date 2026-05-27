package com.resourcex.resourcex.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Slf4j
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

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

        String path = request.getRequestURI();
        String logPath = SENSITIVE_PATHS.contains(path) ? path : withQueryString(request);

        log.info(
                "Incoming Request: {} {} from {}",
                request.getMethod(),
                logPath,
                request.getRemoteAddr()
        );

        filterChain.doFilter(request, response);
    }

    private String withQueryString(HttpServletRequest request) {
        String query = request.getQueryString();
        String path = request.getRequestURI();
        return query == null ? path : path + "?" + query;
    }
}
