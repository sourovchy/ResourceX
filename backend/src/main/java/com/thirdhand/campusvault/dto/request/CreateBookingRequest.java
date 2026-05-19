package com.thirdhand.campusvault.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBookingRequest {

    @NotNull
    private Long itemId;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;
}