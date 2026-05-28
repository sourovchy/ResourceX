package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.CreateDisputeRequest;
import com.resourcex.resourcex.dto.request.ResolutionRequest;
import com.resourcex.resourcex.dto.response.DisputeResponse;
import com.resourcex.resourcex.entity.Dispute.DisputeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DisputeService {

    DisputeResponse createDispute(CreateDisputeRequest request);

    DisputeResponse getDisputeById(Long disputeId);

    Page<DisputeResponse> getAllDisputes(Pageable pageable);

    List<DisputeResponse> getDisputesByUser(Long userId);

    List<DisputeResponse> getDisputesByStatus(DisputeStatus status);

    DisputeResponse resolveDispute(Long disputeId, ResolutionRequest request);

    DisputeResponse closeDispute(Long disputeId);

    void deleteDispute(Long disputeId);

    void followUpStaleDisputes(java.time.LocalDateTime threshold);
}