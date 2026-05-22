package com.resourcex.resourcex.dto.response;

import com.resourcex.resourcex.dto.response.StudentProfileResponse;
import com.resourcex.resourcex.entity.UserStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long userId;

    private String name;

    private String email;

    private UserStatus status;

    private StudentProfileResponse studentProfile;

    // Important for frontend auth routing
    private List<String> roles;

    // Helpful for admin/dashboard/history features
    private LocalDateTime createdAt;
}