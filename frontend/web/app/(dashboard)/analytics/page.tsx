"use client";

import React, { useEffect, useState } from "react";
import {
	BarChart3,
	TrendingUp,
	PieChart,
	Clock,
	CheckCircle2,
	Loader2,
	RefreshCw,
} from "lucide-react";
import { analyticsService, AnalyticsResponse } from "../../../lib/services/analyticsService";

const getTailwindColor = (colorClass: string) => {
	const colors: Record<string, string> = {
		"bg-primary": "bg-primary",
		"bg-success": "bg-success",
		"bg-warning": "bg-warning",
		"bg-warningDark": "bg-warningDark",
		"bg-error": "bg-error",
		"bg-accent": "bg-accent",
		"bg-blue-500": "bg-blue-500",
		"bg-textTertiary": "bg-textTertiary",
	};
	return colors[colorClass] || "bg-gray-400";
};

function formatCurrency(value?: number) {
	if (typeof value !== "number") return "৳ 0";
	return new Intl.NumberFormat("en-BD", {
		style: "currency",
		currency: "BDT",
		maximumFractionDigits: 0,
	})
		.format(value)
		.replace("BDT", "")
		.trim();
}

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

// HORIZONTAL BAR CHART
function HBarChart({
					   data,
					   maxVal,
				   }: {
	data: { label: string; value: number; color: string }[];
	maxVal: number;
}) {
	return (
		<div className="mt-6 space-y-4 sm:space-y-5">
			{data.length === 0 ? (
				<div className="rounded-xl border border-dashed border-borderLight p-6 text-sm text-textSecondary">
					No data available
				</div>
			) : (
				data.map((d) => (
					<div key={d.label} className="group">
						<div className="mb-1.5 flex justify-between text-xs">
							<span className="font-medium text-textSecondary group-hover:text-textPrimary">
								{d.label}
							</span>
							<span className="font-bold text-textPrimary">{d.value}</span>
						</div>
						<div className="h-2.5 overflow-hidden rounded-full bg-surfaceVariant">
							<div
								className={`h-full rounded-full ${getTailwindColor(
									d.color,
								)} transition-all duration-1000 ease-in-out`}
								style={{
									width: `${Math.max((d.value / maxVal) * 100, 2)}%`,
								}}
							/>
						</div>
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
		"bg-blue-500": "#3b82f6",
		"bg-accent": "#12a37a",
		"bg-primary": "#1a73e8",
		"bg-warning": "#f29900",
		"bg-textTertiary": "#9aa0a6",
		"bg-success": "#1e8e3e",
		"bg-error": "#d93025",
	};

	const gradient =
		slices.length > 0
			? slices
				.map((s) => {
					const start = cumulative;
					cumulative += s.pct;
					const color = colorMap[s.color] || "#ccc";
					return `${color} ${start}% ${cumulative}%`;
				})
				.join(", ")
			: "#e5e7eb 0% 100%";

	return (
		<div className="mt-6 flex flex-col items-center gap-6 sm:gap-10 sm:flex-row">
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

// CARD WRAPPER
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
		<div className="min-w-0 rounded-2xl border border-border/50 bg-surface p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
			<h2 className="flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-textPrimary break-words">
				<span className="rounded-lg bg-surfaceVariant p-2">{icon}</span>
				{title}
			</h2>
			{children}
		</div>
	);
}

export default function AdminAnalyticsPage() {
	const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
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

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadAnalytics();
		setRefreshing(false);
	};

	const summary = analytics?.summary;

	const topItems = analytics?.topItems ?? [];
	const monthlyRevenue = analytics?.monthlyRevenue ?? [];
	const lateReturns = analytics?.lateReturns ?? [];
	const bookingRatio = analytics?.bookingRatio ?? [];
	const categoryDistribution = analytics?.categoryDistribution ?? [];

	const summaryCards = [
		{
			label: "Total Revenue",
			value: formatCurrency(summary?.totalRevenue),
			valueClass: "text-success",
			accentClass: "bg-success/10",
			iconClass: "bg-success",
		},
		{
			label: "Avg Rental / Day",
			value: formatCurrency(summary?.averageRentalPerDay),
			valueClass: "text-primary",
			accentClass: "bg-primary/10",
			iconClass: "bg-primary",
		},
		{
			label: "Late Return Rate",
			value: `${summary?.lateReturnRate ?? 0}%`,
			valueClass: "text-warning",
			accentClass: "bg-warning/10",
			iconClass: "bg-warning",
		},
		{
			label: "Dispute Rate",
			value: `${summary?.disputeRate ?? 0}%`,
			valueClass: "text-error",
			accentClass: "bg-error/10",
			iconClass: "bg-error",
		},
	];

	const chartConfigs = [
		{
			title: "Top 5 Most Rented Items",
			icon: <BarChart3 className="w-4 h-4 text-primary" />,
			content: (
				<BarChart
					data={topItems}
					maxVal={Math.max(...topItems.map((d) => d.value), 1)}
					color="bg-primary"
				/>
			),
		},
		{
			title: "Monthly Rental Revenue (৳)",
			icon: <TrendingUp className="w-4 h-4 text-success" />,
			content: (
				<BarChart
					data={monthlyRevenue}
					maxVal={Math.max(...monthlyRevenue.map((d) => d.value), 1)}
					color="bg-success"
				/>
			),
		},
		{
			title: "Late Return Stats by User",
			icon: <Clock className="w-4 h-4 text-warning" />,
			content: (
				<HBarChart
					data={lateReturns}
					maxVal={Math.max(...lateReturns.map((d) => d.value), 1)}
				/>
			),
		},
		{
			title: "Booking Status Distribution",
			icon: <CheckCircle2 className="w-4 h-4 text-accent" />,
			content: <DonutChart slices={bookingRatio} />,
		},
		{
			title: "Category Distribution",
			icon: <PieChart className="w-4 h-4 text-textSecondary" />,
			content: <DonutChart slices={categoryDistribution} />,
		},
	];

	return (
		<div className="mx-auto max-w-7xl space-y-6 px-3 pb-10 sm:px-0 sm:space-y-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
				<div className="min-w-0">
					<h1 className="text-2xl font-extrabold tracking-tight text-textPrimary sm:text-3xl">
						Analytics
					</h1>
					<p className="mt-1 text-sm text-textSecondary">
						Live platform-wide insights and performance metrics for the current period.
					</p>
				</div>

				<button
					type="button"
					onClick={handleRefresh}
					disabled={refreshing}
					className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-borderLight bg-surface px-4 py-2 text-sm font-semibold text-textPrimary shadow-sm transition hover:bg-background disabled:opacity-60 sm:w-auto">
					{refreshing ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<RefreshCw className="h-4 w-4" />
					)}
					Refresh
				</button>
			</div>

			{loading ? (
				<div className="space-y-5 sm:space-y-6">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 sm:gap-6">
						{Array.from({ length: 4 }).map((_, index) => (
							<div
								key={index}
								className="h-28 animate-pulse rounded-2xl border border-border/50 bg-surface p-5 shadow-sm">
								<div className="h-3 w-24 rounded-full bg-surfaceVariant" />
								<div className="mt-4 h-8 w-32 rounded-full bg-surfaceVariant" />
								<div className="mt-4 h-10 w-10 rounded-full bg-surfaceVariant" />
							</div>
						))}
					</div>

					<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 sm:gap-8">
						{Array.from({ length: 5 }).map((_, index) => (
							<div
								key={index}
								className="rounded-2xl border border-border/50 bg-surface p-6 shadow-sm">
								<div className="h-4 w-44 animate-pulse rounded-full bg-surfaceVariant" />
								<div className="mt-6 h-56 animate-pulse rounded-2xl bg-surfaceVariant" />
							</div>
						))}
					</div>
				</div>
			) : error ? (
				<div className="rounded-2xl border border-error bg-errorLight p-4 text-sm text-error mx-3 sm:mx-0">
					{error}
				</div>
			) : null}

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 sm:gap-6">
				{summaryCards.map((card) => (
					<div
						key={card.label}
						className="relative overflow-hidden rounded-2xl border border-border/50 bg-surface p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
						<div className="text-xs font-bold uppercase tracking-wider text-textSecondary">
							{card.label}
						</div>
						<div className={`mt-2 text-2xl font-black sm:text-3xl ${card.valueClass}`}>
							{card.value}
						</div>
						<div className={`absolute -right-4 -bottom-4 h-16 w-16 rounded-full ${card.accentClass}`} />
						<div className={`absolute right-5 top-5 h-2.5 w-2.5 rounded-full ${card.iconClass}`} />
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 sm:gap-8">
				{chartConfigs.map((chart) => (
					<ChartCard key={chart.title} title={chart.title} icon={chart.icon}>
						{chart.content}
					</ChartCard>
				))}
			</div>
		</div>
	);
}