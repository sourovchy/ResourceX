package com.resourcex.resourcex.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String message;

    private String token;

    private UserResponse user;
}