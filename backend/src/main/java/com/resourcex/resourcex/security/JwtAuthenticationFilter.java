package com.resourcex.resourcex.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String COOKIE_NAME = "resourcex_token";

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();

        return HttpMethod.OPTIONS.matches(request.getMethod())
                || path.equals("/api/auth/login")
                || path.equals("/api/auth/register")
                || path.equals("/api/auth/logout")
                || path.startsWith("/api/otp/")
                || path.startsWith("/swagger-ui/")
                || path.startsWith("/v3/api-docs/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String path = request.getServletPath();

        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = extractToken(request);

        // Treat a missing OR structurally-invalid token as "no token".
        // A compact JWS has exactly two '.' separators; anything else (e.g. a
        // stale/empty/garbage cookie) is not a JWT we should try to parse, so we
        // skip it quietly instead of throwing a MalformedJwtException and logging a WARN.
        if (jwt == null || jwt.isBlank() || !isWellFormedJwt(jwt)) {
            log.debug("No valid bearer token for path: {}", path);
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String email = jwtService.extractEmail(jwt);

            if (email != null && !email.isBlank()) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                if (!userDetails.isEnabled()) {
                    // Account is suspended or disabled — reject immediately.
                    // Do NOT populate SecurityContext; the request will receive 401/403.
                    log.warn("Rejected request from suspended/disabled account: {} for path: {}", email, path);
                } else if (jwtService.isTokenValid(jwt, userDetails.getUsername())) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("Authenticated user: {} for path: {}", email, path);
                } else {
                    log.warn("Token validation failed for user: {} at path: {}", email, path);
                }
            }
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            log.debug("Expired JWT for path: {}", path);
        } catch (io.jsonwebtoken.JwtException e) {
            // Malformed / bad-signature token — typically a stale or tampered cookie.
            // Not actionable and not a server error, so log at DEBUG and stay unauthenticated.
            log.debug("Invalid JWT for path: {} — {}", path, e.getMessage());
        } catch (Exception e) {
            log.error("Error processing JWT authentication for path: {}", path, e);
        }

        filterChain.doFilter(request, response);
    }

    /** A compact JWS must contain exactly two '.' separators. */
    private boolean isWellFormedJwt(String token) {
        int dots = 0;
        for (int i = 0; i < token.length(); i++) {
            if (token.charAt(i) == '.') dots++;
        }
        return dots == 2;
    }

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return blankToNull(authHeader.substring(7).trim());
        }

        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (COOKIE_NAME.equals(cookie.getName())) {
                    return blankToNull(cookie.getValue());
                }
            }
        }

        return null;
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
