package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.request.CreateDisputeRequest;
import com.resourcex.resourcex.dto.response.DisputeResponse;
import com.resourcex.resourcex.service.DisputeService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DisputeServiceImpl implements DisputeService {

    @Override
    public DisputeResponse createDispute(CreateDisputeRequest request) {
        return new DisputeResponse();
    }

    @Override
    public List<DisputeResponse> getAllDisputes() {
        return List.of();
    }
}