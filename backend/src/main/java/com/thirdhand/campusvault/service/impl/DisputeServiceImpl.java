package com.thirdhand.campusvault.service.impl;

import com.thirdhand.campusvault.dto.request.CreateDisputeRequest;
import com.thirdhand.campusvault.dto.response.DisputeResponse;
import com.thirdhand.campusvault.service.DisputeService;
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