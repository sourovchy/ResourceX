package com.resourcex.resourcex.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurrentUserResponse {

    private UserResponse user;

    private List<String> roles;
}
