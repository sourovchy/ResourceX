package com.thirdhand.campusvault.service.impl;

import com.thirdhand.campusvault.dto.request.LoginRequest;
import com.thirdhand.campusvault.dto.request.RegisterRequest;
import com.thirdhand.campusvault.dto.response.AuthResponse;
import com.thirdhand.campusvault.entity.PendingUser;
import com.thirdhand.campusvault.entity.User;
import com.thirdhand.campusvault.entity.UserStatus;
import com.thirdhand.campusvault.exception.ConflictException;
import com.thirdhand.campusvault.exception.UnauthorizedException;
import com.thirdhand.campusvault.mapper.UserMapper;
import com.thirdhand.campusvault.repository.PendingUserRepository;
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
    private final PendingUserRepository pendingUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmailIgnoreCase(request.getEmail())
                || pendingUserRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new ConflictException("Email already exists");
        }

        if (userRepository.existsByStudentId(request.getStudentId())
                || pendingUserRepository.existsByStudentId(request.getStudentId())) {
            throw new ConflictException("Student ID already exists");
        }

        if (userRepository.existsByPhone(request.getPhone())
                || pendingUserRepository.existsByPhone(request.getPhone())) {
            throw new ConflictException("Phone number already exists");
        }

        PendingUser pendingUser = PendingUser.builder()
                .studentId(request.getStudentId())
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .university(request.getUniversity())
                .department(request.getDepartment())
                .idCardDataUrl(request.getIdCardDataUrl())
                .status(UserStatus.PENDING_VERIFICATION)
                .emailVerified(false)
                .phoneVerified(false)
                .build();

        pendingUserRepository.save(pendingUser);

        return AuthResponse.builder()
                .message("Registration successful. Please verify your email and wait for approval.")
                .token(null)
                .user(null)
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            if (user.getStatus() == UserStatus.PENDING_VERIFICATION) {
                throw new UnauthorizedException("Account not verified yet.");
            }
            if (user.getStatus() == UserStatus.PENDING_APPROVAL) {
                throw new UnauthorizedException("Account is waiting for admin approval.");
            }
            if (user.getStatus() == UserStatus.REJECTED) {
                throw new UnauthorizedException("Account registration was rejected.");
            }
            if (user.getStatus() == UserStatus.SUSPENDED) {
                throw new UnauthorizedException("Account is suspended.");
            }
            if (user.getStatus() == UserStatus.BANNED) {
                throw new UnauthorizedException("Account is banned.");
            }
            throw new UnauthorizedException("Account is not active.");
        }

        String token = jwtService.generateToken(user.getEmail());

        return AuthResponse.builder()
                .message("Login successful")
                .token(token)
                .user(UserMapper.toResponse(user))
                .build();
    }
}