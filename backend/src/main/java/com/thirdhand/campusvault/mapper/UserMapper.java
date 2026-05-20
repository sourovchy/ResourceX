package com.thirdhand.campusvault.mapper;

import com.thirdhand.campusvault.dto.response.UserResponse;
import com.thirdhand.campusvault.entity.User;

public class UserMapper {

    private UserMapper() {
    }

    public static UserResponse toResponse(User user) {

        if (user == null) {
            return null;
        }

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
                .build();
    }
}