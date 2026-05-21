package com.resourcex.resourcex.dto.response;

import com.resourcex.resourcex.entity.UserStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long userId;

    private String studentId;

    private String name;

    private String email;

    private String phone;

    private String university;

    private String department;

    private Integer trustScore;

    private Boolean emailVerified;

    private Boolean phoneVerified;

    private UserStatus status;
    // Important for frontend auth routing
    private List<String> roles;

    // Helpful for admin/dashboard/history features
    private LocalDateTime createdAt;
}