import api from "../api";

export interface AnalyticsResponse {
  summary: {
    totalRevenue: number;
    averageRentalPerDay: number;
    lateReturnRate: number;
    disputeRate: number;
  };
  topItems: { label: string; value: number }[];
  monthlyRevenue: { label: string; value: number }[];
  lateReturns: { label: string; value: number; color: string }[];
  bookingRatio: { label: string; pct: number; color: string }[];
  categoryDistribution: { label: string; pct: number; color: string }[];
}

export const analyticsService = {
  getAnalytics: async (): Promise<AnalyticsResponse> => {
    const response = await api.get<{
      metrics: {
        totalUsers: number;
        totalItems: number;
        totalBookings: number;
        activeBookings: number;
        completedBookings: number;
        cancelledBookings: number;
        totalDisputes: number;
        openDisputes: number;
        resolvedDisputes: number;
        totalPenalties: number;
        appliedPenalties: number;
        waivedPenalties: number;
        totalTrustEvents: number;
        revenue: number;
      };
      charts: any;
      trends: any;
    }>("/analytics");

    const metrics = response.data.metrics || {
      totalUsers: 0,
      totalItems: 0,
      totalBookings: 0,
      activeBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      totalDisputes: 0,
      openDisputes: 0,
      resolvedDisputes: 0,
      totalPenalties: 0,
      appliedPenalties: 0,
      waivedPenalties: 0,
      totalTrustEvents: 0,
      revenue: 0,
    };

    const totalBookings = Math.max(metrics.totalBookings, 1);
    const totalStatusBookings = Math.max(
      metrics.activeBookings + metrics.completedBookings + metrics.cancelledBookings,
      1
    );

    const bookingRatio = [
      {
        label: "Active",
        pct: Math.round((metrics.activeBookings / totalStatusBookings) * 100),
        color: "bg-primary",
      },
      {
        label: "Completed",
        pct: Math.round((metrics.completedBookings / totalStatusBookings) * 100),
        color: "bg-success",
      },
      {
        label: "Cancelled",
        pct: Math.round((metrics.cancelledBookings / totalStatusBookings) * 100),
        color: "bg-error",
      },
    ];

    return {
      summary: {
        totalRevenue: metrics.revenue || 0,
        averageRentalPerDay: Math.round((metrics.revenue || 0) / totalBookings),
        lateReturnRate: Math.round((metrics.appliedPenalties / totalBookings) * 100),
        disputeRate: Math.round((metrics.totalDisputes / totalBookings) * 100),
      },
      topItems: [
        { label: "Items Listed", value: metrics.totalItems },
        { label: "Total Bookings", value: metrics.totalBookings },
        { label: "Total Disputes", value: metrics.totalDisputes },
      ],
      monthlyRevenue: [
        { label: "Revenue", value: metrics.revenue || 0 }
      ],
      lateReturns: [
        { label: "Applied Penalties", value: metrics.appliedPenalties, color: "bg-error" },
        { label: "Waived Penalties", value: metrics.waivedPenalties, color: "bg-success" },
      ],
      bookingRatio,
      categoryDistribution: [
        { label: "All Items", pct: 100, color: "bg-accent" }
      ],
    };
  },
};
