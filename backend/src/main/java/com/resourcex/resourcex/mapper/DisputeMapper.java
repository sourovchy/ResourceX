package com.resourcex.resourcex.mapper;

import com.resourcex.resourcex.dto.response.DisputeResponse;
import com.resourcex.resourcex.dto.response.UserResponse;
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
                        dispute.getResolvedBy() != null
                                ? UserResponse.builder()
                                        .userId(dispute.getResolvedBy().getStaffId())
                                        .name(dispute.getResolvedBy().getName())
                                        .email(dispute.getResolvedBy().getEmail())
                                        .roles(java.util.List.of("ROLE_ADMIN"))
                                        .build()
                                : null
                )
                .createdAt(dispute.getCreatedAt())
                .resolvedAt(dispute.getResolvedAt())
                .build();
    }
}