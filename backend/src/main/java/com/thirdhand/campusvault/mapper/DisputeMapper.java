package com.thirdhand.campusvault.mapper;

import com.thirdhand.campusvault.dto.response.DisputeResponse;
import com.thirdhand.campusvault.entity.Dispute;

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