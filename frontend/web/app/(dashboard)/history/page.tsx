"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
	Calendar,
	Loader2,
	AlertTriangle,
	CheckCircle2,
	XCircle,
} from "lucide-react";
import api from "@/lib/api";

type HistoryItem = {
	id: string;
	itemName: string;
	ownerName: string;
	totalPrice: number;
	status: string;
	startDate?: string;
	endDate?: string;
};

type BookingApiResponse =
	| {
		bookings?: unknown;
		data?: unknown;
		content?: unknown;
	}
	| unknown;

const HISTORY_ENDPOINTS = [
	"/bookings/my",
	"/bookings/history",
	"/api/bookings/my",
	"/api/bookings/history",
];

function normalizeBooking(raw: any): HistoryItem {
	return {
		id: String(raw?.bookingId ?? raw?.id ?? crypto.randomUUID()),
		itemName:
			raw?.item?.title ??
			raw?.itemName ??
			raw?.itemTitle ??
			"Untitled Item",
		ownerName:
			raw?.owner?.name ??
			raw?.ownerName ??
			raw?.lenderName ??
			"Unknown Owner",
		totalPrice: Number(
			raw?.totalPrice ?? raw?.amount ?? raw?.bookingAmount ?? 0,
		),
		status: String(raw?.status ?? "UNKNOWN"),
		startDate:
			raw?.startDate ?? raw?.bookingStartDate ?? raw?.fromDate,
		endDate:
			raw?.endDate ?? raw?.bookingEndDate ?? raw?.toDate,
	};
}

function extractBookings(payload: BookingApiResponse) {
	const root: any = payload && typeof payload === "object" ? payload : {};

	const source =
		root.bookings ??
		root.data ??
		root.content ??
		payload;

	if (!Array.isArray(source)) {
		return [] as HistoryItem[];
	}

	return source.map((item: any) => normalizeBooking(item));
}

async function fetchBookingsFromEndpoint(endpoint: string) {
	const response = await api.get<BookingApiResponse>(endpoint);
	return extractBookings(response.data);
}

function formatDate(date?: string) {
	if (!date) return "—";
	return new Date(date).toLocaleDateString();
}

export default function HistoryPage() {
	const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		const fetchHistory = async () => {
			setLoading(true);
			setError(null);

			try {
				let loadedBookings: HistoryItem[] = [];

				for (const endpoint of HISTORY_ENDPOINTS) {
					try {
						const normalized = await fetchBookingsFromEndpoint(endpoint);

						if (normalized.length > 0) {
							loadedBookings = normalized;
							break;
						}
					} catch {
						// try next endpoint
					}
				}

				const completedBookings = loadedBookings.filter((booking) => {
					const status = booking.status.toUpperCase();

					return (
						status === "COMPLETED" ||
						status === "CANCELLED" ||
						status === "REJECTED"
					);
				});

				if (!active) return;

				setHistory(completedBookings);
			} catch (err) {
				console.error(err);

				if (!active) return;

				setError(
					err instanceof Error
						? err.message
						: "Failed to load rental history.",
				);
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		};

		void fetchHistory();

		return () => {
			active = false;
		};
	}, []);

	const sortedHistory = useMemo(() => [...history].sort((a, b) => {
		const dateA = new Date(a.endDate || a.startDate || 0);
		const dateB = new Date(b.endDate || b.startDate || 0);
		return sortBy === "recent"
			? dateB.getTime() - dateA.getTime()
			: dateA.getTime() - dateB.getTime();
	}), [history, sortBy]);

	if (loading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center gap-3 px-4 text-center text-textSecondary">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
				<span className="text-sm font-medium sm:text-base">Loading history...</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
				<div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-errorLight text-error">
					<AlertTriangle className="h-10 w-10" />
				</div>

				<div>
					<h1 className="text-2xl font-bold text-textPrimary sm:text-3xl">
						Unable to Load History
					</h1>
					<p className="mt-2 text-sm text-textSecondary sm:text-base">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-5xl space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="min-w-0">
					<h1 className="text-xl font-bold text-textPrimary sm:text-2xl">
						Rental History
					</h1>
					<p className="mt-1 text-sm text-textSecondary">
						{history.length} completed rentals
					</p>
				</div>
				<select
					value={sortBy}
					onChange={(e) => setSortBy(e.target.value as "recent" | "oldest")}
					className="w-full rounded-lg border border-borderLight bg-surface px-3 py-2 text-sm text-textPrimary outline-none focus:ring-2 focus:ring-primary sm:w-auto">
					<option value="recent">Most Recent</option>
					<option value="oldest">Oldest First</option>
				</select>
			</div>

			<div className="space-y-3 pb-2">
				{sortedHistory.length > 0 ? (
					sortedHistory.map((rental) => {
						const normalizedStatus = rental.status.toUpperCase();

						return (
							<div
								key={rental.id}
								className="rounded-xl border border-borderLight bg-surface p-4 transition-shadow hover:shadow-md sm:p-5">
								<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
									<div className="min-w-0 flex-1">
										<div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
											<div className="min-w-0">
												<h3 className="break-words font-semibold text-textPrimary">
													{rental.itemName}
												</h3>
												<p className="break-words text-sm text-textSecondary">
													from {rental.ownerName}
												</p>
											</div>
											<div className="flex flex-col items-start gap-1 text-left sm:items-end sm:text-right">
												<p className="font-bold text-primary">
													৳{rental.totalPrice.toLocaleString()}
												</p>

												<div
													className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
														normalizedStatus === "COMPLETED"
															? "bg-successLight text-success"
															: normalizedStatus === "CANCELLED"
																? "bg-warningLight text-warningDark"
																: "bg-errorLight text-error"
													}`}>
													{normalizedStatus === "COMPLETED" ? (
														<CheckCircle2 className="w-3 h-3" />
													) : (
														<XCircle className="w-3 h-3" />
													)}
													{normalizedStatus}
												</div>
											</div>
										</div>

										<div className="mt-3 flex flex-col gap-2 text-sm text-textTertiary sm:flex-row sm:items-center sm:gap-4">
											<span className="flex items-start gap-1">
												<Calendar className="w-4 h-4" />
												{formatDate(rental.startDate)} to {formatDate(rental.endDate)}
											</span>
										</div>
									</div>
									<Link
										href="/my-bookings"
										className="inline-flex w-full items-center justify-center rounded-lg bg-primaryLight px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-onPrimary sm:w-auto">
										Details
									</Link>
								</div>
							</div>
						);
					})
				) : (
					<div className="rounded-2xl border border-borderLight bg-surface px-4 py-14 text-center shadow-sm sm:p-16">
						<div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-successLight">
							<CheckCircle2 className="w-10 h-10 text-success" />
						</div>

						<h3 className="text-xl font-bold text-textPrimary sm:text-2xl">
							No rental history yet
						</h3>

						<p className="mx-auto mt-2 max-w-md px-2 text-sm text-textSecondary sm:text-base">
							Completed, cancelled, or rejected rentals will appear here.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
