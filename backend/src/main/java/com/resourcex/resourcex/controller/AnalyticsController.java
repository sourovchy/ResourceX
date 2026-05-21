package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.response.AnalyticsResponse;
import com.resourcex.resourcex.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AnalyticsResponse> getAnalytics() {

        return ResponseEntity.ok(
                analyticsService.getAnalytics()
        );
    }
}