package com.resourcex.resourcex.dto.response;

import lombok.*;

/**
 * Public-safe user summary used when searching for someone to message.
 * Intentionally omits private fields (phone, student id, suspension data).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchResponse {

    private Long userId;
    private String name;
    private String email;
    private String avatarUrl;
    private String department;
    private Integer trustScore;
}
