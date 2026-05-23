package com.resourcex.resourcex.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String queryString = request.getQueryString();
        String path = request.getRequestURI();
        String fullPath = queryString == null ? path : path + "?" + queryString;

        log.info(
                "Incoming Request: {} {} from {}",
                request.getMethod(),
                fullPath,
                request.getRemoteAddr()
        );

        filterChain.doFilter(request, response);
    }
}