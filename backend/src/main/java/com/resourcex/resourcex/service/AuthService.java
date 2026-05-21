package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.LoginRequest;
import com.resourcex.resourcex.dto.request.RegisterRequest;
import com.resourcex.resourcex.dto.response.AuthResponse;
import com.resourcex.resourcex.dto.response.CurrentUserResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    CurrentUserResponse getCurrentUser();
}
