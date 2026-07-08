package com.resourcex.resourcex.validator;

import com.resourcex.resourcex.exception.BadRequestException;
import org.springframework.stereotype.Component;

@Component
public class TrustValidator {

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
}