package com.resourcex.resourcex.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    private Long totalUsers;

    private Long activeBookings;

    private Long pendingApprovals;

    private Long verifiedStudents;

    private Long totalListings;

    private Long availableListings;

    private Long activeRentals;

    private Long reportsPendingReview;

    private Long suspendedUsers;
}