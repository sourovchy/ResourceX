package com.resourcex.resourcex.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import com.resourcex.resourcex.util.constants.RegexConstants;

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
            regexp = RegexConstants.PHONE_REGEX,
            message = "Invalid phone number format"
    )
    private String phone;

    @Size(max = 1000, message = "Avatar URL must not exceed 1000 characters")
    private String avatarUrl;

    @jakarta.validation.constraints.Email(message = "Invalid email format")
    private String email;

    private String currentPassword;
}