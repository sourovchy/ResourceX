package com.resourcex.resourcex.dto.request;

import com.resourcex.resourcex.entity.SuspensionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SuspendUserRequest {

    @NotNull(message = "Suspension type is required")
    private SuspensionType suspensionType;

    @NotBlank(message = "Suspension reason is required")
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;
}
