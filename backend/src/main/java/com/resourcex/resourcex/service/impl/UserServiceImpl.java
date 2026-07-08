package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.UpdateUserRequest;
import com.resourcex.resourcex.dto.response.UserResponse;
import com.resourcex.resourcex.dto.response.UserSearchResponse;
import com.resourcex.resourcex.entity.StudentProfile;
import com.resourcex.resourcex.entity.User;
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
    private final com.resourcex.resourcex.service.FileStorageService fileStorageService;
    private final FileMetadataRepository fileMetadataRepository;
    private final com.resourcex.resourcex.service.AvatarUrlResolver avatarUrlResolver;
    private final com.resourcex.resourcex.service.StudentRestrictionManager restrictionManager;

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
                            .avatarUrl(avatarUrlResolver.resolve(u.getAvatarFileId()))
                            .department(sp != null ? sp.getDepartment() : null)
                            .trustScore(sp != null ? sp.getTrustScore() : null)
                            .build();
                })
                .toList();
    }

    @Override
    public UserResponse getCurrentUser() {
        User user = resolveCurrentUser();
        StudentProfile studentProfile = studentProfileRepository.findByUser(user).orElse(null);
        return enrich(UserMapper.toResponse(user, studentProfile), user);
    }

    /** Fills the response fields that UserMapper leaves blank: avatar URL + suspension details. */
    private UserResponse enrich(UserResponse response, User user) {
        if (response == null) {
            return null;
        }
        response.setAvatarUrl(avatarUrlResolver.resolve(user.getAvatarFileId()));
        restrictionManager.find(user.getUserId()).ifPresent(r -> {
            response.setSuspensionReason(r.getSuspensionReason());
            response.setSuspendedAt(r.getSuspendedAt());
            response.setSuspendedUntil(r.getSuspendedUntil());
            response.setScheduledDeletionAt(r.getScheduledDeletionAt());
        });
        return response;
    }

    @Override
    public UserResponse getUserById(Long userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    StudentProfile studentProfile = studentProfileRepository.findByUser(user).orElse(null);
                    UserResponse response = enrich(UserMapper.toResponse(user, studentProfile), user);

                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    boolean isPrivileged = auth != null && auth.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || 
                                           a.getAuthority().equals("ROLE_MODERATOR") || 
                                           a.getAuthority().equals("ROLE_SUPER_ADMIN"));
                    boolean isSelf = auth != null && auth.getName().equals(user.getEmail());
                    
                    if (!isPrivileged && !isSelf) {
                        response.setEmail(null);
                        if (response.getStudentProfile() != null) {
                            response.getStudentProfile().setPhone(null);
                            response.getStudentProfile().setStudentId(null);
                            response.getStudentProfile().setIdCardFileId(null);
                        }
                        response.setSuspensionReason(null);
                        response.setSuspendedAt(null);
                        response.setSuspendedUntil(null);
                        response.setScheduledDeletionAt(null);
                    } else if (response.getStudentProfile() != null
                            && response.getStudentProfile().getIdCardFileId() != null) {
                        // Privileged/self viewer: resolve the ID card file id to its stored
                        // name so the client can load it via GET /api/files/{storedName}.
                        fileMetadataRepository.findById(response.getStudentProfile().getIdCardFileId())
                                .ifPresent(meta -> response.getStudentProfile()
                                        .setIdCardDataUrl(meta.getStoredName()));
                    }

                    return response;
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
                    StudentProfile studentProfile = studentProfileRepository.findByUser(user).orElse(null);
                    return enrich(UserMapper.toResponse(user, studentProfile), user);
                });
    }

    @Override
    @Transactional
    public UserResponse updateCurrentUser(UpdateUserRequest request) {
        User user = resolveCurrentUser();
        applyUpdate(user, request, true);
        User savedUser = userRepository.save(user);
        StudentProfile studentProfile = studentProfileRepository.findByUser(savedUser).orElse(null);
        return enrich(UserMapper.toResponse(savedUser, studentProfile), savedUser);
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
            throw new com.resourcex.resourcex.exception.ForbiddenException("Changing email address is not allowed for security reasons");
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
            // Request carries the servable URL "/api/files/{storedName}"; resolve it to the file id,
            // since avatars now live in the files table (single source of truth).
            String newAvatarUrl = request.getAvatarUrl().trim();
            String newStoredName = newAvatarUrl.substring(newAvatarUrl.lastIndexOf('/') + 1);
            Long newFileId = fileMetadataRepository.findByStoredName(newStoredName)
                    .map(com.resourcex.resourcex.entity.FileMetadata::getFileId)
                    .orElse(null);

            Long oldFileId = user.getAvatarFileId();
            // Delete the previous avatar file when replacing it with a different one.
            if (oldFileId != null && !oldFileId.equals(newFileId)) {
                try {
                    fileMetadataRepository.findById(oldFileId).ifPresent(metadata -> {
                        try {
                            java.nio.file.Path filePath = java.nio.file.Paths.get("uploads")
                                    .toAbsolutePath().normalize().resolve(metadata.getStoredName());
                            java.nio.file.Files.deleteIfExists(filePath);
                        } catch (Exception ex) {
                            log.warn("Failed to delete old avatar file from disk: {}", metadata.getStoredName(), ex);
                        }
                        fileMetadataRepository.delete(metadata);
                    });
                } catch (Exception e) {
                    log.warn("Failed to delete old avatar file id {}", oldFileId, e);
                }
            }
            user.setAvatarFileId(newFileId);
        }
    }
}
