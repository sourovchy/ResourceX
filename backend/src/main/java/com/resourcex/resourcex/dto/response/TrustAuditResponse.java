package com.resourcex.resourcex.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrustAuditResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Integer scoreChange;
    private String description;
    private String createdAt;
}
