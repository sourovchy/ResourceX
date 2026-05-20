package com.thirdhand.campusvault.dto.response;

import com.thirdhand.campusvault.entity.UserStatus;
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
}