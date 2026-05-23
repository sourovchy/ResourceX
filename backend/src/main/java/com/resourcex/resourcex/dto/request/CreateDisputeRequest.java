package com.resourcex.resourcex.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateDisputeRequest {

    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    @NotBlank(message = "Reason is required")
    @Size(max = 1000,message = "Reason must not exceed 1000 characters")
    private String reason;

    @Size(max = 3000,message = "Description must not exceed 1000 characters")
    private String description;
}