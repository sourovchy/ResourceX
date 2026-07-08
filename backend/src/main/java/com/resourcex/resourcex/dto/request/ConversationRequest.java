package com.resourcex.resourcex.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationRequest {

    @NotNull(message = "Other user ID is required")
    private Long otherUserId;

    @NotBlank(message = "Initial message is required")
    @Size(max = 4000, message = "Initial message must not exceed 4000 characters")
    private String initialMessage;
}