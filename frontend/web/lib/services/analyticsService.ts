import api from "../api";

export interface AnalyticsResponse {
  summary: {
    totalRevenue: number;
    totalBookings: number;
    totalUsers: number;
    totalItems: number;
  };
  topItems: { label: string; value: number }[];
  bookingRatio: { label: string; pct: number; color: string }[];
  categoryDistribution: { label: string; pct: number; color: string }[];
  penalties: { label: string; value: number; color: string }[];
  disputes: { label: string; value: number; color: string }[];
}

type LabelValue = { label: string; value: number };

// Backend `metrics` map (all real DB aggregates)
interface BackendMetrics {
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
}

const CATEGORY_COLORS = [
  "bg-primary",
  "bg-success",
  "bg-warning",
  "bg-accent",
  "bg-error",
  "bg-textTertiary",
  "bg-blue-500",
];

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeLabelValues(raw: unknown): LabelValue[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r: any) => ({
    label: String(r?.label ?? "Unknown"),
    value: toNumber(r?.value),
  }));
}

export const analyticsService = {
  getAnalytics: async (): Promise<AnalyticsResponse> => {
    const response = await api.get<{
      metrics: Partial<BackendMetrics>;
      charts: {
        topItems?: unknown;
        categoryDistribution?: unknown;
      };
    }>("/analytics");

    const m = (response.data.metrics ?? {}) as Partial<BackendMetrics>;
    const charts = response.data.charts ?? {};

    const metrics: BackendMetrics = {
      totalUsers: toNumber(m.totalUsers),
      totalItems: toNumber(m.totalItems),
      totalBookings: toNumber(m.totalBookings),
      activeBookings: toNumber(m.activeBookings),
      completedBookings: toNumber(m.completedBookings),
      cancelledBookings: toNumber(m.cancelledBookings),
      totalDisputes: toNumber(m.totalDisputes),
      openDisputes: toNumber(m.openDisputes),
      resolvedDisputes: toNumber(m.resolvedDisputes),
      totalPenalties: toNumber(m.totalPenalties),
      appliedPenalties: toNumber(m.appliedPenalties),
      waivedPenalties: toNumber(m.waivedPenalties),
      totalTrustEvents: toNumber(m.totalTrustEvents),
      revenue: toNumber(m.revenue),
    };

    // Booking status distribution (real)
    const statusTotal = Math.max(
      metrics.activeBookings + metrics.completedBookings + metrics.cancelledBookings,
      1,
    );
    const bookingRatio = [
      { label: "Active", pct: Math.round((metrics.activeBookings / statusTotal) * 100), color: "bg-primary" },
      { label: "Completed", pct: Math.round((metrics.completedBookings / statusTotal) * 100), color: "bg-success" },
      { label: "Cancelled", pct: Math.round((metrics.cancelledBookings / statusTotal) * 100), color: "bg-error" },
    ];

    // Category distribution (real, from backend charts)
    const categoryCounts = normalizeLabelValues(charts.categoryDistribution);
    const categoryTotal = Math.max(
      categoryCounts.reduce((sum, c) => sum + c.value, 0),
      1,
    );
    const categoryDistribution = categoryCounts.map((c, i) => ({
      label: c.label,
      pct: Math.round((c.value / categoryTotal) * 100),
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));

    return {
      summary: {
        totalRevenue: metrics.revenue,
        totalBookings: metrics.totalBookings,
        totalUsers: metrics.totalUsers,
        totalItems: metrics.totalItems,
      },
      // Real top items by booking count (from backend charts)
      topItems: normalizeLabelValues(charts.topItems),
      bookingRatio,
      categoryDistribution,
      penalties: [
        { label: "Applied", value: metrics.appliedPenalties, color: "bg-error" },
        { label: "Waived", value: metrics.waivedPenalties, color: "bg-success" },
      ],
      disputes: [
        { label: "Open", value: metrics.openDisputes, color: "bg-warning" },
        { label: "Resolved", value: metrics.resolvedDisputes, color: "bg-success" },
      ],
    };
  },
};
