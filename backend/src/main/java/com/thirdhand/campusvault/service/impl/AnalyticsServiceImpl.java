package com.thirdhand.campusvault.service.impl;

import com.thirdhand.campusvault.dto.response.AnalyticsResponse;
import com.thirdhand.campusvault.service.AnalyticsService;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    @Override
    public AnalyticsResponse getAnalytics() {
        return new AnalyticsResponse();
    }
}