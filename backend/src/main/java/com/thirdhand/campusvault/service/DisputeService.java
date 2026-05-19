package com.thirdhand.campusvault.service;

import com.thirdhand.campusvault.dto.request.CreateDisputeRequest;
import com.thirdhand.campusvault.dto.response.DisputeResponse;

import java.util.List;

public interface DisputeService {

    DisputeResponse createDispute(CreateDisputeRequest request);

    List<DisputeResponse> getAllDisputes();
}