package com.resourcex.resourcex.mapper;

import com.resourcex.resourcex.dto.response.DisputeResponse;
import com.resourcex.resourcex.entity.Dispute;

public class DisputeMapper {

    public static DisputeResponse toResponse(Dispute dispute) {

        if (dispute == null) {
            return null;
        }

        return DisputeResponse.builder()
                .disputeId(dispute.getDisputeId())
                .bookingId(
                        dispute.getBooking() != null
                                ? dispute.getBooking().getBookingId()
                                : null
                )
                .reporter(
                        dispute.getRaisedBy() != null
                                ? UserMapper.toResponse(dispute.getRaisedBy())
                                : null
                )
                .status(
                        dispute.getStatus() != null
                                ? dispute.getStatus().name()
                                : null
                )
                .reason(dispute.getReason())
                .resolution(dispute.getResolution())
                .resolvedBy(
                        dispute.getResolvedBy() != null && dispute.getResolvedBy().getUser() != null
                                ? UserMapper.toResponse(dispute.getResolvedBy().getUser())
                                : null
                )
                .createdAt(dispute.getCreatedAt())
                .resolvedAt(dispute.getResolvedAt())
                .build();
    }
}