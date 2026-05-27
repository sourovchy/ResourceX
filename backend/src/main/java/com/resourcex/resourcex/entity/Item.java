package com.resourcex.resourcex.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "items",
        indexes = {
                @Index(name = "idx_items_owner", columnList = "owner_id"),
                @Index(name = "idx_items_status", columnList = "status"),
                @Index(name = "idx_items_category", columnList = "category_id"),
                @Index(name = "idx_items_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(length = 80)
    private String itemCondition;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal dailyRate;

    @Column(precision = 10, scale = 2)
    private BigDecimal deposit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    @Builder.Default
    private ItemStatus status = ItemStatus.AVAILABLE;

    @OneToMany(
            mappedBy = "item",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<FileMetadata> images = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;

        normalizeFields();

        if (this.dailyRate == null || this.dailyRate.signum() < 0) {
            throw new IllegalArgumentException("Daily rate must be positive");
        }
    }

    @PreUpdate
    public void onUpdate() {

        this.updatedAt = LocalDateTime.now();

        normalizeFields();

        if (this.dailyRate == null || this.dailyRate.signum() < 0) {
            throw new IllegalArgumentException("Daily rate must be positive");
        }
    }

    private void normalizeFields() {

        if (this.title != null) {
            this.title = this.title.trim();
        }

        if (this.description != null) {
            this.description = this.description.trim();
        }

        // Category is now an entity, normalization happens via category service/repository

        if (this.itemCondition != null) {
            this.itemCondition = this.itemCondition.trim();
        }
    }

    public enum ItemStatus {
        AVAILABLE,
        UNAVAILABLE,
        BLOCKED,
        DELETED
    }
}