package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.LoginRequest;
import com.resourcex.resourcex.dto.request.RegisterRequest;
import com.resourcex.resourcex.dto.response.AuthResponse;
import com.resourcex.resourcex.dto.response.CurrentUserResponse;

import com.resourcex.resourcex.entity.StudentProfile;
import com.resourcex.resourcex.entity.University;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserStatus;
import com.resourcex.resourcex.exception.BadRequestException;
import com.resourcex.resourcex.exception.ConflictException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.exception.UnauthorizedException;
import com.resourcex.resourcex.mapper.UserMapper;

import com.resourcex.resourcex.entity.Role;
import com.resourcex.resourcex.repository.StudentProfileRepository;
import com.resourcex.resourcex.repository.UniversityRepository;
import com.resourcex.resourcex.repository.RoleRepository;
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
import com.resourcex.resourcex.repository.StudentRestrictionRepository;
import com.resourcex.resourcex.entity.StudentRestriction;
import java.time.LocalDateTime;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    private final StudentProfileRepository studentProfileRepository;
    private final UniversityRepository universityRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final com.resourcex.resourcex.repository.FileMetadataRepository fileMetadataRepository;
    private final com.resourcex.resourcex.service.OtpService otpService;
    private final AuditLogService auditLogService;
    private final StudentRestrictionRepository studentRestrictionRepository;
    private final com.resourcex.resourcex.service.AvatarUrlResolver avatarUrlResolver;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        request.setPhone(PhoneUtil.normalizePhone(request.getPhone()));

        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new ConflictException("Email already exists");
        }

        if (studentProfileRepository.existsByStudentId(request.getStudentId())) {
            throw new ConflictException("Student ID already exists");
        }

        if (studentProfileRepository.existsByPhone(request.getPhone())) {
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

        // Every user has exactly one role; new registrants are ROLE_USER (still PENDING approval).
        Role roleUser = roleRepository.findByNameIgnoreCase(RoleConstants.ROLE_USER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleConstants.ROLE_USER).build()));

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .status(UserStatus.PENDING)
                .role(roleUser)
                .build();
        User savedUser = userRepository.save(user);

        StudentProfile profile = StudentProfile.builder()
                .user(savedUser)
                .studentId(request.getStudentId())
                .phone(request.getPhone())
                .university(university)
                .department(request.getDepartment())
                .idCardFileId(request.getIdCardFileId())
                .trustScore(100)
                .emailVerified(false)
                .phoneVerified(false)
                .build();
        studentProfileRepository.save(profile);

        auditLogService.logAction(
                AuditLog.ActorType.SYSTEM,
                null,
                "USER_REGISTER_PENDING",
                "USER",
                savedUser.getUserId(),
                AuditLog.AuditOutcome.SUCCESS,
                "User registration request created for " + request.getEmail()
        );

        return AuthResponse.builder()
                .success(true)
                .message("Registration successful. Your request is pending review.")
                .token(null)
                .user(null)
                .roles(List.of())
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
            if (user.getStatus() == UserStatus.PENDING) {
                StudentProfile profile = studentProfileRepository.findByUser(user).orElse(null);
                if (profile != null && !profile.getEmailVerified()) {
                    throw new UnauthorizedException("Email not verified. Please verify your email.");
                } else {
                    throw new UnauthorizedException("Your account is pending admin review.");
                }
            }
            if (user.getStatus() == UserStatus.DELETED) {
                StudentProfile profile = studentProfileRepository.findByUser(user).orElse(null);
                if (profile != null && profile.getRejectionReason() != null) {
                    throw new UnauthorizedException("Your registration was rejected.");
                }
                throw new UnauthorizedException("Account is deleted.");
            }
            throw new UnauthorizedException("Account is not active.");
        }

        // Check suspension dynamically via restriction record
        StudentRestriction restriction = studentRestrictionRepository.findByStudentUserId(user.getUserId()).orElse(null);
        if (restriction != null && restriction.getSuspendedAt() != null) {
            LocalDateTime until = restriction.getSuspendedUntil();
            if (until == null || LocalDateTime.now().isBefore(until)) {
                throw new UnauthorizedException("Account is suspended.");
            }
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

        com.resourcex.resourcex.dto.response.UserResponse userResponse = UserMapper.toResponse(user, profile);
        if (userResponse != null) {
            userResponse.setAvatarUrl(avatarUrlResolver.resolve(user.getAvatarFileId()));
        }

        return AuthResponse.builder()
                .success(true)
                .message("Login successful")
                .token(token)
                .tokenType("Bearer")
                .user(userResponse)
                .roles(roles)
                .build();
    }

    @Override
    public CurrentUserResponse getCurrentUser() {
        User user = resolveCurrentUser();
        StudentProfile profile = studentProfileRepository.findByUser(user).orElse(null);

        com.resourcex.resourcex.dto.response.UserResponse userResponse = UserMapper.toResponse(user, profile);
        if (userResponse != null) {
            userResponse.setAvatarUrl(avatarUrlResolver.resolve(user.getAvatarFileId()));
        }

        return CurrentUserResponse.builder()
                .user(userResponse)
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
        return (user.getRole() != null && user.getRole().getName() != null)
                ? List.of(user.getRole().getName())
                : List.of(RoleConstants.ROLE_USER);
    }
}

