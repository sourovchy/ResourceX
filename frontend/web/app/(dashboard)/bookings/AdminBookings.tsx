"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
	Search,
	CalendarCheck,
	AlertTriangle,
	X,
	Filter,
} from "lucide-react";
import api from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { extractErrorMessage, logErrorDetails } from "@/lib/errorUtils";
import { formatShortDate } from "@/lib/dateUtils";
import { DataTable } from "@/components/ui/DataTable";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { useToast } from "@/context/ToastContext";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageLoader } from "@/components/ui/PageLoader";
import { PageError } from "@/components/ui/PageError";

type FilterType =
	| "ALL"
	| "ACTIVE"
	| "OVERDUE"
	| "COMPLETED"
	| "PENDING"
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

const FILTERS: FilterType[] = [
	"ALL",
	"ACTIVE",
	"OVERDUE",
	"COMPLETED",
	"PENDING",
	"REJECTED",
];

const OVERRIDE_STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
	{ value: "COMPLETED", label: "Complete" },
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
	return formatShortDate(date);
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
	const { toast } = useToast();

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

	// Auto-refresh: on tab focus + light polling (overdue bookings are time-sensitive)
	useAutoRefresh(() => fetchBookings(pageIndex), { intervalMs: 45_000 });

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
			toast("Booking status updated.");
		} catch (err) {
			const msg = extractErrorMessage(err);
			setError(msg);
			toast(msg, "error");
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return <PageLoader message="Loading bookings..." />;
	}

	// Fetch failure with nothing to show → full-page error + retry.
	// (Action/override errors keep their data and surface via toast.)
	if (error && bookings.length === 0) {
		return <PageError message={error} onRetry={() => fetchBookings(pageIndex)} />;
	}

	return (
		<div className="w-full space-y-6 px-3 pb-6 sm:px-0 sm:pb-0 graph-grid page-enter">
			<div className="glass-surface relative overflow-hidden rounded-2xl p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="min-w-0">
					<h2 className="mt-1 text-3xl font-bold tracking-tighter text-textPrimary sm:text-5xl">
						Booking <span className="text-gradient-brand italic">Monitor.</span>
					</h2>
					<p className="mt-2 text-sm text-textSecondary">
						Track all platform bookings and update statuses from the backend.
					</p>
				</div>

				<div className="flex flex-col gap-3 sm:flex-row sm:items-center self-start sm:self-auto">
					{overdueCount > 0 && (
						<div className="flex w-full items-center justify-center gap-2 rounded-xl border border-warning/40 bg-warningLight px-4 py-2 text-sm font-bold text-warning shadow-sm sm:w-auto">
							<AlertTriangle className="h-4 w-4" />
							{overdueCount} Overdue
						</div>
					)}
				</div>
			</div>

			{/* Desktop View: search and filter buttons */}
			<div className="hidden md:flex md:flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
				<div className="relative w-full shrink-0 lg:max-w-md">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textTertiary" />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by ID, item, renter, or owner..."
						className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-textPrimary shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-textTertiary"
					/>
				</div>

				<div className="flex flex-wrap items-center gap-2 lg:justify-end">
					{FILTERS.map((f) => (
						<button
							key={f}
							onClick={() => setFilter(f)}
							className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-all sm:px-4 ${
								filter === f
									? "bg-primary text-onPrimary shadow-sm"
									: "border border-border bg-card text-textSecondary hover:border-primary/40 hover:text-textPrimary"
							}`}>
							{f}
						</button>
					))}
				</div>
			</div>

			{/* Mobile View: Search input and select filter directly in a single row (always visible) */}
			<div className="flex flex-row items-center gap-2 md:hidden">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textTertiary" />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search..."
						className="w-full rounded-full border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-textPrimary shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-textTertiary"
					/>
				</div>

				<div className="shrink-0">
					<Select
						value={filter}
						onChange={(val) => setFilter(val as FilterType)}
						options={FILTERS.map((f) => ({ value: f, label: f }))}
						variant="pill"
					/>
				</div>
			</div>

			{overrideId !== null && createPortal(
				<div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center sm:p-4">
					<div className="flex max-h-[90dvh] w-full max-w-sm flex-col space-y-4 overflow-visible rounded-2xl border border-borderLight bg-surface p-5 shadow-xl sm:p-6">
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
						<Select
							value={overrideStatus}
							onChange={(val) => setOverrideStatus(val as BookingStatus)}
							options={OVERRIDE_STATUS_OPTIONS.map(({ value, label }) => ({
								value,
								label,
							}))}
							placeholder="Select new status"
						/>

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
				</div>,
				document.body,
			)}

			<div className="mb-4 px-1 text-xs text-textTertiary sm:px-0">
				Note: Search and filtering apply only to the current page.
			</div>

			<Card padding="none" className="overflow-x-auto">
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
								cell: (b) => <StatusBadge status={b.status} />,
							},
							{
								header: "Actions",
								cell: (b) => (
									<div className="flex items-center gap-3">
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
			</Card>
		</div>
	);
}
