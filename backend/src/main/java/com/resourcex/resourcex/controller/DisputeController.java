package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.request.CreateDisputeRequest;
import com.resourcex.resourcex.dto.response.DisputeResponse;
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

    @GetMapping
    public List<DisputeResponse> getAllDisputes() {
        return disputeService.getAllDisputes();
    }
}