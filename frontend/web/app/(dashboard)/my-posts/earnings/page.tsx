"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
	ArrowUpRight,
	BarChart3,
	Clock,
	DollarSign,
	Loader2,
	TrendingUp,
} from "lucide-react";
import api from "@/lib/api";
import { extractErrorMessage } from "@/lib/errorUtils";
import { formatDateRange } from "@/lib/dateUtils";

// ── Helpers ──────────────────────────────────────────────────────────────────

const money = (n: number) =>
	`৳ ${new Intl.NumberFormat("en-BD").format(Math.round(n))}`;

function monthKey(dateStr?: string): string {
	if (!dateStr) return "Unknown";
	const d = new Date(dateStr);
	return Number.isNaN(d.getTime())
		? "Unknown"
		: new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(d);
}

function rentalDays(startDate?: string, endDate?: string): number {
	if (!startDate || !endDate) return 0;
	const diff = Math.round(
		(new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000,
	);
	return Math.max(diff + 1, 0);
}

// ── Component ─────────────────────────────────────────────────────────────────

type EarningsRow = {
	bookingId: number;
	itemTitle: string;
	startDate: string;
	endDate: string;
	days: number;
	totalPrice: number;
	status: string;
	month: string;
};

export default function EarningsPage() {
	const [rows, setRows] = useState<EarningsRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		setLoading(true);
		setError("");

		api.get("/bookings/owner")
			.then((res) => {
				const all: any[] = Array.isArray(res.data) ? res.data : [];
				setRows(
					all.map((b) => ({
						bookingId: b.bookingId,
						itemTitle: b.item?.title ?? "Untitled",
						startDate: b.startDate ?? "",
						endDate: b.endDate ?? "",
						days: rentalDays(b.startDate, b.endDate),
						totalPrice: Number(b.totalPrice ?? 0),
						status: (b.status ?? "").toUpperCase(),
						month: monthKey(b.startDate),
					})),
				);
			})
			.catch((err) => setError(extractErrorMessage(err)))
			.finally(() => setLoading(false));
	}, []);

	const stats = useMemo(() => {
		const completed = rows.filter((r) => r.status === "COMPLETED");
		const pending   = rows.filter((r) => r.status === "APPROVED" || r.status === "PENDING");
		return {
			totalEarned:  completed.reduce((s, r) => s + r.totalPrice, 0),
			pendingPayout: pending.reduce((s, r) => s + r.totalPrice, 0),
			completedCount: completed.length,
		};
	}, [rows]);

	const monthlySeries = useMemo(() => {
		const map = new Map<string, number>();
		rows
			.filter((r) => r.status === "COMPLETED")
			.forEach((r) => map.set(r.month, (map.get(r.month) ?? 0) + r.totalPrice));
		return Array.from(map.entries()).map(([label, amount]) => ({ label, amount }));
	}, [rows]);

	const completedRows = rows.filter((r) => r.status === "COMPLETED");

	if (loading) {
		return (
			<div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="text-sm font-medium text-textSecondary">
					Loading your earnings…
				</p>
			</div>
		);
	}

	return (
		<div className="w-full space-y-5 px-3 pb-16 sm:px-4 sm:pb-20 lg:px-0">
			<div className="space-y-0.5">
				<h1 className="text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
					Earnings Dashboard
				</h1>
				<p className="text-sm text-textSecondary">
					Your rental income summary from completed bookings.
				</p>
			</div>

			{error && (
				<div className="rounded-xl bg-errorLight px-4 py-3 text-sm font-semibold text-error">
					{error}
				</div>
			)}

			{/* Stat cards */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{[
					{
						icon: <DollarSign className="h-5 w-5" />,
						iconBg: "bg-successLight text-success",
						label: "Total Earned",
						value: money(stats.totalEarned),
					},
					{
						icon: <Clock className="h-5 w-5" />,
						iconBg: "bg-primaryLight text-primary",
						label: "Pending Payout",
						value: money(stats.pendingPayout),
					},
					{
						icon: <TrendingUp className="h-5 w-5" />,
						iconBg: "bg-warningLight text-warning",
						label: "Completed Rentals",
						value: String(stats.completedCount),
					},
				].map(({ icon, iconBg, label, value }) => (
					<div
						key={label}
						className="rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6">
						<div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
							{icon}
						</div>
						<p className="mb-1 text-xs font-bold uppercase tracking-wider text-textSecondary">
							{label}
						</p>
						<p className="text-2xl font-extrabold text-textPrimary sm:text-3xl">
							{value}
						</p>
					</div>
				))}
			</div>

			{rows.length === 0 && !error && (
				<div className="rounded-2xl border border-borderLight bg-surface p-8 text-center text-sm text-textSecondary">
					No earnings data yet. Completed rentals will appear here.
				</div>
			)}

			{/* Monthly bar chart */}
			{monthlySeries.length > 0 && (
				<div className="rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6">
					<div className="mb-4 flex items-center gap-2">
						<BarChart3 className="h-5 w-5 text-primary" />
						<h2 className="font-bold text-textPrimary">Monthly Earnings</h2>
					</div>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{monthlySeries.map((entry) => {
							const max = Math.max(...monthlySeries.map((e) => e.amount), 1);
							const pct = Math.max((entry.amount / max) * 100, 6);
							return (
								<div key={entry.label} className="rounded-xl bg-surfaceVariant p-3">
									<div className="mb-2 flex items-center justify-between text-xs font-semibold text-textSecondary">
										<span className="truncate">{entry.label}</span>
										<span>{money(entry.amount)}</span>
									</div>
									<div className="h-2 w-full rounded-full bg-borderLight">
										<div
											className="h-2 rounded-full bg-primary"
											style={{ width: `${pct}%` }}
										/>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Per-rental breakdown */}
			{completedRows.length > 0 && (
				<div className="rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6">
					<h2 className="mb-4 font-bold text-textPrimary">Completed Rentals</h2>
					<div className="divide-y divide-borderLight">
						{completedRows.map((row) => (
							<div
								key={row.bookingId}
								className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="min-w-0">
									<p className="truncate text-sm font-bold text-textPrimary">
										{row.itemTitle}
									</p>
									<p className="text-xs text-textSecondary">
										{formatDateRange(row.startDate, row.endDate)}
										{row.days > 0 && ` · ${row.days} day${row.days !== 1 ? "s" : ""}`}
									</p>
								</div>
								<p className="font-extrabold text-success">{money(row.totalPrice)}</p>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
