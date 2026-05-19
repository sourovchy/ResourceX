package com.thirdhand.campusvault.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsResponse {

    private Object metrics;

    private Object charts;

    private Object trends;
}