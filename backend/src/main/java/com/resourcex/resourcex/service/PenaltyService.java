package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.request.PenaltyRequest;
import com.resourcex.resourcex.dto.response.PenaltyResponse;
import com.resourcex.resourcex.entity.Penalty;

import java.util.List;

public interface PenaltyService {

    PenaltyResponse createPenalty(PenaltyRequest request);

    PenaltyResponse updatePenalty(Long penaltyId, PenaltyRequest request);

    PenaltyResponse getPenaltyById(Long penaltyId);

    List<PenaltyResponse> getAllPenalties();

    List<PenaltyResponse> getPenaltiesByUserId(Long userId);

    List<PenaltyResponse> getPenaltiesByBookingId(Long bookingId);

    List<PenaltyResponse> getPenaltiesByDisputeId(Long disputeId);

    List<PenaltyResponse> getPenaltiesByStatus(Penalty.PenaltyStatus status);

    PenaltyResponse applyPenalty(Long penaltyId);

    PenaltyResponse waivePenalty(Long penaltyId);

    void deletePenalty(Long penaltyId);
}