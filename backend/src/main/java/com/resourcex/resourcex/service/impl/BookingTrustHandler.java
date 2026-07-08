package com.resourcex.resourcex.service.impl;

import com.resourcex.resourcex.entity.Booking;
import com.resourcex.resourcex.entity.User;
import com.resourcex.resourcex.service.TrustScoreService;
import com.resourcex.resourcex.util.constants.TrustPoints;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Trust Score side-effects of the booking lifecycle, extracted from
 * {@code BookingServiceImpl} so the service body holds only transition logic.
 * All awards are keyed on (userId, stable reason) inside {@link TrustScoreService},
 * so re-running a completion (manual complete then nightly auto-transition) is
 * idempotent.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BookingTrustHandler {

    private final TrustScoreService trustScoreService;

    /**
     * Award the Trust Score deltas that follow a successful booking completion:
     * both parties earn for completing, the renter is rewarded/penalised for an
     * on-time/late return, and both receive the clean-rental (no-dispute) bonus.
     * Failures are swallowed (logged) so a trust hiccup never rolls back the
     * completion itself.
     */
    public void awardCompletionTrust(Booking booking) {
        Long bookingId = booking.getBookingId();
        User renter = booking.getRenter();
        User owner = booking.getItem() != null ? booking.getItem().getOwner() : null;
        if (renter == null || owner == null) {
            return;
        }

        try {
            // Both parties earn for completing the transaction.
            trustScoreService.applyTrustChange(renter.getUserId(),
                    TrustPoints.BOOKING_COMPLETED_RENTER, "Completed a booking as renter");
            trustScoreService.applyTrustChange(owner.getUserId(),
                    TrustPoints.BOOKING_COMPLETED_OWNER, "Completed a booking as owner");

            // On-time vs. late return (renter is responsible for the return).
            boolean onTime = booking.getReturnedDate() != null && booking.getEndDate() != null
                    && !booking.getReturnedDate().isAfter(booking.getEndDate());
            if (onTime) {
                trustScoreService.applyTrustChange(renter.getUserId(),
                        TrustPoints.ON_TIME_RETURN, "Returned item on or before the due date");
            } else {
                trustScoreService.applyTrustChange(renter.getUserId(),
                        TrustPoints.LATE_RETURN, "Returned item after the due date");
            }

            // Clean-rental bonus for both parties on successful completion.
            trustScoreService.applyTrustChange(renter.getUserId(),
                    TrustPoints.NO_DISPUTE, "Completed rental with no issues");
            trustScoreService.applyTrustChange(owner.getUserId(),
                    TrustPoints.NO_DISPUTE, "Completed rental with no issues");
        } catch (Exception e) {
            log.error("Failed to apply completion trust events for booking {}: {}", bookingId, e.getMessage(), e);
        }
    }

    /** Cancelling an already-approved/active booking penalises the canceller. */
    public void penalizeCancellationAfterApproval(User canceller) {
        trustScoreService.applyTrustChange(
                canceller.getUserId(),
                TrustPoints.CANCELLATION_AFTER_APPROVAL,
                "Cancelled a booking after approval");
    }
}
