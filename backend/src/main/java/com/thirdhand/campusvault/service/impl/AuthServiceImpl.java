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

import java.util.Optional;

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

        if (userRepository.existsByEmailIgnoreCase(request.getEmail()) || 
            pendingUserRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new ConflictException("Email already exists");
        }

        if (userRepository.existsByStudentId(request.getStudentId()) ||
            pendingUserRepository.existsByStudentId(request.getStudentId())) {
            throw new ConflictException("Student ID already exists");
        }

        if (userRepository.existsByPhone(request.getPhone()) ||
            pendingUserRepository.existsByPhone(request.getPhone())) {
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
                .message("Registration successful. Please verify your email.")
                .user(null) // Don't return user info yet
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        // Check permanent users first
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(request.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
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

        // Check pending users
        Optional<PendingUser> pendingOpt = pendingUserRepository.findByEmailIgnoreCase(request.getEmail());
        if (pendingOpt.isPresent()) {
            PendingUser pending = pendingOpt.get();
            if (!passwordEncoder.matches(request.getPassword(), pending.getPassword())) {
                throw new UnauthorizedException("Invalid email or password");
            }

            if (pending.getStatus() == UserStatus.PENDING_VERIFICATION) {
                throw new UnauthorizedException("Account not verified. Please verify your email.");
            } else if (pending.getStatus() == UserStatus.PENDING_APPROVAL) {
                throw new UnauthorizedException("Account verified but awaiting admin approval.");
            } else if (pending.getStatus() == UserStatus.REJECTED) {
                throw new UnauthorizedException("Account registration was rejected. Please contact support.");
            }
        }

        throw new UnauthorizedException("Invalid email or password");
    }
}
