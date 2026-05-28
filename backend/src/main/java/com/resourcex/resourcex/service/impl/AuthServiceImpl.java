package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.LoginRequest;
import com.resourcex.resourcex.dto.request.RegisterRequest;
import com.resourcex.resourcex.dto.response.AuthResponse;
import com.resourcex.resourcex.dto.response.CurrentUserResponse;
import com.resourcex.resourcex.entity.PendingUser;
import com.resourcex.resourcex.entity.PendingUserStatus;
import com.resourcex.resourcex.entity.StudentProfile;
import com.resourcex.resourcex.entity.University;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserStatus;
import com.resourcex.resourcex.exception.BadRequestException;
import com.resourcex.resourcex.exception.ConflictException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.exception.UnauthorizedException;
import com.resourcex.resourcex.mapper.UserMapper;
import com.resourcex.resourcex.repository.PendingUserRepository;
import com.resourcex.resourcex.repository.StudentProfileRepository;
import com.resourcex.resourcex.repository.UniversityRepository;
import com.resourcex.resourcex.repository.UserRoleRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.security.JwtService;
import com.resourcex.resourcex.service.AuthService;
import com.resourcex.resourcex.service.EmailService;
import com.resourcex.resourcex.service.AuditLogService;
import com.resourcex.resourcex.entity.AuditLog;
import com.resourcex.resourcex.util.constants.RoleConstants;
import com.resourcex.resourcex.util.PhoneUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PendingUserRepository pendingUserRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UniversityRepository universityRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final com.resourcex.resourcex.repository.FileMetadataRepository fileMetadataRepository;
    private final com.resourcex.resourcex.service.OtpService otpService;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        request.setPhone(PhoneUtil.normalizePhone(request.getPhone()));

        if (userRepository.existsByEmailIgnoreCase(request.getEmail())
                || pendingUserRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new ConflictException("Email already exists");
        }

        if (studentProfileRepository.existsByStudentId(request.getStudentId())
                || pendingUserRepository.existsByStudentId(request.getStudentId())) {
            throw new ConflictException("Student ID already exists");
        }

        if (studentProfileRepository.existsByPhone(request.getPhone())
                || pendingUserRepository.existsByPhone(request.getPhone())) {
            throw new ConflictException("Phone number already exists");
        }

        University university = resolveUniversity(request.getUniversity());

        if (request.getIdCardFileId() == null) {
            throw new BadRequestException("ID Card file is required");
        }

        com.resourcex.resourcex.entity.FileMetadata file = fileMetadataRepository.findById(request.getIdCardFileId())
                .orElseThrow(() -> new ResourceNotFoundException("ID Card file not found"));

        if (file.getPurpose() != com.resourcex.resourcex.entity.FilePurpose.ID_CARD) {
            throw new BadRequestException("Invalid file purpose for ID card");
        }

        PendingUser pendingUser = PendingUser.builder()
                .studentId(request.getStudentId())
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .university(university)
                .department(request.getDepartment())
                .idCardFileId(request.getIdCardFileId())
                .status(PendingUserStatus.REGISTERED)
                .build();

        pendingUserRepository.save(pendingUser);

        auditLogService.logAction(
                AuditLog.ActorType.SYSTEM,
                null,
                "USER_REGISTER_PENDING",
                "PENDING_USER",
                pendingUser.getPendingUserId(),
                AuditLog.AuditOutcome.SUCCESS,
                "User registration request created for " + request.getEmail()
        );

        return AuthResponse.builder()
                .message("Registration successful. Your request is pending review.")
                .token(null)
                .user(null)
                .roles(List.of())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseGet(() -> {
                    var pendingOpt = pendingUserRepository.findByEmailIgnoreCase(request.getEmail());
                    if (pendingOpt.isPresent()) {
                        PendingUser pending = pendingOpt.get();
                        if (pending.getStatus() == PendingUserStatus.REGISTERED) {
                            throw new UnauthorizedException("Email not verified. Please verify your email.");
                        } else if (pending.getStatus() == PendingUserStatus.PENDING_REVIEW || pending.getStatus() == PendingUserStatus.EMAIL_VERIFIED) {
                            throw new UnauthorizedException("Your account is pending admin review.");
                        } else if (pending.getStatus() == PendingUserStatus.REJECTED) {
                            throw new UnauthorizedException("Your registration was rejected.");
                        }
                    }
                    throw new UnauthorizedException("Invalid email or password");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            if (user.getStatus() == UserStatus.SUSPENDED) {
                throw new UnauthorizedException("Account is suspended.");
            }
            if (user.getStatus() == UserStatus.BANNED) {
                throw new UnauthorizedException("Account is banned.");
            }
            throw new UnauthorizedException("Account is not active.");
        }

        List<String> roles = resolveRoles(user);
        String token = jwtService.generateToken(user.getUserId(), user.getEmail(), roles);
        StudentProfile profile = studentProfileRepository.findByUser(user).orElse(null);

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                user.getUserId(),
                "USER_LOGIN",
                "USER",
                user.getUserId(),
                AuditLog.AuditOutcome.SUCCESS,
                "User logged in successfully"
        );

        return AuthResponse.builder()
                .message("Login successful")
                .token(token)
                .user(UserMapper.toResponse(
                        user,
                        userRoleRepository.findAllByUser(user),
                        profile))
                .roles(roles)
                .build();
    }

    @Override
    public CurrentUserResponse getCurrentUser() {
        User user = resolveCurrentUser();
        StudentProfile profile = studentProfileRepository.findByUser(user).orElse(null);

        return CurrentUserResponse.builder()
                .user(UserMapper.toResponse(
                        user,
                        userRoleRepository.findAllByUser(user),
                        profile))
                .roles(resolveRoles(user))
                .build();
    }

    @Override
    @Transactional
    public void forgotPassword(com.resourcex.resourcex.dto.request.ForgotPasswordRequest request) {
        com.resourcex.resourcex.dto.request.OtpRequest otpRequest = new com.resourcex.resourcex.dto.request.OtpRequest(request.getEmail());
        otpService.sendOtp(otpRequest, com.resourcex.resourcex.entity.TokenPurpose.PASSWORD_RESET);
    }

    @Override
    @Transactional
    public void resetPassword(com.resourcex.resourcex.dto.request.ResetPasswordRequest request) {
        com.resourcex.resourcex.dto.request.OtpVerifyRequest otpVerifyRequest = new com.resourcex.resourcex.dto.request.OtpVerifyRequest(request.getEmail(), request.getOtp());
        
        // This validates the OTP and marks it as USED
        otpService.verifyOtp(otpVerifyRequest, com.resourcex.resourcex.entity.TokenPurpose.PASSWORD_RESET);
        
        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new com.resourcex.resourcex.exception.ResourceNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditLogService.logAction(
                AuditLog.ActorType.USER,
                user.getUserId(),
                "USER_PASSWORD_RESET",
                "USER",
                user.getUserId(),
                AuditLog.AuditOutcome.SUCCESS,
                "User password reset successfully via OTP"
        );
    }

    private University resolveUniversity(String universityName) {
        if (universityName == null || universityName.isBlank()) {
            return null;
        }

        return universityRepository.findByName(universityName.trim())
                .orElseGet(() -> universityRepository.save(
                        University.builder()
                                .name(universityName.trim())
                                .build()));
    }

    private User resolveCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new UnauthorizedException("Authenticated user not found");
        }

        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new UnauthorizedException("Authenticated user not found"));
    }

    private List<String> resolveRoles(User user) {
        List<String> roles = userRoleRepository.findAllByUser(user).stream()
                .map(userRole -> userRole.getRole().getName())
                .toList();

        return roles.isEmpty() ? List.of(RoleConstants.ROLE_USER) : roles;
    }
}

