package com.resourcex.resourcex.mapper;

import com.resourcex.resourcex.dto.response.PenaltyResponse;
import com.resourcex.resourcex.entity.Penalty;
import org.springframework.stereotype.Component;

@Component
public class PenaltyMapper {

    public PenaltyResponse toResponse(Penalty penalty) {

        if (penalty == null) {
            return null;
        }

        return PenaltyResponse.builder()
                .penaltyId(penalty.getPenaltyId())

                .userId(
                        penalty.getUser() != null
                                ? penalty.getUser().getUserId()
                                : null
                )

                .userName(
                        penalty.getUser() != null
                                ? penalty.getUser().getName()
                                : null
                )

                .bookingId(
                        penalty.getBooking() != null
                                ? penalty.getBooking().getBookingId()
                                : null
                )

                .disputeId(
                        penalty.getDispute() != null
                                ? penalty.getDispute().getDisputeId()
                                : null
                )

                .amount(penalty.getAmount())

                .reason(penalty.getReason())

                .status(penalty.getStatus())

                .issuedByStaffId(
                        penalty.getIssuedBy() != null
                                ? penalty.getIssuedBy().getStaffId()
                                : null
                )

                .issuedByStaffName(
                        penalty.getIssuedBy() != null
                                ? penalty.getIssuedBy().getName()
                                : null
                )

                .createdAt(penalty.getCreatedAt())

                .appliedAt(penalty.getAppliedAt())

                .build();
    }
}