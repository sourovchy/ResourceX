package com.thirdhand.campusvault.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "TrustEvents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrustEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long trustEventId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer changeAmount;

    @Column(nullable = false)
    private Integer oldScore;

    @Column(nullable = false)
    private Integer newScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrustSourceType sourceType;

    private Long sourceId;

    @Column(nullable = false)
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private Staff createdBy;

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum TrustSourceType {
        PENALTY, REVIEW, DISPUTE, REPORT, SYSTEM, STAFF_ACTION
    }
}
