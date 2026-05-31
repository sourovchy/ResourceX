package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.UpdateUserRequest;
import com.resourcex.resourcex.dto.response.UserResponse;
import com.resourcex.resourcex.dto.response.UserSearchResponse;
import com.resourcex.resourcex.entity.StudentProfile;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserRole;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.exception.UnauthorizedException;
import com.resourcex.resourcex.mapper.UserMapper;
import com.resourcex.resourcex.repository.FileMetadataRepository;
import com.resourcex.resourcex.repository.StudentProfileRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.UserService;
import com.resourcex.resourcex.util.constants.RoleConstants;
import com.resourcex.resourcex.util.PhoneUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final com.resourcex.resourcex.repository.UserRoleRepository userRoleRepository;
    private final com.resourcex.resourcex.service.FileStorageService fileStorageService;
    private final FileMetadataRepository fileMetadataRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UserSearchResponse> searchUsers(String query, int limit) {
        String q = query == null ? "" : query.trim();
        if (q.length() < 2) {
            return List.of();
        }

        User current = resolveCurrentUser();
        int capped = Math.min(Math.max(limit, 1), 20);

        return userRepository
                .searchActiveUsers(q, current.getUserId(), PageRequest.of(0, capped))
                .stream()
                .map(u -> {
                    StudentProfile sp = studentProfileRepository.findByUser(u).orElse(null);
                    return UserSearchResponse.builder()
                            .userId(u.getUserId())
                            .name(u.getName())
                            .email(u.getEmail())
                            .avatarUrl(u.getAvatarUrl())
                            .department(sp != null ? sp.getDepartment() : null)
                            .trustScore(sp != null ? sp.getTrustScore() : null)
                            .build();
                })
                .toList();
    }

    @Override
    public UserResponse getCurrentUser() {
        User user = resolveCurrentUser();
        List<UserRole> userRoles = userRoleRepository.findAllByUser(user);
        StudentProfile studentProfile = studentProfileRepository.findByUser(user).orElse(null);
        return UserMapper.toResponse(user, userRoles, studentProfile);
    }

    @Override
    public UserResponse getUserById(Long userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    List<UserRole> userRoles = userRoleRepository.findAllByUser(user);
                    StudentProfile studentProfile = studentProfileRepository.findByUser(user).orElse(null);
                    return UserMapper.toResponse(user, userRoles, studentProfile);
                })
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        List<String> excludedRoles = List.of(
            RoleConstants.ROLE_ADMIN,
            RoleConstants.ROLE_MODERATOR,
            RoleConstants.ROLE_SUPER_ADMIN
        );
        return userRepository.findAllExcludingRoles(excludedRoles, pageable)
                .map(user -> {
                    List<UserRole> userRoles = userRoleRepository.findAllByUser(user);
                    StudentProfile studentProfile = studentProfileRepository.findByUser(user).orElse(null);
                    return UserMapper.toResponse(user, userRoles, studentProfile);
                });
    }

    @Override
    @Transactional
    public UserResponse updateCurrentUser(UpdateUserRequest request) {
        User user = resolveCurrentUser();
        applyUpdate(user, request, true);
        User savedUser = userRepository.save(user);
        List<UserRole> userRoles = userRoleRepository.findAllByUser(savedUser);
        StudentProfile studentProfile = studentProfileRepository.findByUser(savedUser).orElse(null);
        return UserMapper.toResponse(savedUser, userRoles, studentProfile);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        applyUpdate(user, request, false);
        return UserMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void changePassword(com.resourcex.resourcex.dto.request.ChangePasswordRequest request) {
        User user = resolveCurrentUser();
        
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new com.resourcex.resourcex.exception.BadRequestException("Incorrect current password");
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private User resolveCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new UnauthorizedException("Authenticated user not found");
        }

        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new UnauthorizedException("Authenticated user not found"));
    }

    private void applyUpdate(User user, UpdateUserRequest request, boolean isCurrentUserUpdate) {
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }

        boolean emailOrPhoneChanged = false;

        if (request.getEmail() != null && !request.getEmail().isBlank() && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            // Check if user is student
            boolean isStudent = userRoleRepository.findAllByUser(user).stream()
                    .anyMatch(role -> role.getRole().getName().equalsIgnoreCase(RoleConstants.ROLE_USER));
            if (isStudent) {
                throw new com.resourcex.resourcex.exception.ForbiddenException("Students are not allowed to change their email address");
            }
            if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
                throw new com.resourcex.resourcex.exception.ConflictException("Email is already in use");
            }
            user.setEmail(request.getEmail().trim());
            emailOrPhoneChanged = true;
        }

        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            String normalizedPhone = PhoneUtil.normalizePhone(request.getPhone().trim());
            java.util.Optional<StudentProfile> studentProfileOpt = studentProfileRepository.findByUser(user);
            if (studentProfileOpt.isPresent()) {
                StudentProfile studentProfile = studentProfileOpt.get();
                if (!normalizedPhone.equals(studentProfile.getPhone())) {
                    studentProfile.setPhone(normalizedPhone);
                    studentProfileRepository.save(studentProfile);
                    emailOrPhoneChanged = true;
                }
            }
        }
        
        if (emailOrPhoneChanged && isCurrentUserUpdate) {
            if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
                throw new com.resourcex.resourcex.exception.BadRequestException("Current password is required to change email or phone number");
            }
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new com.resourcex.resourcex.exception.BadRequestException("Incorrect current password");
            }
        }

        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
            String newAvatarUrl = request.getAvatarUrl().trim();
            // Delete old avatar file when replacing with a new one
            if (user.getAvatarUrl() != null && !user.getAvatarUrl().equals(newAvatarUrl)) {
                try {
                    String oldUrl = user.getAvatarUrl();
                    String storedName = oldUrl.substring(oldUrl.lastIndexOf('/') + 1);
                    // Delete directly via the authenticated principal
                    Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
                    if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                        fileStorageService.deleteFile(storedName, (org.springframework.security.core.userdetails.UserDetails) principal);
                    } else {
                        // Fallback: delete file metadata and physical file directly
                        fileMetadataRepository.findByStoredName(storedName).ifPresent(metadata -> {
                            try {
                                java.nio.file.Path filePath = java.nio.file.Paths.get("uploads").toAbsolutePath().normalize().resolve(storedName);
                                java.nio.file.Files.deleteIfExists(filePath);
                            } catch (Exception ex) {
                                log.warn("Failed to delete old avatar file from disk: {}", storedName, ex);
                            }
                            fileMetadataRepository.delete(metadata);
                        });
                    }
                } catch (Exception e) {
                    log.warn("Failed to delete old avatar: {}", user.getAvatarUrl(), e);
                }
            }
            user.setAvatarUrl(newAvatarUrl);
        }
    }
}
