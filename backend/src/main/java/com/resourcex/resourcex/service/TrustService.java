package com.resourcex.resourcex.service;

import com.resourcex.resourcex.dto.response.TrustEventResponse;
import com.resourcex.resourcex.entity.TrustEvent;

import java.util.List;

public interface TrustService {

    TrustEventResponse createTrustEvent(Long userId, TrustEvent.TrustEventType eventType, Integer points, String reason);

    List<TrustEventResponse> getTrustEventsByUserId(Long userId);

    List<TrustEventResponse> getAllTrustEvents();

    long getTrustScore(Long userId);

    void applyPenaltyImpact(Long userId, Long penaltyId, Integer deductionPoints, String reason);
}