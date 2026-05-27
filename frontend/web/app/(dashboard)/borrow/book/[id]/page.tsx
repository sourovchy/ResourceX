"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
	Shield,
	Info,
	Loader2,
	AlertTriangle,
} from "lucide-react";
import api from "@/lib/api";

type ItemResponse = {
	id?: string | number;
	itemId?: string | number;
	title?: string;
	name?: string;
	pricePerDay?: number;
	rentalPricePerDay?: number;
	deposit?: number;
	securityDeposit?: number;
};

type BookingPayload = {
	itemId: string;
	startDate: string;
	endDate: string;
};



function normalizeItem(data: any, fallbackId: string) {
	return {
		id: String(data?.id ?? data?.itemId ?? fallbackId),
		title: data?.title ?? data?.name ?? "Untitled Item",
		pricePerDay: Number(
			data?.pricePerDay ?? data?.rentalPricePerDay ?? 0,
		),
		deposit: Number(data?.deposit ?? data?.securityDeposit ?? 0),
	};
}

function calculateDays(start: string, end: string) {
	if (!start || !end) return 1;

	const startDate = new Date(start);
	const endDate = new Date(end);

	const diffMs = endDate.getTime() - startDate.getTime();
	const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

	return days > 0 ? days : 1;
}

export default function BookItemPage({ params }: { params: { id: string } }) {
	const [days, setDays] = useState(1);
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");

	const [item, setItem] = useState({
		id: params.id,
		title: "Loading item...",
		pricePerDay: 0,
		deposit: 0,
	});
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const computedDays = useMemo(() => {
		if (startDate && endDate) {
			return calculateDays(startDate, endDate);
		}

		return days;
	}, [days, startDate, endDate]);

	const totalRental = item.pricePerDay * computedDays;

	const finalTotal = totalRental + item.deposit;



	useEffect(() => {
		let active = true;

		const loadItem = async () => {
			setLoading(true);
			setError(null);

			try {
				const response = await api.get(`/items/${params.id}`);
				const normalized = normalizeItem(response.data, params.id);

				if (!active) return;

				setItem(normalized);
				setLoading(false);
			} catch (err) {
				if (!active) return;

				setError(
					err instanceof Error
						? err.message
						: "Failed to load item.",
				);
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		};

		void loadItem();

		return () => {
			active = false;
		};
	}, [params.id]);

	if (loading) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
				<p className="text-sm font-medium text-textSecondary sm:text-base">
					Loading item details...
				</p>
			</div>
		);
	}

	const handleBookingRequest = async () => {
		setError(null);
		setSuccessMessage(null);

		if (!startDate || !endDate) {
			setError("Please select booking start and end dates.");
			return;
		}

		try {
			setSubmitting(true);

			const payload: BookingPayload = {
				itemId: String(item.id),
				startDate,
				endDate,
			};

			await api.post("/bookings", payload);
			setSuccessMessage("Booking request submitted successfully.");
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to submit booking request.",
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="mx-auto max-w-2xl space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0">
			

			<div className="rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6 md:p-8">
				<div className="mb-6 text-center sm:mb-8">
					<h1 className="text-xl font-extrabold text-textPrimary sm:text-2xl">
						Request to Book
					</h1>
					<p className="mt-1 break-words text-sm text-textSecondary sm:text-base">
						{item.title}
					</p>
				</div>

				<div className="space-y-5 sm:space-y-6">
					{/* Dates */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="min-w-0 space-y-1">
							<label className="text-xs font-bold text-textSecondary uppercase tracking-wider">
								Start Date
							</label>
							<input
								type="date"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								className="w-full rounded-xl border border-borderLight bg-surface px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
							/>
						</div>
						<div className="min-w-0 space-y-1">
							<label className="text-xs font-bold text-textSecondary uppercase tracking-wider">
								End Date
							</label>
							<input
								type="date"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								className="w-full rounded-xl border border-borderLight bg-surface px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
							/>
						</div>
					</div>

					{/* Quick days selector for mock purposes */}
					<div className="space-y-2">
						<label className="text-xs font-bold text-textSecondary uppercase tracking-wider">
							Estimated Duration (Days)
						</label>
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
							<input
								type="range"
								min="1"
								max="14"
								value={computedDays}
								onChange={(e) => setDays(parseInt(e.target.value))}
								className="w-full accent-primary sm:flex-1"
							/>
							<span className="w-full rounded-lg border border-borderLight bg-surfaceVariant px-3 py-2 text-center text-base font-bold text-textPrimary sm:w-14 sm:text-lg">
								{computedDays}
							</span>
						</div>
					</div>

					{error && (
						<div className="flex items-start gap-3 rounded-xl border border-error bg-errorLight/30 p-4 text-sm text-errorDark">
							<AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
							<span>{error}</span>
						</div>
					)}

					{successMessage && (
						<div className="rounded-xl border border-success bg-successLight/40 p-4 text-sm font-medium text-success">
							{successMessage}
						</div>
					)}

					{/* Summary */}
					<div className="space-y-4 rounded-xl border border-borderLight bg-surfaceVariant p-4 sm:p-5">
						<h3 className="text-sm font-bold uppercase tracking-wider text-textPrimary">
							Payment Summary
						</h3>

						<div className="space-y-2 text-sm">
							<div className="flex flex-col gap-1 text-textSecondary sm:flex-row sm:items-center sm:justify-between">
								<span>
									৳ {item.pricePerDay} × {computedDays} days
								</span>
								<span className="font-medium text-textPrimary">
									৳ {totalRental}
								</span>
							</div>
							<div className="flex flex-col gap-1 text-textSecondary sm:flex-row sm:items-center sm:justify-between">
								<span className="flex items-center gap-1">
									Refundable Deposit <Info className="w-3.5 h-3.5" />
								</span>
								<span className="font-medium text-textPrimary">
									৳ {item.deposit}
								</span>
							</div>
							<div className="mt-3 flex flex-col gap-2 border-t border-borderLight pt-3 text-base sm:flex-row sm:items-center sm:justify-between">
								<span className="font-bold text-textPrimary">
									Total Due Now
								</span>
								<span className="text-xl font-extrabold text-primary sm:text-2xl">
									৳ {finalTotal}
								</span>
							</div>
						</div>
					</div>

					{/* Trust Notice */}
					<div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primaryLight p-4 text-sm">
						<Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
						<div className="text-primaryDark">
							<strong className="block mb-0.5">
								ResourceX Payment Protection
							</strong>
							Your deposit is held securely and returned automatically after the
							item is safely returned.
						</div>
					</div>

					<button
						disabled={loading || submitting}
						className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-base font-bold text-white shadow-sm transition-colors hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg"
						onClick={(e) => {
							e.preventDefault();
							void handleBookingRequest();
						}}>
						{loading ? (
							<>
								<Loader2 className="w-5 h-5 animate-spin" />
								Loading Item...
							</>
						) : submitting ? (
							<>
								<Loader2 className="w-5 h-5 animate-spin" />
								Submitting Request...
							</>
						) : (
							"Confirm Booking Request"
						)}
					</button>
					<p className="px-2 text-center text-xs text-textSecondary">
						You won&apos;t be charged until the owner approves.
					</p>
				</div>
			</div>
		</div>
	);
}
