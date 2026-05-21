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
                .bookingId(dispute.getBooking().getBookingId())
                .reporter(UserMapper.toResponse(dispute.getRaisedBy()))
                .status(dispute.getStatus() != null ? dispute.getStatus().name() : null)
                .createdAt(dispute.getCreatedAt())
                .build();
    }
}