"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
	Search,
	CalendarCheck,
	AlertTriangle,
	Loader2,
	X,
	RefreshCw,
} from "lucide-react";
import api from "@/lib/api";

type FilterType =
	| "ALL"
	| "ACTIVE"
	| "OVERDUE"
	| "COMPLETED"
	| "PENDING"
	| "CANCELLED"
	| "REJECTED";

type BookingStatus =
	| "ACTIVE"
	| "OVERDUE"
	| "COMPLETED"
	| "PENDING"
	| "CANCELLED"
	| "REJECTED";

interface BookingRow {
	bookingId: string | number;
	itemName: string;
	ownerName: string;
	renterName: string;
	startDate: string;
	endDate: string;
	totalPrice: number;
	status: BookingStatus;
}

interface BookingApiRow {
	bookingId?: string | number;
	id?: string | number;
	itemName?: string;
	item?: {
		name?: string;
	};
	ownerName?: string;
	owner?: {
		name?: string;
	};
	renterName?: string;
	renter?: {
		name?: string;
	};
	startDate?: string;
	endDate?: string;
	bookingStartDate?: string;
	bookingEndDate?: string;
	totalPrice?: number | string;
	amount?: number | string;
	status?: string;
	createdAt?: string;
	updatedAt?: string;
}

const STATUS_STYLES: Record<string, string> = {
	ACTIVE: "bg-primaryLight text-primary",
	OVERDUE: "bg-warningLight text-warning",
	COMPLETED: "bg-successLight text-success",
	PENDING: "bg-surfaceVariant text-textSecondary",
	CANCELLED: "bg-errorLight text-error",
	REJECTED: "bg-errorLight text-error",
};

const FILTERS: FilterType[] = [
	"ALL",
	"ACTIVE",
	"OVERDUE",
	"COMPLETED",
	"PENDING",
	"CANCELLED",
	"REJECTED",
];

const STATUS_OPTIONS: BookingStatus[] = [
	"ACTIVE",
	"OVERDUE",
	"COMPLETED",
	"PENDING",
	"CANCELLED",
	"REJECTED",
];

function normalizeStatus(status?: string): BookingStatus {
	const value = (status ?? "PENDING").toUpperCase();
	if (
		value === "ACTIVE" ||
		value === "OVERDUE" ||
		value === "COMPLETED" ||
		value === "PENDING" ||
		value === "CANCELLED" ||
		value === "REJECTED"
	) {
		return value;
	}
	return "PENDING";
}

function normalizeBooking(row: BookingApiRow): BookingRow {
	return {
		bookingId: row.bookingId ?? row.id ?? "",
		itemName: row.itemName ?? row.item?.name ?? "Unknown item",
		ownerName: row.ownerName ?? row.owner?.name ?? "Unknown owner",
		renterName: row.renterName ?? row.renter?.name ?? "Unknown renter",
		startDate: row.startDate ?? row.bookingStartDate ?? row.createdAt ?? "",
		endDate: row.endDate ?? row.bookingEndDate ?? row.updatedAt ?? "",
		totalPrice: Number(row.totalPrice ?? row.amount ?? 0),
		status: normalizeStatus(row.status),
	};
}

function formatDate(value: string) {
	if (!value) return "-";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "-";
	return date.toLocaleDateString();
}

export default function AdminBookingsPage() {
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<FilterType>("ALL");
	const [overrideId, setOverrideId] = useState<string | number | null>(null);
	const [overrideStatus, setOverrideStatus] = useState<BookingStatus>("ACTIVE");
	const [bookings, setBookings] = useState<BookingRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchBookings = async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await api.get("/bookings");
			const raw = response.data;

			const list: BookingApiRow[] = Array.isArray(raw)
				? raw
				: Array.isArray(raw?.data)
					? raw.data
					: Array.isArray(raw?.content)
						? raw.content
						: [];

			setBookings(list.map(normalizeBooking));
		} catch (err) {
			console.error(err);
			setError("Failed to load bookings. Please try again.");
			setBookings([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchBookings();
	}, []);

	const filteredBookings = useMemo(() => {
		const searchStr = search.trim().toLowerCase();

		return bookings
			.filter((b) => {
				const matchSearch =
					searchStr.length === 0 ||
					b.bookingId.toString().toLowerCase().includes(searchStr) ||
					b.itemName.toLowerCase().includes(searchStr) ||
					b.renterName.toLowerCase().includes(searchStr) ||
					b.ownerName.toLowerCase().includes(searchStr);

				const matchFilter = filter === "ALL" || b.status === filter;
				return matchSearch && matchFilter;
			})
			.sort((a, b) => {
				const aTime = new Date(a.startDate || 0).getTime();
				const bTime = new Date(b.startDate || 0).getTime();
				return bTime - aTime;
			});
	}, [bookings, search, filter]);

	const overdueCount = useMemo(
		() => bookings.filter((b) => b.status === "OVERDUE").length,
		[bookings],
	);

	const openOverrideModal = (booking: BookingRow) => {
		setOverrideId(booking.bookingId);
		setOverrideStatus(booking.status);
	};

	const applyOverride = async () => {
		if (overrideId === null) return;

		try {
			setSubmitting(true);
			await api.patch(`/bookings/${overrideId}/status`, {
				status: overrideStatus,
			});
			await fetchBookings();
			setOverrideId(null);
		} catch (err) {
			console.error(err);
			setError("Could not update booking status.");
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl space-y-6">
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary">
						Booking Monitor
					</h1>
					<p className="mt-1 text-sm text-textSecondary">
						Track all platform bookings and update statuses from the backend.
					</p>
				</div>

				<div className="flex items-center gap-3">
					<button
						onClick={fetchBookings}
						className="inline-flex items-center gap-2 rounded-xl border border-outlineVariant bg-surface px-4 py-2 text-sm font-semibold text-textSecondary transition hover:bg-surfaceVariant">
						<RefreshCw className="h-4 w-4" />
						Refresh
					</button>

					{overdueCount > 0 && (
						<div className="flex items-center gap-2 rounded-xl border border-warning/40 bg-warningLight px-4 py-2 text-sm font-bold text-warning shadow-sm">
							<AlertTriangle className="h-4 w-4" />
							{overdueCount} Overdue
						</div>
					)}
				</div>
			</div>

			{error && (
				<div className="rounded-xl border border-error/30 bg-errorLight px-4 py-3 text-sm font-medium text-error">
					{error}
				</div>
			)}

			<div className="flex flex-col gap-3 sm:flex-row">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textTertiary" />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by booking ID, item, renter, or owner..."
						className="w-full rounded-xl border border-outlineVariant bg-surface py-2.5 pl-9 pr-4 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
					/>
				</div>

				<div className="flex flex-wrap gap-2">
					{FILTERS.map((f) => (
						<button
							key={f}
							onClick={() => setFilter(f)}
							className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
								filter === f
									? f === "OVERDUE"
										? "border-warning bg-warning text-white shadow"
										: "border-primary bg-primary text-onPrimary shadow"
									: "border-outlineVariant bg-surface text-textSecondary hover:bg-surfaceVariant"
							}`}>
							{f}
						</button>
					))}
				</div>
			</div>

			{overrideId !== null && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="w-full max-w-sm space-y-4 rounded-2xl border border-borderLight bg-surface p-6 shadow-2xl">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-bold text-textPrimary">
								Override Status
							</h3>
							<button onClick={() => setOverrideId(null)}>
								<X className="h-5 w-5 text-textTertiary transition hover:text-textPrimary" />
							</button>
						</div>

						<p className="text-sm text-textSecondary">
							Select a new status for booking{" "}
							<span className="font-bold text-textPrimary">{overrideId}</span>
						</p>

						<select
							value={overrideStatus}
							onChange={(e) =>
								setOverrideStatus(e.target.value as BookingStatus)
							}
							className="w-full rounded-xl border border-outlineVariant bg-surfaceVariant px-3 py-2.5 text-sm text-textPrimary outline-none focus:ring-2 focus:ring-primary">
							{STATUS_OPTIONS.map((s) => (
								<option key={s} value={s}>
									{s}
								</option>
							))}
						</select>

						<div className="flex gap-3">
							<button
								onClick={() => setOverrideId(null)}
								className="flex-1 rounded-xl border border-outlineVariant px-4 py-2.5 text-sm font-semibold text-textSecondary transition hover:bg-surfaceVariant">
								Cancel
							</button>
							<button
								onClick={applyOverride}
								disabled={submitting}
								className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-onPrimary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
								{submitting ? "Applying..." : "Apply Override"}
							</button>
						</div>
					</div>
				</div>
			)}

			<div className="overflow-hidden rounded-2xl border border-borderLight bg-surface shadow-sm">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
						<tr className="border-b border-borderLight bg-surfaceVariant/60">
							<th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-textTertiary">
								Booking
							</th>
							<th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-textTertiary">
								Item
							</th>
							<th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-textTertiary">
								Renter
							</th>
							<th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-textTertiary">
								Dates
							</th>
							<th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-textTertiary">
								Amount
							</th>
							<th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-textTertiary">
								Status
							</th>
							<th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-textTertiary">
								Actions
							</th>
						</tr>
						</thead>

						<tbody className="divide-y divide-borderLight">
						{filteredBookings.map((b) => (
							<tr
								key={b.bookingId}
								className={`transition-colors hover:bg-surfaceVariant/40 ${
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
									<div>{formatDate(b.startDate)}</div>
									<div className="text-textTertiary">→ {formatDate(b.endDate)}</div>
								</td>

								<td className="px-5 py-3.5 font-semibold text-textPrimary">
									৳{b.totalPrice}
								</td>

								<td className="px-5 py-3.5">
										<span
											className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[b.status]}`}>
											{b.status}
										</span>
								</td>

								<td className="px-5 py-3.5">
									<div className="flex items-center justify-end gap-3">
										<Link
											href={`/admin/bookings/${b.bookingId}`}
											className="text-xs font-bold text-textSecondary transition hover:text-primary">
											View
										</Link>
										<button
											onClick={() => openOverrideModal(b)}
											className="text-xs font-bold text-primary transition hover:underline">
											Override
										</button>
									</div>
								</td>
							</tr>
						))}
						</tbody>
					</table>

					{filteredBookings.length === 0 && (
						<div className="py-16 text-center text-textTertiary">
							<CalendarCheck className="mx-auto mb-2 h-8 w-8 opacity-40" />
							No bookings match your filter.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}