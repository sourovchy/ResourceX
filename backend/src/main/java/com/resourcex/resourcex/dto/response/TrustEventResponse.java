package com.resourcex.resourcex.dto.response;

import com.resourcex.resourcex.entity.TrustEvent;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrustEventResponse {

    private Long trustEventId;

    private Long userId;

    private String userName;

    private TrustEvent.TrustEventType eventType;

    private Integer points;

    private String reason;

    private LocalDateTime createdAt;
}
