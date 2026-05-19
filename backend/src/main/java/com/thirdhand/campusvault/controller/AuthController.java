package com.thirdhand.campusvault.controller;

import com.thirdhand.campusvault.dto.request.LoginRequest;
import com.thirdhand.campusvault.dto.request.RegisterRequest;
import com.thirdhand.campusvault.dto.response.AuthResponse;
import com.thirdhand.campusvault.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request
    ) {
        return authService.login(request);
    }
}