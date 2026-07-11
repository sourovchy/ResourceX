package com.resourcex.resourcex.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private Long reportId;

    // Reporter (nullable — reporter may have been deleted)
    private Long reporterId;
    private String reporterName;
    private String reporterEmail;

    // Reported user (nullable)
    private Long reportedUserId;
    private String reportedUserName;
    private String reportedUserEmail;

    // Reported item (nullable)
    private Long reportedItemId;
    private String reportedItemTitle;
    private String reportedItemOwnerName;

    private String reason;
    private String status;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
}
