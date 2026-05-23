package com.resourcex.resourcex.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {

    private boolean success;

    private String message;

    private String token;

    private String tokenType;

    private UserResponse user;

    private List<String> roles;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    public static AuthResponse success(
            String message,
            String token,
            UserResponse user,
            List<String> roles
    ) {
        return AuthResponse.builder()
                .success(true)
                .message(message)
                .token(token)
                .tokenType("Bearer")
                .user(user)
                .roles(roles)
                .build();
    }
}
