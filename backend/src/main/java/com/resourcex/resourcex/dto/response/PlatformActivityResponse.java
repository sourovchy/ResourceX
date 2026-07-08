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
public class PlatformActivityResponse {
    private String type;
    private Long entityId;
    private String title;
    private String description;
    private LocalDateTime timestamp;
}
