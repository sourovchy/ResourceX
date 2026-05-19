package com.thirdhand.campusvault.controller;

import com.thirdhand.campusvault.dto.request.CreateDisputeRequest;
import com.thirdhand.campusvault.dto.response.DisputeResponse;
import com.thirdhand.campusvault.service.DisputeService;
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