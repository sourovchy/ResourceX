package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.LoginRequest;
import com.resourcex.resourcex.dto.request.RegisterRequest;
import com.resourcex.resourcex.dto.response.AuthResponse;
import com.resourcex.resourcex.dto.response.CurrentUserResponse;
import com.resourcex.resourcex.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public CurrentUserResponse me() {
        return authService.getCurrentUser();
    }

    @PostMapping("/forgot-password")
    public org.springframework.http.ResponseEntity<?> forgotPassword(@Valid @RequestBody com.resourcex.resourcex.dto.request.ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return org.springframework.http.ResponseEntity.ok(java.util.Map.of("message", "Password reset email sent"));
    }

    @PostMapping("/reset-password")
    public org.springframework.http.ResponseEntity<?> resetPassword(@Valid @RequestBody com.resourcex.resourcex.dto.request.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return org.springframework.http.ResponseEntity.ok(java.util.Map.of("message", "Password has been reset successfully"));
    }
}