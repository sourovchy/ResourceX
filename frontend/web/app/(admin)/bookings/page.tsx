"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
	Search,
	CalendarCheck,
	AlertTriangle,
	Eye,
	ChevronDown,
	X,
	Loader2,
} from "lucide-react";
import api from "@/lib/api";

type FilterType =
	| "ALL"
	| "ACTIVE"
	| "OVERDUE"
	| "COMPLETED"
	| "PENDING"
	| "CANCELLED";

const STATUS_STYLES: Record<string, string> = {
	ACTIVE: "bg-primaryLight text-primary",
	OVERDUE: "bg-warningLight text-warning",
	COMPLETED: "bg-successLight text-success",
	PENDING: "bg-surfaceVariant text-textSecondary",
	CANCELLED: "bg-errorLight text-error",
	REJECTED: "bg-errorLight text-error",
};

export default function AdminBookingsPage() {
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<FilterType>("ALL");
	const [overrideId, setOverrideId] = useState<string | null>(null);
	const [bookings, setBookings] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchBookings = async () => {
		try {
			setLoading(true);
			const response = await api.get("/bookings");
			setBookings(response.data);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchBookings();
	}, []);

	const filtered = bookings.filter((b) => {
		const searchStr = search.toLowerCase();
		const matchSearch =
			b.bookingId?.toString().toLowerCase().includes(searchStr) ||
			b.itemName?.toLowerCase().includes(searchStr) ||
			b.renterName?.toLowerCase().includes(searchStr);
		const matchFilter = filter === "ALL" || b.status === filter;
		return matchSearch && matchFilter;
	});

	const overdueCount = bookings.filter((b) => b.status === "OVERDUE").length;

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary">
						Booking Monitor
					</h1>
					<p className="text-textSecondary text-sm mt-1">
						Track all platform bookings and override statuses when needed.
					</p>
				</div>
				{overdueCount > 0 && (
					<div className="flex items-center gap-2 bg-warningLight border border-warning/40 text-warning px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
						<AlertTriangle className="w-4 h-4" />
						{overdueCount} Overdue
					</div>
				)}
			</div>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textTertiary" />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by booking ID, item, or renter..."
						className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outlineVariant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textPrimary text-sm"
					/>
				</div>
				<div className="flex flex-wrap gap-2">
					{(
						[
							"ALL",
							"ACTIVE",
							"OVERDUE",
							"COMPLETED",
							"PENDING",
							"CANCELLED",
						] as FilterType[]
					).map((f) => (
						<button
							key={f}
							onClick={() => setFilter(f)}
							className={`px-3 py-2 rounded-xl text-xs font-semibold transition border ${
								filter === f
									? f === "OVERDUE"
										? "bg-warning text-white border-warning shadow"
										: "bg-primary text-onPrimary border-primary shadow"
									: "bg-surface border-outlineVariant text-textSecondary hover:bg-surfaceVariant"
							}`}>
							{f}
						</button>
					))}
				</div>
			</div>

			{/* Override Status Modal */}
			{overrideId && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
					<div className="bg-surface border border-borderLight rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-bold text-textPrimary">
								Override Status
							</h3>
							<button onClick={() => setOverrideId(null)}>
								<X className="w-5 h-5 text-textTertiary hover:text-textPrimary transition" />
							</button>
						</div>
						<p className="text-sm text-textSecondary">
							Select new status for booking{" "}
							<span className="font-bold text-textPrimary">{overrideId}</span>
						</p>
						<select className="w-full px-3 py-2.5 bg-surfaceVariant border border-outlineVariant rounded-xl text-sm text-textPrimary focus:ring-2 focus:ring-primary outline-none">
							{["ACTIVE", "COMPLETED", "CANCELLED", "PENDING"].map((s) => (
								<option key={s} value={s}>
									{s}
								</option>
							))}
						</select>
						<div className="flex gap-3">
							<button
								onClick={() => setOverrideId(null)}
								className="flex-1 py-2.5 rounded-xl border border-outlineVariant text-textSecondary font-semibold text-sm hover:bg-surfaceVariant transition">
								Cancel
							</button>
							<button
								onClick={() => setOverrideId(null)}
								className="flex-1 py-2.5 rounded-xl bg-primary text-onPrimary font-bold text-sm hover:opacity-90 transition">
								Apply Override
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Table */}
			<div className="bg-surface border border-borderLight rounded-2xl shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-borderLight bg-surfaceVariant/60">
								<th className="px-5 py-3.5 text-left text-xs font-bold text-textTertiary uppercase tracking-wider">
									Booking
								</th>
								<th className="px-5 py-3.5 text-left text-xs font-bold text-textTertiary uppercase tracking-wider">
									Item
								</th>
								<th className="px-5 py-3.5 text-left text-xs font-bold text-textTertiary uppercase tracking-wider">
									Renter
								</th>
								<th className="px-5 py-3.5 text-left text-xs font-bold text-textTertiary uppercase tracking-wider">
									Dates
								</th>
								<th className="px-5 py-3.5 text-left text-xs font-bold text-textTertiary uppercase tracking-wider">
									Amount
								</th>
								<th className="px-5 py-3.5 text-left text-xs font-bold text-textTertiary uppercase tracking-wider">
									Status
								</th>
								<th className="px-5 py-3.5 text-right text-xs font-bold text-textTertiary uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-borderLight">
							{filtered.map((b) => (
								<tr
									key={b.bookingId}
									className={`hover:bg-surfaceVariant/40 transition-colors ${
										b.status === "OVERDUE" ? "bg-warningLight/20" : ""
									}`}>
									<td className="px-5 py-3.5 font-mono text-xs font-bold text-textPrimary">
										BK-{b.bookingId}
									</td>
									<td className="px-5 py-3.5">
										<div className="font-medium text-textPrimary">
											{b.itemName}
										</div>
										<div className="text-xs text-textTertiary">
											Owner: {b.ownerName}
										</div>
									</td>
									<td className="px-5 py-3.5 text-textSecondary">
										{b.renterName}
									</td>
									<td className="px-5 py-3.5 text-xs text-textSecondary">
										<div>{new Date(b.startDate).toLocaleDateString()}</div>
										<div className="text-textTertiary">
											→ {new Date(b.endDate).toLocaleDateString()}
										</div>
									</td>
									<td className="px-5 py-3.5 font-semibold text-textPrimary">
										৳{b.totalPrice}
									</td>
									<td className="px-5 py-3.5">
										<span
											className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[b.status]}`}>
											{b.status}
										</span>
									</td>
									<td className="px-5 py-3.5">
										<div className="flex items-center justify-end gap-2">
											<button
												onClick={() => setOverrideId(b.bookingId)}
												className="text-xs font-bold text-primary hover:underline">
												Override
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					{filtered.length === 0 && (
						<div className="py-16 text-center text-textTertiary">
							<CalendarCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
							No bookings match your filter.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
