package com.resourcex.resourcex.dto.response;

import lombok.*;

import java.util.List;
import java.util.Map;

/**
 * Aggregated rating snapshot for an item or an owner — drives the
 * "Reviews & Ratings" header (average, total, 5★→1★ distribution).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewSummaryResponse {

    /** Mean rating rounded to one decimal place, or 0 when there are no reviews. */
    private double averageRating;

    private long totalReviews;

    /** Count of reviews per star value, always populated for keys 1..5. */
    private Map<Integer, Long> distribution;

    /** Up to 3 most recent excerpts — populated for owner/profile summaries only. */
    private List<ReviewSnippetResponse> recentSnippets;

    private long completedRentals;
}
