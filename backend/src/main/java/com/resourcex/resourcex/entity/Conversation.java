package com.resourcex.resourcex.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "conversations",
        indexes = {
                @Index(name = "idx_conversations_participant_one", columnList = "participant_one_user_id"),
                @Index(name = "idx_conversations_participant_two", columnList = "participant_two_user_id"),
                @Index(name = "idx_conversations_last_message_at", columnList = "last_message_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"participantOneUser", "participantTwoUser"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "conversation_id")
    @EqualsAndHashCode.Include
    private Long conversationId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participant_one_user_id", referencedColumnName = "user_id", nullable = false)
    private User participantOneUser;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participant_two_user_id", referencedColumnName = "user_id", nullable = false)
    private User participantTwoUser;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "participant_one_deleted", nullable = false)
    @Builder.Default
    private boolean participantOneDeleted = false;

    @Column(name = "participant_two_deleted", nullable = false)
    @Builder.Default
    private boolean participantTwoDeleted = false;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
    }
}