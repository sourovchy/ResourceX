package com.resourcex.resourcex.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageRequest {

    @NotBlank(message = "Message content is required")
    @Size(min = 1, max = 4000, message = "Message content must be between 1 and 4000 characters")
    private String content;
}