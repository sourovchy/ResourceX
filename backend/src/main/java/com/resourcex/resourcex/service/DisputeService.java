package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.CreateDisputeRequest;
import com.resourcex.resourcex.dto.response.DisputeResponse;

import java.util.List;

public interface DisputeService {

    DisputeResponse createDispute(CreateDisputeRequest request);

    List<DisputeResponse> getAllDisputes();
}