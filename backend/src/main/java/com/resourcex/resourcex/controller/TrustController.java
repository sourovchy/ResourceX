package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.response.TrustEventResponse;
import com.resourcex.resourcex.entity.TrustEvent;
import com.resourcex.resourcex.service.TrustService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trust")
@RequiredArgsConstructor
public class TrustController {

    private final TrustService trustService;

    @PostMapping("/events")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TrustEventResponse> createTrustEvent(
            @RequestParam Long userId,
            @RequestParam TrustEvent.TrustEventType eventType,
            @RequestParam Integer points,
            @RequestParam String reason
    ) {
        return ResponseEntity.ok(trustService.createTrustEvent(userId, eventType, points, reason));
    }

    @GetMapping("/events")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TrustEventResponse>> getAllTrustEvents() {
        return ResponseEntity.ok(trustService.getAllTrustEvents());
    }

    @GetMapping("/events/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TrustEventResponse>> getTrustEventsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(trustService.getTrustEventsByUserId(userId));
    }

    @GetMapping("/score/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getTrustScore(@PathVariable Long userId) {
        return ResponseEntity.ok(trustService.getTrustScore(userId));
    }

    @PostMapping("/penalty-impact")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> applyPenaltyImpact(
            @RequestParam Long userId,
            @RequestParam Long penaltyId,
            @RequestParam Integer deductionPoints,
            @RequestParam(required = false) String reason
    ) {
        trustService.applyPenaltyImpact(userId, penaltyId, deductionPoints, reason);
        return ResponseEntity.ok().build();
    }
}