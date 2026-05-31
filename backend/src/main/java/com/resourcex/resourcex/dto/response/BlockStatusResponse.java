package com.resourcex.resourcex.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockStatusResponse {

    /** The current user has blocked the target user. */
    private boolean blockedByMe;

    /** The target user has blocked the current user. */
    private boolean blockedByThem;

    /** A block exists in either direction — the conversation is read-only. */
    private boolean blocked;
}
