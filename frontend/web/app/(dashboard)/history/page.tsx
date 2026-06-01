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
import { useToast } from "@/context/ToastContext";
import { Select } from "@/components/ui/Select";
import { formatShortDate } from "@/lib/dateUtils";
import type { BookingResponse } from "@/types/booking";

function formatDate(date?: string) {
	if (!date) return "—";
	return formatShortDate(date);
}

export default function HistoryPage() {
	const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");
	const [history, setHistory] = useState<BookingResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		const fetchHistory = async () => {
			setLoading(true);
			setError(null);

			try {
				const res = await api.get<BookingResponse[]>("/bookings/me");
				const all = Array.isArray(res.data) ? res.data : [];
				const terminated = all.filter((b) => {
					const s = b.status.toUpperCase();
					return s === "COMPLETED" || s === "CANCELLED" || s === "REJECTED";
				});

				if (!active) return;
				setHistory(terminated);
			} catch (err) {
				if (!active) return;
				setError(
					err instanceof Error ? err.message : "Failed to load rental history.",
				);
			} finally {
				if (active) setLoading(false);
			}
		};

		void fetchHistory();
		return () => { active = false; };
	}, []);

	const sortedHistory = useMemo(
		() =>
			[...history].sort((a, b) => {
				const dateA = new Date(a.endDate || a.startDate || 0);
				const dateB = new Date(b.endDate || b.startDate || 0);
				return sortBy === "recent"
					? dateB.getTime() - dateA.getTime()
					: dateA.getTime() - dateB.getTime();
			}),
		[history, sortBy],
	);

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
				<h1 className="text-2xl font-bold text-textPrimary sm:text-3xl">
					Unable to Load History
				</h1>
				<p className="mt-2 text-sm text-textSecondary sm:text-base">{error}</p>
			</div>
		);
	}

	return (
		<div className="w-full space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="min-w-0">
					<h1 className="text-xl font-bold text-textPrimary sm:text-2xl">
						Rental History
					</h1>
					<p className="mt-1 text-sm text-textSecondary">
						{history.length} completed rental{history.length !== 1 ? "s" : ""}
					</p>
				</div>
				<div className="w-full sm:w-48">
					<Select
						value={sortBy}
						onChange={(val) => setSortBy(val as "recent" | "oldest")}
						options={[
							{ value: "recent", label: "Most Recent" },
							{ value: "oldest", label: "Oldest First" },
						]}
					/>
				</div>
			</div>

			<div className="space-y-3 pb-2">
				{sortedHistory.length > 0 ? (
					sortedHistory.map((rental) => {
						const normalizedStatus = rental.status.toUpperCase();
						return (
							<div
								key={rental.bookingId}
								className="rounded-xl border border-borderLight bg-surface p-4 transition-shadow hover:shadow-md sm:p-5">
								<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
									<div className="min-w-0 flex-1">
										<div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
											<div className="min-w-0">
												<h3 className="break-words font-semibold text-textPrimary">
													{rental.item?.title ?? "Untitled Item"}
												</h3>
												<p className="break-words text-sm text-textSecondary">
													from {rental.item?.owner?.name ?? "Unknown Owner"}
												</p>
											</div>
											<div className="flex flex-col items-start gap-1 text-left sm:items-end sm:text-right">
												<p className="font-bold text-primary">
													৳{Number(rental.totalPrice).toLocaleString()}
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
											<span className="flex items-center gap-1">
												<Calendar className="w-4 h-4" />
												{formatDate(rental.startDate)} — {formatDate(rental.endDate)}
											</span>
										</div>
										{rental.rejectionReason && (
											<p className="mt-2 text-xs text-error">
												Reason: {rental.rejectionReason}
											</p>
										)}
									</div>
									<Link
										href={`/borrow/item/${rental.item?.itemId}`}
										className="inline-flex w-full items-center justify-center rounded-lg bg-primaryLight px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-onPrimary sm:w-auto">
										View Item
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
