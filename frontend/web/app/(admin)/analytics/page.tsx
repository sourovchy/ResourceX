"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios, { AxiosError } from "axios";
import {
	BarChart3,
	TrendingUp,
	PieChart,
	Clock,
	CheckCircle2,
	Loader2,
	RefreshCw,
} from "lucide-react";

type ApiError = {
	message?: string;
};

type ChartItem = {
	label: string;
	value: number;
};

type ChartBarItem = {
	label: string;
	value: number;
	color: string;
};

type DonutSlice = {
	label: string;
	pct: number;
	color: string;
};

type AnalyticsResponse = {
	summary?: {
		totalRevenue?: number;
		averageRentalPerDay?: number;
		lateReturnRate?: number;
		disputeRate?: number;
	};
	topItems?: ChartItem[];
	monthlyRevenue?: ChartItem[];
	lateReturns?: ChartBarItem[];
	bookingRatio?: DonutSlice[];
	categoryDistribution?: DonutSlice[];
};

const api = axios.create({
	baseURL:
		process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
		"http://localhost:8082",
	headers: {
		"Content-Type": "application/json",
	},
});

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

function formatNumber(value?: number) {
	return new Intl.NumberFormat("en-US").format(value ?? 0);
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
		<div className="mt-6 flex h-44 items-end gap-3 border-b border-divider px-2">
			{data.length === 0 ? (
				<div className="flex h-full w-full items-center justify-center text-sm text-textSecondary">
					No data available
				</div>
			) : (
				data.map((d) => (
					<div
						key={d.label}
						className="group relative flex flex-1 flex-col items-center gap-2">
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
						<span className="w-full truncate pb-2 text-center text-[10px] font-medium text-textTertiary">
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
		<div className="mt-6 space-y-5">
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
		<div className="mt-6 flex flex-col items-center gap-10 sm:flex-row">
			<div
				className="relative h-32 w-32 shrink-0 rounded-full shadow-md transition-transform duration-300 hover:scale-105"
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
		<div className="rounded-2xl border border-border/50 bg-surface p-6 shadow-sm transition-shadow hover:shadow-md">
			<h2 className="flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-textPrimary">
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

	const authHeaders = useMemo(() => {
		if (typeof window === "undefined") return {};
		const token = localStorage.getItem("accessToken");
		return token ? { Authorization: `Bearer ${token}` } : {};
	}, []);

	const loadAnalytics = async () => {
		try {
			setError("");

			// Adjust this endpoint only if your backend controller uses a different mapping.
			const { data } = await api.get<AnalyticsResponse>(
				"/api/admin/analytics",
				{
					headers: authHeaders,
				},
			);

			setAnalytics(data);
		} catch (err) {
			const axiosError = err as AxiosError<ApiError>;
			setError(
				axiosError.response?.data?.message ||
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

	return (
		<div className="mx-auto max-w-7xl space-y-8 pb-10">
			<div className="flex items-center justify-between gap-3">
				<div>
					<h1 className="text-3xl font-extrabold tracking-tight text-textPrimary">
						Analytics
					</h1>
					<p className="mt-1 text-sm text-textSecondary">
						Platform-wide insights and performance metrics for the current period.
					</p>
				</div>

				<button
					type="button"
					onClick={handleRefresh}
					disabled={refreshing}
					className="inline-flex items-center gap-2 rounded-xl border border-borderLight bg-surface px-4 py-2 text-sm font-semibold text-textPrimary shadow-sm transition hover:bg-background disabled:opacity-60">
					{refreshing ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<RefreshCw className="h-4 w-4" />
					)}
					Refresh
				</button>
			</div>

			{loading ? (
				<div className="rounded-2xl border border-borderLight bg-surface p-8 text-center text-textSecondary shadow-sm">
					<Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-primary" />
					Loading analytics...
				</div>
			) : error ? (
				<div className="rounded-2xl border border-error bg-errorLight p-4 text-sm text-error">
					{error}
				</div>
			) : null}

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<div className="relative overflow-hidden rounded-2xl border border-border/50 bg-surface p-5 shadow-sm">
					<div className="text-xs font-bold uppercase tracking-wider text-textSecondary">
						Total Revenue
					</div>
					<div className="mt-2 text-3xl font-black text-success">
						{formatCurrency(summary?.totalRevenue)}
					</div>
					<div className="absolute -right-4 -bottom-4 h-16 w-16 rounded-full bg-success/10" />
				</div>

				<div className="relative overflow-hidden rounded-2xl border border-border/50 bg-surface p-5 shadow-sm">
					<div className="text-xs font-bold uppercase tracking-wider text-textSecondary">
						Avg Rental / Day
					</div>
					<div className="mt-2 text-3xl font-black text-primary">
						{formatCurrency(summary?.averageRentalPerDay)}
					</div>
					<div className="absolute -right-4 -bottom-4 h-16 w-16 rounded-full bg-primary/10" />
				</div>

				<div className="relative overflow-hidden rounded-2xl border border-border/50 bg-surface p-5 shadow-sm">
					<div className="text-xs font-bold uppercase tracking-wider text-textSecondary">
						Late Return Rate
					</div>
					<div className="mt-2 text-3xl font-black text-warning">
						{summary?.lateReturnRate ?? 0}%
					</div>
					<div className="absolute -right-4 -bottom-4 h-16 w-16 rounded-full bg-warning/10" />
				</div>

				<div className="relative overflow-hidden rounded-2xl border border-border/50 bg-surface p-5 shadow-sm">
					<div className="text-xs font-bold uppercase tracking-wider text-textSecondary">
						Dispute Rate
					</div>
					<div className="mt-2 text-3xl font-black text-error">
						{summary?.disputeRate ?? 0}%
					</div>
					<div className="absolute -right-4 -bottom-4 h-16 w-16 rounded-full bg-error/10" />
				</div>
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
				<ChartCard
					title="Top 5 Most Rented Items"
					icon={<BarChart3 className="w-4 h-4 text-primary" />}>
					<BarChart
						data={topItems}
						maxVal={Math.max(...topItems.map((d) => d.value), 1)}
						color="bg-primary"
					/>
				</ChartCard>

				<ChartCard
					title="Monthly Rental Revenue (৳)"
					icon={<TrendingUp className="w-4 h-4 text-success" />}>
					<BarChart
						data={monthlyRevenue}
						maxVal={Math.max(...monthlyRevenue.map((d) => d.value), 1)}
						color="bg-success"
					/>
				</ChartCard>

				<ChartCard
					title="Late Return Stats by User"
					icon={<Clock className="w-4 h-4 text-warning" />}>
					<HBarChart
						data={lateReturns}
						maxVal={Math.max(...lateReturns.map((d) => d.value), 1)}
					/>
				</ChartCard>

				<ChartCard
					title="Booking Status Distribution"
					icon={<CheckCircle2 className="w-4 h-4 text-accent" />}>
					<DonutChart slices={bookingRatio} />
				</ChartCard>

				<ChartCard
					title="Category Distribution"
					icon={<PieChart className="w-4 h-4 text-textSecondary" />}>
					<DonutChart slices={categoryDistribution} />
				</ChartCard>
			</div>
		</div>
	);
}