package com.resourcex.resourcex.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {

    private Long bookingId;

    private ItemResponse item;

    private UserResponse renter;

    private LocalDate startDate;

    private LocalDate endDate;

    private String status;

    private String rejectionReason;

    private String bookingMessage;

    private BigDecimal totalPrice;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}