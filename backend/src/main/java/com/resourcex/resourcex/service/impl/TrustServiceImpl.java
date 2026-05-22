package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.dto.response.TrustEventResponse;
import com.resourcex.resourcex.entity.Penalty;
import com.resourcex.resourcex.entity.TrustEvent;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.repository.PenaltyRepository;
import com.resourcex.resourcex.repository.TrustEventRepository;
import com.resourcex.resourcex.repository.UserRepository;
import com.resourcex.resourcex.service.TrustService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TrustServiceImpl implements TrustService {

    private final TrustEventRepository trustEventRepository;
    private final UserRepository userRepository;
    private final PenaltyRepository penaltyRepository;

    @Override
    public TrustEventResponse createTrustEvent(
            Long userId,
            TrustEvent.TrustEventType eventType,
            Integer points,
            String reason
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        int oldScore = 100;
        int changeAmount = points == null ? 0 : points;

        TrustEvent trustEvent = TrustEvent.builder()
                .user(user)
                .sourceType(eventType)
                .changeAmount(changeAmount)
                .oldScore(oldScore)
                .newScore(oldScore + changeAmount)
                .reason(reason)
                .build();

        TrustEvent savedEvent = trustEventRepository.save(trustEvent);

        return mapToResponse(savedEvent);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrustEventResponse> getTrustEventsByUserId(Long userId) {

        return trustEventRepository.findByUser_UserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrustEventResponse> getAllTrustEvents() {

        return trustEventRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long getTrustScore(Long userId) {

        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Integer score = trustEventRepository.sumPointsByUserId(userId);

        return score != null ? score : 0;
    }

    @Override
    public void applyPenaltyImpact(
            Long userId,
            Long penaltyId,
            Integer deductionPoints,
            String reason
    ) {

        Penalty penalty = penaltyRepository.findById(penaltyId)
                .orElseThrow(() -> new ResourceNotFoundException("Penalty not found"));

        createTrustEvent(
                userId,
                TrustEvent.TrustEventType.PENALTY,
                -Math.abs(deductionPoints),
                reason != null ? reason : penalty.getReason()
        );
    }

    private TrustEventResponse mapToResponse(TrustEvent trustEvent) {

        return TrustEventResponse.builder()
                .trustEventId(trustEvent.getTrustEventId())
                .userId(trustEvent.getUser().getUserId())
                .userName(trustEvent.getUser().getName())
                .eventType(trustEvent.getSourceType())
                .points(trustEvent.getChangeAmount())
                .reason(trustEvent.getReason())
                .createdAt(trustEvent.getCreatedAt())
                .build();
    }
}
