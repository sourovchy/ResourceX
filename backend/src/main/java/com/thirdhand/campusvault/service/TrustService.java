package com.thirdhand.campusvault.service;

public interface TrustService {

    void updateTrustScore(Long userId, Integer changeAmount, String reason);
}