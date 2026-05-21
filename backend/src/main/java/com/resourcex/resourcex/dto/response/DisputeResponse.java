package com.resourcex.resourcex.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisputeResponse {

    private Long disputeId;

    private Long bookingId;

    private UserResponse reporter;

    private String status;

    private LocalDateTime createdAt;
}