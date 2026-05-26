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
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<TrustEventResponse> createTrustEvent(
            @RequestParam Long userId,
            @RequestParam TrustEvent.TrustEventType eventType,
            @RequestParam Integer points,
            @RequestParam String reason
    ) {
        return ResponseEntity.ok(trustService.createTrustEvent(userId, eventType, points, reason));
    }

    @GetMapping("/events")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<List<TrustEventResponse>> getAllTrustEvents() {
        return ResponseEntity.ok(trustService.getAllTrustEvents());
    }

    @GetMapping("/events/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<List<TrustEventResponse>> getTrustEventsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(trustService.getTrustEventsByUserId(userId));
    }

    @GetMapping("/score/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<Long> getTrustScore(@PathVariable Long userId) {
        return ResponseEntity.ok(trustService.getTrustScore(userId));
    }

    @PostMapping("/penalty-impact")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<Void> applyPenaltyImpact(
            @RequestParam Long userId,
            @RequestParam Long penaltyId,
            @RequestParam Integer deductionPoints,
            @RequestParam(required = false) String reason
    ) {
        trustService.applyPenaltyImpact(userId, penaltyId, deductionPoints, reason);
        return ResponseEntity.ok().build();
    }

    // --- Merged from AdminTrustController ---

    @GetMapping("/admin/users")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<List<com.resourcex.resourcex.dto.response.AdminTrustUserResponse>> getAllUsers() {
        return ResponseEntity.ok(trustService.getAllUsersForTrustAdmin());
    }

    @GetMapping("/admin/audit-log")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<List<com.resourcex.resourcex.dto.response.TrustAuditResponse>> getAuditLog() {
        return ResponseEntity.ok(trustService.getTrustAuditLog());
    }

    public static class AdjustTrustRequest {
        public Integer change;
        public String reason;
    }

    @PatchMapping("/admin/{userId}/adjust")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<Void> adjustTrust(@PathVariable Long userId, @RequestBody AdjustTrustRequest req) {
        if (req == null || req.change == null || req.change == 0) {
            throw new com.resourcex.resourcex.exception.ResourceNotFoundException("Invalid change value");
        }
        trustService.adjustTrust(userId, req.change, req.reason);
        return ResponseEntity.ok().build();
    }
}