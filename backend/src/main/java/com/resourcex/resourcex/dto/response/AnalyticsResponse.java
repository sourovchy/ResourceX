package com.resourcex.resourcex.dto.response;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsResponse {

    private Map<String, Object> metrics;

    private Map<String, Object> charts;

    private Map<String, Object> trends;
}