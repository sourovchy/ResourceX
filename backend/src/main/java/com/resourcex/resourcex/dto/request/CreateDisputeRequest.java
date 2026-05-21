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

    @NotNull
    private Long bookingId;

    @NotBlank
    @Size(max = 1000)
    private String reason;

    @Size(max = 3000)
    private String description;
}