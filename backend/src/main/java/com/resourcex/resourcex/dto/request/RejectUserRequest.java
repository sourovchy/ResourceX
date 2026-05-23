package com.resourcex.resourcex.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RejectUserRequest {

    @NotBlank(message = "Rejection reason is required")
    @Size(min = 5, max = 1000, message = "Rejection reason must be between 5 and 1000 characters")
    private String reason;
}
