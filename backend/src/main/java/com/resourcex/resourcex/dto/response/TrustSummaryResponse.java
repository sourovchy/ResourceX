package com.resourcex.resourcex.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * The current user's complete Trust Score snapshot for profile and dashboard views.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrustSummaryResponse {

    private Long userId;
    private Integer trustScore;
    private String trustLevel;
    private String badgeLabel;

    // Progress toward the next tier (null when already at the top tier).
    private Integer nextLevel;          // score required for the next tier
    private Integer pointsToNextLevel;

    // Enforcement state
    private boolean trustWarningActive;
    private boolean restricted;
    private boolean suspended;
    private LocalDateTime suspensionEndsAt;
    private List<String> recommendations;
}
