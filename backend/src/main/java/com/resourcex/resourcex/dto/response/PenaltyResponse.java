package com.resourcex.resourcex.dto.response;

import com.resourcex.resourcex.entity.Penalty;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PenaltyResponse {

    private Long penaltyId;

    private Long userId;

    private String userName;

    private Long bookingId;

    private Long disputeId;

    private BigDecimal amount;

    private String reason;

    private Penalty.PenaltyStatus status;

    private Long issuedByStaffId;

    private String issuedByStaffName;

    private LocalDateTime createdAt;

    private LocalDateTime appliedAt;
}