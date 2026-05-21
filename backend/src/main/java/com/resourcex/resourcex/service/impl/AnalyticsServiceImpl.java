package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.response.AnalyticsResponse;
import com.resourcex.resourcex.service.AnalyticsService;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    @Override
    public AnalyticsResponse getAnalytics() {
        return new AnalyticsResponse();
    }
}