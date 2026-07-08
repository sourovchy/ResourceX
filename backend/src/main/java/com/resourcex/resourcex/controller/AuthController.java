package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.LoginRequest;
import com.resourcex.resourcex.dto.request.RegisterRequest;
import com.resourcex.resourcex.dto.response.AuthResponse;
import com.resourcex.resourcex.dto.response.CurrentUserResponse;
import com.resourcex.resourcex.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String COOKIE_NAME = "resourcex_token";

    private final AuthService authService;

    @Value("${app.cookie.same-site:Lax}")
    private String cookieSameSite;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);
        String token = authResponse.getToken();
        if (token != null && !token.isBlank()) {
            response.addHeader(HttpHeaders.SET_COOKIE, buildTokenCookie(token, 86400));
        }
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildTokenCookie("", 0));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public CurrentUserResponse me() {
        return authService.getCurrentUser();
    }

    @PostMapping("/forgot-password")
    public org.springframework.http.ResponseEntity<?> forgotPassword(
            @Valid @RequestBody com.resourcex.resourcex.dto.request.ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return org.springframework.http.ResponseEntity.ok(java.util.Map.of("message", "Password reset email sent"));
    }

    @PostMapping("/reset-password")
    public org.springframework.http.ResponseEntity<?> resetPassword(
            @Valid @RequestBody com.resourcex.resourcex.dto.request.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return org.springframework.http.ResponseEntity.ok(java.util.Map.of("message", "Password has been reset successfully"));
    }

    private String buildTokenCookie(String value, int maxAge) {
        StringBuilder cookie = new StringBuilder()
                .append(COOKIE_NAME).append("=").append(value)
                .append("; Path=/")
                .append("; Max-Age=").append(maxAge)
                .append("; HttpOnly")
                .append("; SameSite=").append(cookieSameSite);
        // SameSite=None requires the Secure attribute or browsers reject the cookie.
        if (cookieSecure || "None".equalsIgnoreCase(cookieSameSite)) {
            cookie.append("; Secure");
        }
        return cookie.toString();
    }
}
