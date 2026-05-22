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

        Role adminRole = roleRepository.findByNameIgnoreCase(RoleConstants.ROLE_ADMIN)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        userRoleRepository.findByUserAndRole(user, adminRole)
                .ifPresent(userRoleRepository::delete);

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
