"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
	ArrowLeft,
	Shield,
	Info,
	Loader2,
	AlertTriangle,
} from "lucide-react";

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

function getAuthHeaders(): Record<string, string> {
	if (typeof window === "undefined") return {};

	const token =
		localStorage.getItem("resourcex_token");

	return token
		? {
			Authorization: `Bearer ${token}`,
		}
		: {};
}

async function fetchJson(url: string) {
	const response = await fetch(url, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...getAuthHeaders(),
		},
	});

	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`);
	}

	return await response.json();
}

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

			const endpoints = [
				`/api/items/${params.id}`,
				`/api/item/${params.id}`,
				`/api/borrow/items/${params.id}`,
			];

			try {
				for (const endpoint of endpoints) {
					try {
						const response = await fetchJson(endpoint);
						const normalized = normalizeItem(response, params.id);

						if (!active) return;

						setItem(normalized);
						setLoading(false);
						return;
					} catch {
						// try next endpoint
					}
				}

				throw new Error("Unable to load item details.");
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

			const endpoints = [
				"/api/bookings",
				"/api/booking/request",
				"/api/borrow/bookings",
			];

			let success = false;

			for (const endpoint of endpoints) {
				try {
					const response = await fetch(endpoint, {
						method: "POST",
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
							...getAuthHeaders(),
						},
						body: JSON.stringify(payload),
					});

					if (response.ok) {
						success = true;
						break;
					}
				} catch {
					// try next endpoint
				}
			}

			if (!success) {
				throw new Error("Booking request submission failed.");
			}

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
		<div className="max-w-2xl mx-auto space-y-6 pb-20">
			<Link
				href={`/borrow/item/${params.id}`}
				className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary hover:text-primary transition-colors">
				<ArrowLeft className="w-4 h-4" /> Back to Item
			</Link>

			<div className="bg-surface border border-borderLight rounded-2xl p-6 md:p-8 shadow-sm">
				<div className="text-center mb-8">
					<h1 className="text-2xl font-extrabold text-textPrimary">
						Request to Book
					</h1>
					<p className="text-textSecondary mt-1">{item.title}</p>
				</div>

				<div className="space-y-6">
					{/* Dates */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1">
							<label className="text-xs font-bold text-textSecondary uppercase tracking-wider">
								Start Date
							</label>
							<input
								type="date"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								className="w-full px-4 py-3 bg-surface border border-borderLight rounded-xl text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
							/>
						</div>
						<div className="space-y-1">
							<label className="text-xs font-bold text-textSecondary uppercase tracking-wider">
								End Date
							</label>
							<input
								type="date"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								className="w-full px-4 py-3 bg-surface border border-borderLight rounded-xl text-sm font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
							/>
						</div>
					</div>

					{/* Quick days selector for mock purposes */}
					<div className="space-y-2">
						<label className="text-xs font-bold text-textSecondary uppercase tracking-wider">
							Estimated Duration (Days)
						</label>
						<div className="flex items-center gap-4">
							<input
								type="range"
								min="1"
								max="14"
								value={computedDays}
								onChange={(e) => setDays(parseInt(e.target.value))}
								className="flex-1 accent-primary"
							/>
							<span className="w-12 text-center text-lg font-bold text-textPrimary bg-surfaceVariant py-1 rounded-lg border border-borderLight">
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
					<div className="bg-surfaceVariant border border-borderLight rounded-xl p-5 space-y-4">
						<h3 className="font-bold text-textPrimary text-sm uppercase tracking-wider">
							Payment Summary
						</h3>

						<div className="space-y-2 text-sm">
							<div className="flex justify-between text-textSecondary">
								<span>
									৳ {item.pricePerDay} × {computedDays} days
								</span>
								<span className="font-medium text-textPrimary">
									৳ {totalRental}
								</span>
							</div>
							<div className="flex justify-between text-textSecondary">
								<span className="flex items-center gap-1">
									Refundable Deposit <Info className="w-3.5 h-3.5" />
								</span>
								<span className="font-medium text-textPrimary">
									৳ {item.deposit}
								</span>
							</div>
							<div className="pt-3 mt-3 border-t border-borderLight flex justify-between items-center text-base">
								<span className="font-bold text-textPrimary">
									Total Due Now
								</span>
								<span className="text-2xl font-extrabold text-primary">
									৳ {finalTotal}
								</span>
							</div>
						</div>
					</div>

					{/* Trust Notice */}
					<div className="flex items-start gap-3 bg-primaryLight border border-primary/20 p-4 rounded-xl text-sm">
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
						className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-sm hover:bg-primaryDark transition-colors flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
					<p className="text-center text-xs text-textSecondary">
						You won&apos;t be charged until the owner approves.
					</p>
				</div>
			</div>
		</div>
	);
}
