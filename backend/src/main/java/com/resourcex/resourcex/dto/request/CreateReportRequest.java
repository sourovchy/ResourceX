package com.resourcex.resourcex.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateReportRequest {
    @NotNull(message = "Entity type is required")
    private String entityType; // "ITEM", "USER", "BOOKING"

    @NotNull(message = "Entity ID is required")
    private Long entityId;

    @NotBlank(message = "Reason is required")
    private String reason;
}
