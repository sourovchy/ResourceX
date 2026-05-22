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
			<div className="flex justify-center py-20">
				<Loader2 className="w-10 h-10 text-primary animate-spin" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="max-w-3xl mx-auto py-20 text-center space-y-6">
				<div className="w-20 h-20 bg-errorLight text-error rounded-full flex items-center justify-center mx-auto">
					<AlertTriangle className="w-10 h-10" />
				</div>

				<div>
					<h1 className="text-2xl font-bold text-textPrimary">
						Unable to Load History
					</h1>
					<p className="text-textSecondary mt-2">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-5xl mx-auto space-y-6 pb-20">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary">
						Rental History
					</h1>
					<p className="text-textSecondary text-sm mt-1">
						{history.length} completed rentals
					</p>
				</div>
				<select
					value={sortBy}
					onChange={(e) => setSortBy(e.target.value as "recent" | "oldest")}
					className="px-3 py-2 bg-surface border border-borderLight rounded-lg text-textPrimary text-sm focus:ring-2 focus:ring-primary">
					<option value="recent">Most Recent</option>
					<option value="oldest">Oldest First</option>
				</select>
			</div>

			<div className="space-y-3">
				{sortedHistory.length > 0 ? (
					sortedHistory.map((rental) => {
						const normalizedStatus = rental.status.toUpperCase();

						return (
							<div
								key={rental.id}
								className="bg-surface border border-borderLight rounded-xl p-5 hover:shadow-md transition-shadow">
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<div className="flex items-start justify-between mb-2">
											<div>
												<h3 className="font-semibold text-textPrimary">
													{rental.itemName}
												</h3>
												<p className="text-sm text-textSecondary">
													from {rental.ownerName}
												</p>
											</div>

											<div className="text-right">
												<p className="font-bold text-primary">
													৳{rental.totalPrice.toLocaleString()}
												</p>

												<div
													className={`inline-flex items-center gap-1 mt-1 px-2 py-1 rounded-full text-[10px] font-bold ${
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

										<div className="flex items-center gap-4 text-sm text-textTertiary mt-3">
											<span className="flex items-center gap-1">
												<Calendar className="w-4 h-4" />
												{formatDate(rental.startDate)} to {formatDate(rental.endDate)}
											</span>
										</div>
									</div>

									<Link
										href="/my-bookings"
										className="px-3 py-2 text-sm font-semibold rounded-lg bg-primaryLight text-primary hover:bg-primary hover:text-onPrimary transition">
										Details
									</Link>
								</div>
							</div>
						);
					})
				) : (
					<div className="bg-surface border border-borderLight rounded-2xl p-16 text-center shadow-sm">
						<div className="w-20 h-20 bg-successLight rounded-full flex items-center justify-center mx-auto mb-5">
							<CheckCircle2 className="w-10 h-10 text-success" />
						</div>

						<h3 className="text-xl font-bold text-textPrimary">
							No rental history yet
						</h3>

						<p className="text-textSecondary mt-2 max-w-md mx-auto">
							Completed, cancelled, or rejected rentals will appear here.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
