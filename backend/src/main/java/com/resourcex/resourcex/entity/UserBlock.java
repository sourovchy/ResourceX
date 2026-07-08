package com.resourcex.resourcex.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_blocks")
@IdClass(UserBlockId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBlock {

    /** The user who initiated the block. */
    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "blocker_id", nullable = false)
    private User blocker;

    /** The user who is blocked. */
    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "blocked_id", nullable = false)
    private User blocked;
}
