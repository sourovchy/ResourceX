"use client";

import React from "react";
import {
	BarChart3,
	TrendingUp,
	Users,
	PieChart,
	Clock,
	CheckCircle2,
} from "lucide-react";

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

// 2. BAR CHART COMPONENT
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
		<div className="flex items-end gap-3 h-44 mt-6 px-2 border-b border-divider">
			{data.map((d) => (
				<div
					key={d.label}
					className="flex-1 flex flex-col items-center gap-2 group relative">
					<span className="absolute -top-6 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
						{d.value}
					</span>
					<div
						className={`w-full rounded-t-lg ${getTailwindColor(color)} transition-all duration-700 ease-out hover:brightness-110 shadow-sm`}
						style={{ height: `${(d.value / maxVal) * 100}%` }}
					/>
					<span className="text-[10px] font-medium text-textTertiary truncate w-full text-center pb-2">
						{d.label}
					</span>
				</div>
			))}
		</div>
	);
}

// 3. HORIZONTAL BAR CHART
function HBarChart({
	data,
	maxVal,
}: {
	data: { label: string; value: number; color: string }[];
	maxVal: number;
}) {
	return (
		<div className="space-y-5 mt-6">
			{data.map((d) => (
				<div key={d.label} className="group">
					<div className="flex justify-between text-xs mb-1.5">
						<span className="font-medium text-textSecondary group-hover:text-textPrimary">
							{d.label}
						</span>
						<span className="font-bold text-textPrimary">{d.value}</span>
					</div>
					<div className="bg-surfaceVariant rounded-full h-2.5 overflow-hidden">
						<div
							className={`h-full rounded-full ${getTailwindColor(d.color)} transition-all duration-1000 ease-in-out`}
							style={{ width: `${(d.value / maxVal) * 100}%` }}
						/>
					</div>
				</div>
			))}
		</div>
	);
}

// 4. DONUT CHART (CSS Mask Based)
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

	const gradient = slices
		.map((s) => {
			const start = cumulative;
			cumulative += s.pct;
			const color = colorMap[s.color] || "#ccc";
			return `${color} ${start}% ${cumulative}%`;
		})
		.join(", ");

	return (
		<div className="flex flex-col sm:flex-row items-center gap-10 mt-6">
			<div
				className="w-32 h-32 rounded-full shrink-0 relative shadow-md transition-transform hover:scale-105 duration-300"
				style={{
					background: `conic-gradient(${gradient})`,
					maskImage: "radial-gradient(transparent 55%, black 56%)",
					WebkitMaskImage: "radial-gradient(transparent 55%, black 56%)",
				}}
			/>
			<div className="flex-1 space-y-2 w-full">
				{slices.map((s) => (
					<div
						key={s.label}
						className="flex items-center gap-3 p-1.5 hover:bg-surfaceVariant rounded-lg transition-colors">
						<div
							className={`w-3 h-3 rounded-full shrink-0 ${getTailwindColor(s.color)}`}
						/>
						<span className="text-xs text-textSecondary font-medium">
							{s.label}
						</span>
						<span className="text-xs font-bold text-textPrimary ml-auto">
							{s.pct}%
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

// 5. CHART CARD WRAPPER
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
		<div className="bg-surface border border-border/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6">
			<h2 className="font-bold text-textPrimary flex items-center gap-2.5 text-sm uppercase tracking-wider">
				<span className="p-2 bg-surfaceVariant rounded-lg">{icon}</span>
				{title}
			</h2>
			{children}
		</div>
	);
}

// 6. MAIN COMPONENT
export default function AdminAnalyticsPage() {
	// Data (Keep these inside or move to a separate file)
	const TOP_ITEMS = [
		{ label: "DSLR Kit", value: 82 },
		{ label: "Arduino", value: 67 },
		{ label: "Projector", value: 54 },
		{ label: "Mic Set", value: 43 },
		{ label: "Textbooks", value: 38 },
	];

	const MONTHLY_REVENUE = [
		{ label: "Jan", value: 14200 },
		{ label: "Feb", value: 18400 },
		{ label: "Mar", value: 22100 },
		{ label: "Apr", value: 19800 },
		{ label: "May", value: 26700 },
		{ label: "Jun", value: 31200 },
		{ label: "Jul", value: 28400 },
	];

	const LATE_RETURNS = [
		{ label: "Arif Hossain", value: 5, color: "bg-error" },
		{ label: "Priya Sen", value: 4, color: "bg-warning" },
		{ label: "Mehedi Islam", value: 3, color: "bg-warning" },
		{ label: "Tanvir Ahmed", value: 3, color: "bg-warningDark" },
		{ label: "Rafi Uddin", value: 2, color: "bg-textTertiary" },
	];

	const BOOKING_RATIO = [
		{ label: "Completed", pct: 68, color: "bg-success" },
		{ label: "Active", pct: 21, color: "bg-primary" },
		{ label: "Cancelled", pct: 7, color: "bg-error" },
		{ label: "Pending", pct: 4, color: "bg-warning" },
	];

	const CATEGORY_SLICES = [
		{ label: "Electronics", pct: 35, color: "bg-blue-500" },
		{ label: "Books", pct: 22, color: "bg-accent" },
		{ label: "Lab Equipment", pct: 18, color: "bg-primary" },
		{ label: "Audio/Visual", pct: 15, color: "bg-warning" },
	];

	return (
		<div className="max-w-7xl mx-auto space-y-8 pb-10">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">
					Analytics
				</h1>
				<p className="text-textSecondary text-sm mt-1">
					Platform-wide insights and performance metrics for the current period.
				</p>
			</div>

			{/* Summary Stats Strip */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{[
					{
						label: "Total Revenue",
						value: "৳ 1,60,800",
						color: "text-success",
						bg: "bg-success/10",
					},
					{
						label: "Avg Rental / Day",
						value: "৳ 380",
						color: "text-primary",
						bg: "bg-primary/10",
					},
					{
						label: "Late Return Rate",
						value: "8.4%",
						color: "text-warning",
						bg: "bg-warning/10",
					},
					{
						label: "Dispute Rate",
						value: "1.2%",
						color: "text-error",
						bg: "bg-error/10",
					},
				].map((s) => (
					<div
						key={s.label}
						className="bg-surface border border-border/50 rounded-2xl p-5 shadow-sm overflow-hidden relative">
						<div className="text-xs text-textSecondary font-bold uppercase tracking-wider">
							{s.label}
						</div>
						<div className={`text-3xl font-black mt-2 ${s.color}`}>
							{s.value}
						</div>
						<div
							className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full ${s.bg}`}
						/>
					</div>
				))}
			</div>

			{/* Charts Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<ChartCard
					title="Top 5 Most Rented Items"
					icon={<BarChart3 className="w-4 h-4 text-primary" />}>
					<BarChart data={TOP_ITEMS} maxVal={100} color="bg-primary" />
				</ChartCard>

				<ChartCard
					title="Monthly Rental Revenue (৳)"
					icon={<TrendingUp className="w-4 h-4 text-success" />}>
					<BarChart data={MONTHLY_REVENUE} maxVal={35000} color="bg-success" />
				</ChartCard>

				<ChartCard
					title="Late Return Stats by User"
					icon={<Clock className="w-4 h-4 text-warning" />}>
					<HBarChart data={LATE_RETURNS} maxVal={6} />
				</ChartCard>

				<ChartCard
					title="Booking Status Distribution"
					icon={<CheckCircle2 className="w-4 h-4 text-accent" />}>
					<DonutChart slices={BOOKING_RATIO} />
				</ChartCard>

				<ChartCard
					title="Category Distribution"
					icon={<PieChart className="w-4 h-4 text-textSecondary" />}>
					<DonutChart slices={CATEGORY_SLICES} />
				</ChartCard>
			</div>
		</div>
	);
}
