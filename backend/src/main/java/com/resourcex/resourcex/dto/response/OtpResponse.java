package com.resourcex.resourcex.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpResponse {

    private boolean success;

    private String message;

    private String email;

    private Long expiresInSeconds;

    private Integer attemptsRemaining;
}
