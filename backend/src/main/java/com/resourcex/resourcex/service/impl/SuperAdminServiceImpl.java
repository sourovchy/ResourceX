package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.CreatePrivilegedUserRequest;
import com.resourcex.resourcex.dto.response.UserResponse;
import com.resourcex.resourcex.entity.Role;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserRole;
import com.resourcex.resourcex.entity.UserStatus;
import com.resourcex.resourcex.exception.ConflictException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.mapper.UserMapper;
import com.resourcex.resourcex.repository.RoleRepository;
import com.resourcex.resourcex.repository.StudentProfileRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.repository.UserRoleRepository;
import com.resourcex.resourcex.service.SuperAdminService;
import com.resourcex.resourcex.util.constants.RoleConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class SuperAdminServiceImpl implements SuperAdminService {

        private final UserRepository userRepository;
        private final RoleRepository roleRepository;
        private final UserRoleRepository userRoleRepository;
        private final StudentProfileRepository studentProfileRepository;
        private final PasswordEncoder passwordEncoder;

        @Override
        public UserResponse promoteToAdmin(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                Role adminRole = roleRepository.findByNameIgnoreCase(RoleConstants.ROLE_ADMIN)
                                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

                Optional<UserRole> existingRole = userRoleRepository.findByUserAndRole(user, adminRole);
                if (existingRole.isEmpty()) {
                        UserRole userRole = UserRole.builder()
                                        .user(user)
                                        .role(adminRole)
                                        .build();
                        userRoleRepository.save(userRole);
                }

                return UserMapper.toResponse(
                                user,
                                userRoleRepository.findAllByUser(user),
                                studentProfileRepository.findByUser(user).orElse(null));
        }

        @Override
        public UserResponse demoteFromAdmin(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                if (isSuperAdmin(user)) {
                        throw new ConflictException("Cannot demote a super admin account");
                }

                Role adminRole = roleRepository.findByNameIgnoreCase(RoleConstants.ROLE_ADMIN)
                                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

                Role moderatorRole = roleRepository.findByNameIgnoreCase(RoleConstants.ROLE_MODERATOR)
                                .orElseGet(() -> roleRepository
                                                .save(Role.builder().name(RoleConstants.ROLE_MODERATOR).build()));

                userRoleRepository.findByUserAndRole(user, adminRole)
                                .ifPresent(userRoleRepository::delete);

                if (userRoleRepository.findByUserAndRole(user, moderatorRole).isEmpty()) {
                        userRoleRepository.save(UserRole.builder()
                                        .user(user)
                                        .role(moderatorRole)
                                        .build());
                }

                return UserMapper.toResponse(
                                user,
                                userRoleRepository.findAllByUser(user),
                                studentProfileRepository.findByUser(user).orElse(null));
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

                List<UserRole> userRoles = userRoleRepository.findAllByUser(user);
                if (!userRoles.isEmpty()) {
                        userRoleRepository.deleteAll(userRoles);
                }

                studentProfileRepository.findByUser(user)
                                .ifPresent(studentProfileRepository::delete);

                userRepository.delete(user);
        }

        @Override
        public List<UserResponse> getAllPrivilegedUsers() {
                return userRepository.findAll().stream()
                                .filter(u -> {
                                        List<String> roleNames = userRoleRepository.findAllByUser(u).stream()
                                                        .map(ur -> ur.getRole().getName())
                                                        .toList();
                                        return roleNames.contains(RoleConstants.ROLE_ADMIN)
                                                        || roleNames.contains(RoleConstants.ROLE_MODERATOR)
                                                        || roleNames.contains(RoleConstants.ROLE_SUPER_ADMIN);
                                })
                                .map(user -> UserMapper.toResponse(
                                                user,
                                                userRoleRepository.findAllByUser(user),
                                                studentProfileRepository.findByUser(user).orElse(null)))
                                .toList();
        }

        private boolean isSuperAdmin(User user) {
                return userRoleRepository.findAllByUser(user).stream()
                                .map(ur -> ur.getRole().getName())
                                .anyMatch(RoleConstants.ROLE_SUPER_ADMIN::equalsIgnoreCase);
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
                                .build();

                User savedUser = userRepository.save(user);
                userRoleRepository.save(UserRole.builder()
                                .user(savedUser)
                                .role(role)
                                .build());

                return UserMapper.toResponse(
                                savedUser,
                                userRoleRepository.findAllByUser(savedUser),
                                null);
        }
}
