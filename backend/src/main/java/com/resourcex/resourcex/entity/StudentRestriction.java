package com.resourcex.resourcex.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Moderation / suspension state for a student, split out of {@link StudentProfile} (V20).
 *
 * <p>Relationship: Student_Profile (1) ── has ── Student_Restriction (0..1). A profile has no
 * row until it is first restricted or suspended. {@code studentUserId} references
 * {@code student_profiles.user_id} and is unique (at most one restriction per student).
 */
@Entity
@Table(name = "student_restrictions", indexes = {
        @Index(name = "idx_student_restrictions_suspended_until", columnList = "suspended_until"),
        @Index(name = "idx_student_restrictions_scheduled_deletion_at", columnList = "scheduled_deletion_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentRestriction {

    @Id
    @Column(name = "student_user_id")
    private Long studentUserId;

    @Column(name = "suspension_reason", length = 500)
    private String suspensionReason;

    @Column(name = "suspended_at")
    private LocalDateTime suspendedAt;

    /** Null for PERMANENT suspensions; non-null for timed suspensions. */
    @Column(name = "suspended_until")
    private LocalDateTime suspendedUntil;

    /** Set for PERMANENT suspensions; account deleted on/after this date. */
    @Column(name = "scheduled_deletion_at")
    private LocalDateTime scheduledDeletionAt;

    /** Clears all suspension fields. Used when a suspension is lifted. */
    public void clearSuspension() {
        this.suspensionReason = null;
        this.suspendedAt = null;
        this.suspendedUntil = null;
        this.scheduledDeletionAt = null;
    }
}
