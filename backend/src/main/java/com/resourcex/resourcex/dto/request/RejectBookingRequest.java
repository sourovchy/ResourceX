package com.resourcex.resourcex.dto.request;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RejectBookingRequest {

    @Size(max = 1000, message = "Rejection reason must not exceed 1000 characters")
    private String reason;
}
