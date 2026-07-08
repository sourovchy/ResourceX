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
    
    // Reporter
    private Long reporterId;
    private String reporterName;
    private String reporterEmail;
    
    // Entity
    private String entityType;
    private Long entityId;
    private String entityName; // e.g. Item title or User name
    
    // Entity Owner/Creator (if applicable)
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    
    private String reason;

    
    private LocalDateTime createdAt;
}
