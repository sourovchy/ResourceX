package com.resourcex.resourcex.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SuspendUserRequest {

    @NotBlank(message = "Suspension duration is required")
    private String duration;

    @NotBlank(message = "Suspension reason is required")
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;
}
