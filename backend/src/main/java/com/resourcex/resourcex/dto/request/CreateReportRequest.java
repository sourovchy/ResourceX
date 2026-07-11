package com.resourcex.resourcex.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateReportRequest {

    private Long reportedUserId;

    private Long reportedItemId;

    @NotBlank(message = "Reason is required")
    private String reason;
}
