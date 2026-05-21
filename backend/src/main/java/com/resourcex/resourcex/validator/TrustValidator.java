package com.resourcex.resourcex.validator;

import com.resourcex.resourcex.dto.request.PenaltyRequest;
import com.resourcex.resourcex.entity.Penalty;
import com.resourcex.resourcex.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class TrustValidator {

    public void validatePenaltyImpact(Integer deductionPoints) {

        if (deductionPoints == null) {
            throw new BadRequestException("Deduction points cannot be null");
        }

        if (deductionPoints <= 0) {
            throw new BadRequestException("Deduction points must be greater than zero");
        }

        if (deductionPoints > 100) {
            throw new BadRequestException("Deduction points exceed maximum allowed limit");
        }
    }

    public void validateTrustPoints(Integer points) {

        if (points == null) {
            throw new BadRequestException("Trust points cannot be null");
        }

        if (points == 0) {
            throw new BadRequestException("Trust points cannot be zero");
        }

        if (points < -100 || points > 100) {
            throw new BadRequestException("Trust points must be between -100 and 100");
        }
    }

    public void validatePenaltyRequest(PenaltyRequest request) {

        if (request == null) {
            throw new BadRequestException("Penalty request cannot be null");
        }

        if (request.getAmount() == null) {
            throw new BadRequestException("Penalty amount is required");
        }

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Penalty amount must be greater than zero");
        }

        if (request.getReason() == null || request.getReason().trim().isEmpty()) {
            throw new BadRequestException("Penalty reason is required");
        }
    }

    public void validatePenaltyStatus(Penalty penalty) {

        if (penalty == null) {
            throw new BadRequestException("Penalty cannot be null");
        }

        if (penalty.getStatus() == Penalty.PenaltyStatus.WAIVED) {
            throw new BadRequestException("Waived penalties cannot be modified");
        }
    }
}