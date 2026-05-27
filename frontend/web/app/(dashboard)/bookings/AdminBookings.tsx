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
import { extractErrorMessage, logErrorDetails } from "@/lib/errorUtils";
import { DataTable } from "@/components/ui/DataTable";

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
	item?: {
		title?: string;
		owner?: { name?: string };
	};
	renter?: { name?: string };
	startDate?: string;
	endDate?: string;
	totalPrice?: number | string;
	status?: string;
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

const OVERRIDE_STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
	{ value: "COMPLETED", label: "Complete" },
	{ value: "CANCELLED", label: "Cancel (Admin)" },
	{ value: "REJECTED", label: "Reject" },
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
		bookingId: row.bookingId ?? "",
		itemName: row.item?.title ?? "Unknown item",
		ownerName: row.item?.owner?.name ?? "Unknown owner",
		renterName: row.renter?.name ?? "Unknown renter",
		startDate: row.startDate ?? "",
		endDate: row.endDate ?? "",
		totalPrice: Number(row.totalPrice ?? 0),
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
	const [overrideStatus, setOverrideStatus] = useState<BookingStatus>("COMPLETED");
	const [bookings, setBookings] = useState<BookingRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pageIndex, setPageIndex] = useState(0);
	const [totalPages, setTotalPages] = useState(0);

	const fetchBookings = async (page: number) => {
		try {
			setLoading(true);
			setError(null);

			const response = await api.get(`/bookings?page=${page}&size=10`);
			const raw = response.data;

			const list: BookingApiRow[] = Array.isArray(raw?.content) ? raw.content : [];
			setTotalPages(raw?.totalPages ?? 1);
			setBookings(list.map(normalizeBooking));
		} catch (err) {
			const errorDetails = logErrorDetails(err, {
				endpoint: "/api/bookings",
				action: "Fetch Bookings",
			});
			setError(extractErrorMessage(err));
			setBookings([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchBookings(pageIndex);
	}, [pageIndex]);

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
		const overridable = OVERRIDE_STATUS_OPTIONS.map((o) => o.value);
		setOverrideStatus(overridable.includes(booking.status) ? booking.status : "COMPLETED");
	};

	const overrideActionEndpoint = (status: BookingStatus): string => {
		switch (status) {
			case "COMPLETED": return `/bookings/${overrideId}/complete`;
			case "CANCELLED": return `/bookings/${overrideId}/moderate-cancel`;
			case "REJECTED": return `/bookings/${overrideId}/reject`;
			default: throw new Error(`No admin action endpoint for status: ${status}`);
		}
	};

	const applyOverride = async () => {
		if (overrideId === null) return;

		try {
			setSubmitting(true);
			await api.patch(overrideActionEndpoint(overrideStatus));
			await fetchBookings(pageIndex);
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
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 py-20 text-center">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
				<span className="text-sm text-textSecondary">Loading bookings...</span>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl space-y-6 px-3 pb-6 sm:px-0 sm:pb-0">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="min-w-0">
					<h1 className="text-xl font-bold text-textPrimary sm:text-2xl">
						Booking Monitor
					</h1>
					<p className="mt-1 text-sm text-textSecondary">
						Track all platform bookings and update statuses from the backend.
					</p>
				</div>

				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<button
						onClick={() => fetchBookings(pageIndex)}
						className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-outlineVariant bg-surface px-4 py-2 text-sm font-semibold text-textSecondary transition hover:bg-surfaceVariant sm:w-auto">
						<RefreshCw className="h-4 w-4" />
						Refresh
					</button>

					{overdueCount > 0 && (
						<div className="flex w-full items-center justify-center gap-2 rounded-xl border border-warning/40 bg-warningLight px-4 py-2 text-sm font-bold text-warning shadow-sm sm:w-auto">
							<AlertTriangle className="h-4 w-4" />
							{overdueCount} Overdue
						</div>
					)}
				</div>
			</div>

			{error && (
				<div className="mx-0 rounded-xl border border-error/30 bg-errorLight px-4 py-3 text-sm font-medium text-error sm:mx-0">
					{error}
				</div>
			)}

			<div className="flex flex-col gap-3 sm:flex-row sm:items-start">
				<div className="relative min-w-0 flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textTertiary" />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by booking ID, item, renter, or owner..."
						className="w-full rounded-xl border border-outlineVariant bg-surface py-2.5 pl-9 pr-4 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
					/>
				</div>

				<div className="flex flex-wrap gap-2 sm:justify-end">
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
				<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-4">
					<div className="w-full max-w-sm space-y-4 rounded-2xl border border-borderLight bg-surface p-5 shadow-2xl sm:p-6">
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
							{OVERRIDE_STATUS_OPTIONS.map(({ value, label }) => (
								<option key={value} value={value}>
									{label}
								</option>
							))}
						</select>

						<div className="flex flex-col gap-3 sm:flex-row">
							<button
								onClick={() => setOverrideId(null)}
								className="w-full rounded-xl border border-outlineVariant px-4 py-2.5 text-sm font-semibold text-textSecondary transition hover:bg-surfaceVariant sm:flex-1">
								Cancel
							</button>
							<button
								onClick={applyOverride}
								disabled={submitting}
								className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-onPrimary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1">
								{submitting ? "Applying..." : "Apply Override"}
							</button>
						</div>
					</div>
				</div>
			)}

			<div className="mb-4 px-1 text-xs text-textTertiary sm:px-0">
				Note: Search and filtering apply only to the current page.
			</div>

			<div className="overflow-x-auto rounded-2xl border border-borderLight bg-surface shadow-sm">
				<div className="min-w-full">
					<DataTable
						columns={[
							{
								header: "Booking",
								cell: (b) => (
									<span className="font-mono text-xs font-bold text-textPrimary">
										BK-{b.bookingId}
									</span>
								),
							},
							{
								header: "Item",
								cell: (b) => (
									<div>
										<div className="font-medium text-textPrimary">
											{b.itemName}
										</div>
										<div className="text-xs text-textTertiary">
											Owner: {b.ownerName}
										</div>
									</div>
								),
							},
							{
								header: "Renter",
								accessorKey: "renterName",
							},
							{
								header: "Dates",
								cell: (b) => (
									<div className="text-xs">
										<div>{formatDate(b.startDate)}</div>
										<div className="text-textTertiary">
											→ {formatDate(b.endDate)}
										</div>
									</div>
								),
							},
							{
								header: "Amount",
								cell: (b) => (
									<span className="font-semibold text-textPrimary">
										৳{b.totalPrice}
									</span>
								),
							},
							{
								header: "Status",
								cell: (b) => (
									<span
										className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[b.status]}`}>
										{b.status}
									</span>
								),
							},
							{
								header: "Actions",
								cell: (b) => (
									<div className="flex items-center gap-3">
										<Link
											href={`/bookings/${b.bookingId}`}
											className="text-xs font-bold text-textSecondary transition hover:text-primary">
											View
										</Link>
										<button
											onClick={() => openOverrideModal(b)}
											className="text-xs font-bold text-primary transition hover:underline">
											Override
										</button>
									</div>
								),
							},
						]}
						data={filteredBookings}
						pageIndex={pageIndex}
						totalPages={totalPages}
						onPageChange={setPageIndex}
						isLoading={loading}
						emptyMessage="No bookings match your filter."
						emptyDescription="Try adjusting your search query or status filter."
					/>
				</div>
			</div>
		</div>
	);
}
