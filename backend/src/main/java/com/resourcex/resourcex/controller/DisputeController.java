package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.CreateDisputeRequest;
import com.resourcex.resourcex.dto.request.ResolutionRequest;
import com.resourcex.resourcex.dto.response.DisputeResponse;
import com.resourcex.resourcex.entity.Dispute.DisputeStatus;
import com.resourcex.resourcex.service.DisputeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/disputes")
@RequiredArgsConstructor
public class DisputeController {

    private final DisputeService disputeService;

    @PostMapping
    public DisputeResponse createDispute(
            @Valid @RequestBody CreateDisputeRequest request
    ) {
        return disputeService.createDispute(request);
    }

    @GetMapping("/{disputeId}")
    public DisputeResponse getDisputeById(
            @PathVariable Long disputeId
    ) {
        return disputeService.getDisputeById(disputeId);
    }

    @GetMapping
    public List<DisputeResponse> getAllDisputes() {
        return disputeService.getAllDisputes();
    }

    @GetMapping("/user/{userId}")
    public List<DisputeResponse> getDisputesByUser(
            @PathVariable Long userId
    ) {
        return disputeService.getDisputesByUser(userId);
    }

    @GetMapping("/status")
    public List<DisputeResponse> getDisputesByStatus(
            @RequestParam DisputeStatus status
    ) {
        return disputeService.getDisputesByStatus(status);
    }

    @PatchMapping("/{disputeId}/resolve")
    public DisputeResponse resolveDispute(
            @PathVariable Long disputeId,
            @Valid @RequestBody ResolutionRequest request
    ) {
        return disputeService.resolveDispute(disputeId, request);
    }

    @PatchMapping("/{disputeId}/close")
    public DisputeResponse closeDispute(
            @PathVariable Long disputeId
    ) {
        return disputeService.closeDispute(disputeId);
    }

    @DeleteMapping("/{disputeId}")
    public void deleteDispute(
            @PathVariable Long disputeId
    ) {
        disputeService.deleteDispute(disputeId);
    }
}