package com.thirdhand.campusvault.service;

import com.thirdhand.campusvault.dto.request.LoginRequest;
import com.thirdhand.campusvault.dto.request.RegisterRequest;
import com.thirdhand.campusvault.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
