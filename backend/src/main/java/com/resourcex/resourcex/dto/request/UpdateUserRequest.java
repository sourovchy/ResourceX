package com.resourcex.resourcex.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserRequest {

    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    @Pattern(
            regexp = "^[+]?[0-9\\-() ]+$",
            message = "Invalid phone number format"
    )
    private String phone;
}