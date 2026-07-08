"use client";

import React, { useEffect, useState } from "react";
import {
	BarChart3,
	PieChart,
	CheckCircle2,
	Loader2,
} from "lucide-react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { Skeleton, StatCardSkeleton } from "@/components/ui/Skeleton";
import { TiltCard } from "@/components/ui/TiltCard";
import {
	analyticsService,
	AnalyticsResponse,
} from "../../../lib/services/analyticsService";

const getTailwindColor = (colorClass: string) => {
	const colors: Record<string, string> = {
		"bg-primary": "bg-primary",
		"bg-success": "bg-success",
		"bg-warning": "bg-warning",
		"bg-warningDark": "bg-warningDark",
		"bg-error": "bg-error",
		"bg-accent": "bg-accent",
		"bg-blue-500": "bg-outline",
		"bg-textTertiary": "bg-textTertiary",
	};
	return colors[colorClass] || "bg-outline";
};

// BAR CHART
function BarChart({
	data,
	maxVal,
	color,
}: {
	data: { label: string; value: number }[];
	maxVal: number;
	color: string;
}) {
	return (
		<div className="mt-6 flex h-40 items-end gap-2 overflow-x-auto border-b border-divider px-2 sm:h-44 sm:gap-3">
			{data.length === 0 ? (
				<div className="flex h-full w-full items-center justify-center text-sm text-textSecondary">
					No data available
				</div>
			) : (
				data.map((d) => (
					<div
						key={d.label}
						className="group relative flex min-w-[64px] flex-1 flex-col items-center gap-2 sm:min-w-0">
						<span className="absolute -top-6 text-[10px] font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
							{d.value}
						</span>
						<div
							className={`w-full rounded-t-lg ${getTailwindColor(
								color,
							)} shadow-sm transition-all duration-700 ease-out hover:brightness-110`}
							style={{
								height: `${Math.max((d.value / maxVal) * 100, 2)}%`,
							}}
						/>
						<span className="w-full truncate pb-2 text-center text-[10px] font-medium text-textTertiary sm:text-[10px]">
							{d.label}
						</span>
					</div>
				))
			)}
		</div>
	);
}

// DONUT CHART
function DonutChart({
	slices,
}: {
	slices: { label: string; pct: number; color: string }[];
}) {
	let cumulative = 0;
	const colorMap: Record<string, string> = {
		"bg-blue-500": "rgb(var(--color-outline))",
		"bg-accent": "rgb(var(--color-primaryDark))",
		"bg-primary": "rgb(var(--color-primary))",
		"bg-warning": "rgb(var(--color-warning))",
		"bg-textTertiary": "rgb(var(--color-textTertiary))",
		"bg-success": "rgb(var(--color-success))",
		"bg-error": "rgb(var(--color-error))",
	};

	const gradient =
		slices.length > 0
			? slices
					.map((s) => {
						const start = cumulative;
						cumulative += s.pct;
						const color = colorMap[s.color] || "rgb(var(--color-outline))";
						return `${color} ${start}% ${cumulative}%`;
					})
					.join(", ")
			: "rgb(var(--color-surfaceVariant)) 0% 100%";

	return (
		<div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
			<div
				className="relative h-28 w-28 shrink-0 rounded-full shadow-md transition-transform duration-300 hover:scale-105 sm:h-32 sm:w-32"
				style={{
					background: `conic-gradient(${gradient})`,
					maskImage: "radial-gradient(transparent 55%, black 56%)",
					WebkitMaskImage: "radial-gradient(transparent 55%, black 56%)",
				}}
			/>
			<div className="w-full flex-1 space-y-2">
				{slices.length === 0 ? (
					<div className="rounded-xl border border-dashed border-borderLight p-6 text-sm text-textSecondary">
						No data available
					</div>
				) : (
					slices.map((s) => (
						<div
							key={s.label}
							className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-surfaceVariant">
							<div
								className={`h-3 w-3 shrink-0 rounded-full ${getTailwindColor(
									s.color,
								)}`}
							/>
							<span className="text-xs font-medium text-textSecondary">
								{s.label}
							</span>
							<span className="ml-auto text-xs font-bold text-textPrimary">
								{s.pct}%
							</span>
						</div>
					))
				)}
			</div>
		</div>
	);
}

// CARD WRAPPER – consistent with admin panel card styling
function ChartCard({
	title,
	icon,
	children,
}: {
	title: string;
	icon: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<TiltCard
			maxTilt={3}
			glare={true}
			className="overflow-hidden rounded-xl border border-borderLight bg-surface shadow-sm transition-shadow hover:border-primary/40 hover:shadow-md"
		>
			<div className="border-b border-borderLight px-5 py-4">
				<h2 className="flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-textPrimary">
					<span className="rounded-lg bg-surfaceVariant p-2">{icon}</span>
					{title}
				</h2>
			</div>
			<div className="p-5">{children}</div>
		</TiltCard>
	);
}

export default function AdminAnalyticsPage() {
	const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const loadAnalytics = async () => {
		try {
			setError("");
			const data = await analyticsService.getAnalytics();
			setAnalytics(data);
		} catch (err: any) {
			setError(
				err?.response?.data?.message ||
					"Failed to load analytics from the backend.",
			);
		}
	};

	useEffect(() => {
		let mounted = true;

		(async () => {
			setLoading(true);
			await loadAnalytics();
			if (mounted) setLoading(false);
		})();

		return () => {
			mounted = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Auto-refresh platform metrics on tab focus + moderate polling
	useAutoRefresh(loadAnalytics, { intervalMs: 60_000 });

	const summary = analytics?.summary;

	const topItems = analytics?.topItems ?? [];
	const bookingRatio = analytics?.bookingRatio ?? [];
	const categoryDistribution = analytics?.categoryDistribution ?? [];

	const summaryCards = [
		{
			label: "Total Reports",
			value: (summary?.totalReports ?? 0).toLocaleString(),
			valueClass: "text-error",
			accentClass: "bg-error/10",
			iconClass: "bg-error",
		},
		{
			label: "Total Bookings",
			value: (summary?.totalBookings ?? 0).toLocaleString(),
			valueClass: "text-primary",
			accentClass: "bg-primary/10",
			iconClass: "bg-primary",
		},
		{
			label: "Total Users",
			value: (summary?.totalUsers ?? 0).toLocaleString(),
			valueClass: "text-accent",
			accentClass: "bg-accent/10",
			iconClass: "bg-accent",
		},
		{
			label: "Listed Items",
			value: (summary?.totalItems ?? 0).toLocaleString(),
			valueClass: "text-warning",
			accentClass: "bg-warning/10",
			iconClass: "bg-warning",
		},
	];

	const chartConfigs = [
		{
			title: "Most Booked Items",
			icon: <BarChart3 className="h-4 w-4 text-primary" />,
			content: (
				<BarChart
					data={topItems}
					maxVal={Math.max(...topItems.map((d) => d.value), 1)}
					color="bg-primary"
				/>
			),
		},
		{
			title: "Booking Status Distribution",
			icon: <CheckCircle2 className="h-4 w-4 text-accent" />,
			content: <DonutChart slices={bookingRatio} />,
		},
		{
			title: "Items by Category",
			icon: <PieChart className="h-4 w-4 text-textSecondary" />,
			content: <DonutChart slices={categoryDistribution} />,
		},
	];

	if (loading) {
		return (
			<div className="w-full space-y-6 px-4 pb-20 sm:px-6 lg:px-8">
				<div>
					<Skeleton className="h-8 w-40" />
					<Skeleton className="mt-2 h-4 w-72" />
				</div>
				<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<StatCardSkeleton key={i} />
					))}
				</div>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					{Array.from({ length: 4 }).map((_, i) => (
						<div
							key={i}
							className="rounded-xl border border-borderLight bg-surface p-5 shadow-sm">
							<Skeleton className="h-4 w-40" />
							<Skeleton className="mt-6 h-40 w-full" />
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="w-full space-y-6 px-4 pb-20 sm:px-6 lg:px-8 graph-grid page-enter">
			{/* Header – matches admin pattern */}
			<div className="glass-surface relative overflow-hidden rounded-2xl p-6 shadow-sm">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="mt-1 text-2xl font-bold text-textPrimary tracking-tight sm:text-3xl">
							Platform <span className="text-gradient-brand italic">Analytics.</span>
						</h1>
						<p className="mt-1 text-sm text-textSecondary">
							Live platform-wide insights and performance metrics for the current
							period.
						</p>
					</div>
				</div>
			</div>

			{/* Error banner – consistent */}
			{error && (
				<div className="flex items-center gap-3 rounded-xl border border-error/40 bg-errorLight px-4 py-3 text-sm font-medium text-error">
					<Loader2 className="h-4 w-4 shrink-0" />
					{error}
				</div>
			)}

			{/* Summary cards – 2 columns mobile, 4 columns desktop */}
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				{summaryCards.map((card) => (
					<TiltCard
						key={card.label}
						maxTilt={6}
						glare={true}
						className="relative overflow-hidden rounded-xl border border-borderLight bg-surface p-4 shadow-sm transition hover:shadow-md">
						<div className="text-xs font-semibold uppercase tracking-wider text-textTertiary relative z-10">
							{card.label}
						</div>
						<div className={`mt-2 text-2xl font-bold relative z-10 ${card.valueClass}`}>
							{card.value}
						</div>
						<div
							className={`absolute -right-4 -bottom-4 h-16 w-16 rounded-full ${card.accentClass}`}
						/>
						<div
							className={`absolute right-5 top-5 h-2.5 w-2.5 rounded-full ${card.iconClass}`}
						/>
					</TiltCard>
				))}
			</div>

			{/* Charts grid – 1 column mobile, 2 columns desktop */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{chartConfigs.map((chart) => (
					<ChartCard key={chart.title} title={chart.title} icon={chart.icon}>
						{chart.content}
					</ChartCard>
				))}
			</div>
		</div>
	);
}
