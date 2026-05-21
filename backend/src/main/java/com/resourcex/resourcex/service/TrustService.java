package com.resourcex.resourcex.service;

public interface TrustService {

    void updateTrustScore(Long userId, Integer changeAmount, String reason);
}