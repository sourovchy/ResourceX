package com.resourcex.resourcex.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistResponse {

    private Long wishlistId;

    private ItemResponse item;

    private LocalDateTime createdAt;
}
