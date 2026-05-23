package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.PenaltyRequest;
import com.resourcex.resourcex.dto.response.PenaltyResponse;
import com.resourcex.resourcex.entity.Penalty;
import com.resourcex.resourcex.service.PenaltyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/penalties")
@RequiredArgsConstructor
public class PenaltyController {

    private final PenaltyService penaltyService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<PenaltyResponse> createPenalty(@Valid @RequestBody PenaltyRequest request) {
        PenaltyResponse response = penaltyService.createPenalty(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{penaltyId}")
   @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<PenaltyResponse> updatePenalty(
            @PathVariable Long penaltyId,
            @Valid @RequestBody PenaltyRequest request
    ) {
        return ResponseEntity.ok(penaltyService.updatePenalty(penaltyId, request));
    }

    @GetMapping("/{penaltyId}")
   @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<PenaltyResponse> getPenaltyById(@PathVariable Long penaltyId) {
        return ResponseEntity.ok(penaltyService.getPenaltyById(penaltyId));
    }

    @GetMapping
   @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<List<PenaltyResponse>> getAllPenalties() {
        return ResponseEntity.ok(penaltyService.getAllPenalties());
    }

    @GetMapping("/user/{userId}")
   @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<List<PenaltyResponse>> getPenaltiesByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(penaltyService.getPenaltiesByUserId(userId));
    }

    @GetMapping("/booking/{bookingId}")
   @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<List<PenaltyResponse>> getPenaltiesByBookingId(@PathVariable Long bookingId) {
        return ResponseEntity.ok(penaltyService.getPenaltiesByBookingId(bookingId));
    }

    @GetMapping("/dispute/{disputeId}")
   @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<List<PenaltyResponse>> getPenaltiesByDisputeId(@PathVariable Long disputeId) {
        return ResponseEntity.ok(penaltyService.getPenaltiesByDisputeId(disputeId));
    }

    @GetMapping("/status/{status}")
   @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<List<PenaltyResponse>> getPenaltiesByStatus(@PathVariable Penalty.PenaltyStatus status) {
        return ResponseEntity.ok(penaltyService.getPenaltiesByStatus(status));
    }

    @PatchMapping("/{penaltyId}/apply")
   @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<PenaltyResponse> applyPenalty(@PathVariable Long penaltyId) {
        return ResponseEntity.ok(penaltyService.applyPenalty(penaltyId));
    }

    @PatchMapping("/{penaltyId}/waive")
   @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<PenaltyResponse> waivePenalty(@PathVariable Long penaltyId) {
        return ResponseEntity.ok(penaltyService.waivePenalty(penaltyId));
    }

    @DeleteMapping("/{penaltyId}")
   @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<Void> deletePenalty(@PathVariable Long penaltyId) {
        penaltyService.deletePenalty(penaltyId);
        return ResponseEntity.noContent().build();
    }
}