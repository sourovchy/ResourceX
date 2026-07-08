package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.CreatePrivilegedUserRequest;
import com.resourcex.resourcex.dto.response.UserResponse;
import com.resourcex.resourcex.entity.Role;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserStatus;
import com.resourcex.resourcex.exception.ConflictException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.mapper.UserMapper;
import com.resourcex.resourcex.repository.RoleRepository;
import com.resourcex.resourcex.repository.StudentProfileRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.AuditLogService;
import com.resourcex.resourcex.entity.AuditLog;
import com.resourcex.resourcex.service.SuperAdminService;
import com.resourcex.resourcex.util.constants.RoleConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SuperAdminServiceImpl implements SuperAdminService {

        private final UserRepository userRepository;
        private final RoleRepository roleRepository;
        private final StudentProfileRepository studentProfileRepository;
        private final PasswordEncoder passwordEncoder;
        private final AuditLogService auditLogService;

        @Override
        public UserResponse promoteToAdmin(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                Role adminRole = roleRepository.findByNameIgnoreCase(RoleConstants.ROLE_ADMIN)
                                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

                user.setRole(adminRole);
                userRepository.save(user);

                auditLogService.logAction(
                                AuditLog.ActorType.USER,
                                getCurrentUserId(),
                                "USER_PROMOTED",
                                "USER",
                                userId,
                                AuditLog.AuditOutcome.SUCCESS,
                                "User promoted to ADMIN"
                );

                return UserMapper.toResponse(user, studentProfileRepository.findByUser(user).orElse(null));
        }

        @Override
        public UserResponse demoteFromAdmin(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                if (isSuperAdmin(user)) {
                        throw new ConflictException("Cannot demote a super admin account");
                }

                Role moderatorRole = roleRepository.findByNameIgnoreCase(RoleConstants.ROLE_MODERATOR)
                                .orElseGet(() -> roleRepository
                                                .save(Role.builder().name(RoleConstants.ROLE_MODERATOR).build()));

                user.setRole(moderatorRole);
                userRepository.save(user);

                auditLogService.logAction(
                                AuditLog.ActorType.USER,
                                getCurrentUserId(),
                                "USER_DEMOTED",
                                "USER",
                                userId,
                                AuditLog.AuditOutcome.SUCCESS,
                                "User demoted from ADMIN to MODERATOR"
                );

                return UserMapper.toResponse(user, studentProfileRepository.findByUser(user).orElse(null));
        }

        @Override
        public UserResponse createAdmin(CreatePrivilegedUserRequest request) {
                return createPrivilegedUser(request, RoleConstants.ROLE_ADMIN);
        }

        @Override
        public UserResponse createModerator(CreatePrivilegedUserRequest request) {
                return createPrivilegedUser(request, RoleConstants.ROLE_MODERATOR);
        }

        @Override
        public void deletePrivilegedUser(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                if (user.getUserId().equals(getCurrentUserId())) {
                        throw new ConflictException("You cannot delete your own super admin account");
                }

                if (isSuperAdmin(user)) {
                        throw new ConflictException("Super admin accounts cannot be deleted");
                }

                studentProfileRepository.findByUser(user)
                                .ifPresent(studentProfileRepository::delete);

                userRepository.delete(user);

                auditLogService.logAction(
                                AuditLog.ActorType.USER,
                                getCurrentUserId(),
                                "PRIVILEGED_USER_DELETED",
                                "USER",
                                userId,
                                AuditLog.AuditOutcome.SUCCESS,
                                "Privileged user deleted"
                );
        }

        @Override
        public Page<UserResponse> getAllPrivilegedUsers(Pageable pageable) {
                List<String> privilegedRoles = List.of(
                                RoleConstants.ROLE_ADMIN,
                                RoleConstants.ROLE_MODERATOR,
                                RoleConstants.ROLE_SUPER_ADMIN
                );
                return userRepository.findAllByRoleNames(privilegedRoles, pageable)
                                .map(user -> UserMapper.toResponse(
                                                user,
                                                studentProfileRepository.findByUser(user).orElse(null)));
        }

        private boolean isSuperAdmin(User user) {
                return user.getRole() != null
                                && RoleConstants.ROLE_SUPER_ADMIN.equalsIgnoreCase(user.getRole().getName());
        }

        private Long getCurrentUserId() {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication == null || authentication.getName() == null) {
                        throw new ConflictException("Unable to determine authenticated user");
                }
                return userRepository.findByEmailIgnoreCase(authentication.getName())
                                .orElseThrow(() -> new ConflictException("Authenticated user not found"))
                                .getUserId();
        }

        private UserResponse createPrivilegedUser(CreatePrivilegedUserRequest request, String roleName) {
                if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
                        throw new ConflictException("Email already exists");
                }

                Role role = roleRepository.findByNameIgnoreCase(roleName)
                                .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));

                User user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .status(UserStatus.ACTIVE)
                                .role(role)
                                .build();

                User savedUser = userRepository.save(user);

                auditLogService.logAction(
                                AuditLog.ActorType.USER,
                                getCurrentUserId(),
                                "PRIVILEGED_USER_CREATED",
                                "USER",
                                savedUser.getUserId(),
                                AuditLog.AuditOutcome.SUCCESS,
                                "Created privileged user with role " + roleName
                );

                return UserMapper.toResponse(savedUser, null);
        }
}
