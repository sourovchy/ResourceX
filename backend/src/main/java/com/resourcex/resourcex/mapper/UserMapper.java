package com.resourcex.resourcex.mapper;

import com.resourcex.resourcex.dto.response.StudentProfileResponse;
import com.resourcex.resourcex.dto.response.UserResponse;
import com.resourcex.resourcex.entity.StudentProfile;
import com.resourcex.resourcex.entity.User;

import java.util.Collections;
import java.util.List;

/**
 * Maps {@link User} to {@link UserResponse}. Role is the user's single role.
 *
 * <p>Avatar URL and suspension details are NOT resolved here (they require the files
 * table and the student's restriction record). Callers that need them resolve and set
 * them on the returned response — see {@code AvatarUrlResolver} and
 * {@code StudentRestrictionManager}. {@code avatarFileId} is always populated so clients
 * can build the URL directly if needed.
 */
public class UserMapper {

    private UserMapper() {
    }

    public static UserResponse toResponse(User user) {
        StudentProfile profile = null;
        try {
            profile = user.getStudentProfile();
        } catch (Exception e) {
            // Lazy initialization or no session, ignore
        }
        return toResponse(user, profile);
    }

    public static UserResponse toResponse(User user, StudentProfile studentProfile) {
        if (user == null) {
            return null;
        }

        List<String> roles = (user.getRole() != null && user.getRole().getName() != null)
                ? List.of(user.getRole().getName())
                : Collections.emptyList();

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
                        .rejectionReason(studentProfile.getRejectionReason())
                        .build();

        return UserResponse.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .status(user.getStatus())
                .studentProfile(profile)
                .roles(roles)
                .createdAt(user.getCreatedAt())
                .avatarFileId(user.getAvatarFileId())
                .build();
    }
}
