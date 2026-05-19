package com.thirdhand.campusvault.dto.response;

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

    private Integer trustScore;

    private Boolean verified;
}