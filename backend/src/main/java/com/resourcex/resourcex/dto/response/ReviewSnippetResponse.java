package com.resourcex.resourcex.dto.response;

import lombok.*;

import java.time.LocalDateTime;

/**
 * A short, public review excerpt for the profile storefront. Carries no
 * reviewer identifiers beyond a display name; full reviews live on item pages.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewSnippetResponse {

    private int rating;

    /** Truncated comment (max ~120 chars). */
    private String excerpt;

    private String reviewerName;

    private LocalDateTime createdAt;
}
