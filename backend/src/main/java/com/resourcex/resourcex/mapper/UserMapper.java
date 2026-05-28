package com.resourcex.resourcex.mapper;

import com.resourcex.resourcex.dto.response.StudentProfileResponse;
import com.resourcex.resourcex.dto.response.UserResponse;
import com.resourcex.resourcex.entity.StudentProfile;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.entity.UserRole;

import java.util.Collections;
import java.util.List;

public class UserMapper {

    private UserMapper() {
    }

    public static UserResponse toResponse(User user) {
        return toResponse(user, Collections.emptyList(), null);
    }

    public static UserResponse toResponse(
            User user,
            List<UserRole> userRoles) {
        return toResponse(user, userRoles, null);
    }

    public static UserResponse toResponse(
            User user,
            List<UserRole> userRoles,
            StudentProfile studentProfile) {

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

        StudentProfileResponse profile = studentProfile == null
                ? null
                : StudentProfileResponse.builder()
                        .studentId(studentProfile.getStudentId())
                        .phone(studentProfile.getPhone())
                        .university(studentProfile.getUniversity() != null ? studentProfile.getUniversity().getName()
                                : null)
                        .department(studentProfile.getDepartment())
                        .idCardFileId(studentProfile.getIdCardFileId())
                        .trustScore(studentProfile.getTrustScore())
                        .emailVerified(studentProfile.getEmailVerified())
                        .phoneVerified(studentProfile.getPhoneVerified())
                        .build();

        return UserResponse.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .status(user.getStatus())
                .studentProfile(profile)
                .roles(roles)
                .createdAt(user.getCreatedAt())
                .avatarUrl(user.getAvatarUrl())
                .suspensionType(user.getSuspensionType())
                .suspensionReason(user.getSuspensionReason())
                .suspendedAt(user.getSuspendedAt())
                .suspendedUntil(user.getSuspendedUntil())
                .scheduledDeletionAt(user.getScheduledDeletionAt())
                .build();
    }
}