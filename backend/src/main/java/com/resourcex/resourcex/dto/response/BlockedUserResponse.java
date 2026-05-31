package com.resourcex.resourcex.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockedUserResponse {

    private Long userId;
    private String name;
    private String email;
    private LocalDateTime blockedAt;
}
