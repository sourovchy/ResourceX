package com.resourcex.resourcex.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminTrustUserResponse {
    private Long userId;
    private String name;
    private String email;
    private Integer trustScore;
    private String trustLevel;
    private Integer suspensionCount;
}
