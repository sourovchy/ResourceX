package com.thirdhand.campusvault.service.impl;

import com.thirdhand.campusvault.dto.request.LoginRequest;
import com.thirdhand.campusvault.dto.request.RegisterRequest;
import com.thirdhand.campusvault.dto.response.AuthResponse;
import com.thirdhand.campusvault.entity.User;
import com.thirdhand.campusvault.exception.ConflictException;
import com.thirdhand.campusvault.exception.UnauthorizedException;
import com.thirdhand.campusvault.mapper.UserMapper;
import com.thirdhand.campusvault.repository.UserRepository;
import com.thirdhand.campusvault.security.JwtService;
import com.thirdhand.campusvault.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new ConflictException("Email already exists");
        }

        if (userRepository.existsByStudentId(request.getStudentId())) {
            throw new ConflictException("Student ID already exists");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new ConflictException("Phone number already exists");
        }

        User user = new User();
        user.setStudentId(request.getStudentId());
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setTrustScore(100);
        user.setVerified(false);

        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser.getEmail());

        return AuthResponse.builder()
                .message("Registration successful")
                .token(token)
                .user(UserMapper.toResponse(savedUser))
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());

        return AuthResponse.builder()
                .message("Login successful")
                .token(token)
                .user(UserMapper.toResponse(user))
                .build();
    }
}
