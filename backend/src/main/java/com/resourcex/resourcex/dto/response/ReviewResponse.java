package com.resourcex.resourcex.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private Long reviewId;

    private Long bookingId;

    private UserResponse reviewer;

    private UserResponse reviewee;

    private Integer rating;

    private String comment;

    private LocalDateTime createdAt;
}