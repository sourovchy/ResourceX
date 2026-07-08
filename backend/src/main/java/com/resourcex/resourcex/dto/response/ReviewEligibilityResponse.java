package com.resourcex.resourcex.dto.response;

import lombok.*;

/**
 * Server-side verdict on whether the current user may review a given item.
 * Mirrors the validation enforced in {@code ReviewService.createReview} so the
 * UI can pre-flight the form without duplicating the business rules.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewEligibilityResponse {

    /** True only when a completed, not-yet-reviewed booking exists for this user + item. */
    private boolean eligible;

    /** The booking the user can review (null when not eligible). */
    private Long bookingId;

    /** True when the user already reviewed their eligible booking(s) for this item. */
    private boolean alreadyReviewed;

    /** True when the current user owns the item and therefore cannot review it. */
    private boolean ownItem;

    /** Human-readable reason shown when {@link #eligible} is false. */
    private String reason;
}
