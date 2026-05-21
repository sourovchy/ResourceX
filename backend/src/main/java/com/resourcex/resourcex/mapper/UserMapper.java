package com.resourcex.resourcex.mapper;

import com.resourcex.resourcex.dto.response.UserResponse;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserRole;

import java.util.Collections;
import java.util.List;

public class UserMapper {

    private UserMapper() {
    }

    public static UserResponse toResponse(User user) {

        return toResponse(user, Collections.emptyList());
    }

    public static UserResponse toResponse(
            User user,
            List<UserRole> userRoles
    ) {

        if (user == null) {
            return null;
        }

        List<String> roles = userRoles == null
                ? Collections.emptyList()
                : userRoles.stream()
                  .map(UserRole::getRole)
                  .filter(role -> role != null && role.getName() != null)
                  .map(role -> role.getName())
                  .toList();

        return UserResponse.builder()
                .userId(user.getUserId())
                .studentId(user.getStudentId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .university(user.getUniversity())
                .department(user.getDepartment())
                .trustScore(user.getTrustScore())
                .emailVerified(user.getEmailVerified())
                .phoneVerified(user.getPhoneVerified())
                .status(user.getStatus())
                .roles(roles)
                .createdAt(user.getCreatedAt())
                .build();
    }
}