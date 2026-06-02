"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
	AlertTriangle,
	CheckCircle2,
	Info,
	Loader2,
} from "lucide-react";
import api from "@/lib/api";
import { extractErrorMessage } from "@/lib/errorUtils";
import { formatShortDate } from "@/lib/dateUtils";

// ── Helpers ─────────────────────────────────────────────────────────────────

function todayStr(): string {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(dateStr: string, days: number): string {
	const d = new Date(dateStr + "T00:00:00");
	d.setDate(d.getDate() + days);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(start: string, end: string): number {
	if (!start || !end) return 1;
	const s = new Date(start + "T00:00:00");
	const e = new Date(end + "T00:00:00");
	const diff = Math.round((e.getTime() - s.getTime()) / 86_400_000) + 1;
	return diff > 0 ? diff : 1;
}

function normalizeItem(data: unknown, fallbackId: string) {
	const d = data as Record<string, unknown> | null | undefined;
	return {
		id: String(d?.itemId ?? d?.id ?? fallbackId),
		title: String(d?.title ?? d?.name ?? "Untitled Item"),
		// Backend field is `dailyRate` — check it first
		pricePerDay: Number(d?.dailyRate ?? d?.pricePerDay ?? d?.rentalPricePerDay ?? 0),
		deposit: Number(d?.deposit ?? d?.securityDeposit ?? 0),
		imageUrls: Array.isArray(d?.imageUrls) ? (d.imageUrls as string[]) : [],
		category: String(d?.category ?? ""),
	};
}

const MAX_DAYS = 30;

// ── Component ────────────────────────────────────────────────────────────────

export default function BookItemPage({ params }: { params: { id: string } }) {
	const router = useRouter();

	const [item, setItem] = useState({
		id: params.id,
		title: "",
		pricePerDay: 0,
		deposit: 0,
		imageUrls: [] as string[],
		category: "",
	});
	const [fetchLoading, setFetchLoading] = useState(true);
	const [fetchError, setFetchError] = useState<string | null>(null);

	// Date / duration state — all three kept in sync
	const [startDate, setStartDate] = useState(todayStr());
	const [endDate, setEndDate] = useState(todayStr());
	const [duration, setDuration] = useState(1);

	const [message, setMessage] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [newBookingId, setNewBookingId] = useState<number | null>(null);

	// Derived pricing
	const totalRental = item.pricePerDay * duration;

	// ── Fetch item ──────────────────────────────────────────────────────────
	useEffect(() => {
		let active = true;
		setFetchLoading(true);
		setFetchError(null);

		api.get(`/items/${params.id}`)
			.then((res) => {
				if (!active) return;
				setItem(normalizeItem(res.data, params.id));
			})
			.catch((err) => {
				if (!active) return;
				setFetchError(extractErrorMessage(err));
			})
			.finally(() => {
				if (active) setFetchLoading(false);
			});

		return () => { active = false; };
	}, [params.id]);

	// ── Date / slider sync ──────────────────────────────────────────────────

	const handleDurationSlider = (days: number) => {
		const clamped = Math.max(1, Math.min(days, MAX_DAYS));
		setDuration(clamped);
		setEndDate(addDays(startDate, clamped - 1));
	};

	const handleStartDateChange = (date: string) => {
		const today = todayStr();
		const validDate = date < today ? today : date;
		
		setStartDate(validDate);
		if (validDate) {
			// Keep duration, shift end date forward
			const newEnd = addDays(validDate, duration - 1);
			setEndDate(newEnd);
		}
	};

	const handleEndDateChange = (date: string) => {
		if (!date) return;
		// Don't allow end before start
		if (date < startDate) {
			setEndDate(startDate);
			setDuration(1);
			return;
		}
		setEndDate(date);
		const days = daysBetween(startDate, date);
		setDuration(Math.min(days, MAX_DAYS));
	};

	// ── Submit ──────────────────────────────────────────────────────────────

	const submittingRef = useRef(false);

	const handleSubmit = async () => {
		if (submittingRef.current) return; // guard against duplicate bookings
		setSubmitError(null);

		if (!startDate || !endDate) {
			setSubmitError("Please select both start and end dates.");
			return;
		}
		if (startDate < todayStr()) {
			setSubmitError("Start date cannot be in the past.");
			return;
		}
		if (endDate < startDate) {
			setSubmitError("End date must be on or after the start date.");
			return;
		}

		try {
			submittingRef.current = true;
			setSubmitting(true);
			const res = await api.post("/bookings", {
				itemId: item.id,
				startDate,
				endDate,
				bookingMessage: message.trim() || null,
			});
			setNewBookingId(res.data?.bookingId ?? null);
			setSuccess(true);
		} catch (err) {
			setSubmitError(extractErrorMessage(err));
		} finally {
			submittingRef.current = false;
			setSubmitting(false);
		}
	};

	// ── Loading / error states ──────────────────────────────────────────────

	if (fetchLoading) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
				<p className="text-sm font-medium text-textSecondary">Loading item details…</p>
			</div>
		);
	}

	if (fetchError) {
		return (
			<div className="mx-auto max-w-lg px-4 py-20 text-center">
				<AlertTriangle className="mx-auto mb-3 h-10 w-10 text-error" />
				<p className="font-semibold text-textPrimary">Could not load item</p>
				<p className="mt-1 text-sm text-textSecondary">{fetchError}</p>
				<button
					onClick={() => router.back()}
					className="mt-6 rounded-xl border border-borderLight px-6 py-2.5 text-sm font-semibold text-textPrimary hover:bg-surfaceVariant">
					Go back
				</button>
			</div>
		);
	}

	if (success) {
		return (
			<div className="mx-auto max-w-lg px-4 py-20 text-center">
				<CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-success" />
				<h2 className="text-xl font-bold text-textPrimary">Request Submitted!</h2>
				<p className="mt-2 text-sm text-textSecondary">
					Your booking request for <strong>{item.title}</strong> has been sent. The owner
					will review and approve it.
				</p>

				{newBookingId != null && (
					<p className="mt-3 inline-block rounded-lg bg-surfaceVariant px-3 py-1 text-xs font-semibold text-textSecondary">
						Booking reference&nbsp;
						<span className="font-bold text-textPrimary">#{newBookingId}</span>
					</p>
				)}

				<div className="mx-auto mt-4 flex max-w-sm items-start gap-2.5 rounded-xl border border-primary/20 bg-primaryLight/40 px-4 py-3 text-left text-xs text-primaryDark">
					<Info className="mt-0.5 h-4 w-4 shrink-0" />
					<span>
						Owners usually respond within 24 hours. You&apos;ll be notified once your
						request is approved or declined.
					</span>
				</div>

				<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
					<button
						onClick={() => router.push("/bookings")}
						className="rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primaryDark">
						View My Bookings
					</button>
					<button
						onClick={() => router.push("/borrow")}
						className="rounded-xl border border-borderLight px-6 py-3 font-semibold text-textPrimary hover:bg-surfaceVariant">
						Browse More Items
					</button>
				</div>
			</div>
		);
	}

	// ── Main form ───────────────────────────────────────────────────────────

	return (
		<div className="mx-auto max-w-2xl space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0">
			<div className="rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6 md:p-8">
				{/* Header */}
				<div className="mb-6 text-center sm:mb-8">
					<p className="text-xs font-semibold uppercase tracking-widest text-textSecondary">
						{item.category || "Item"}
					</p>
					<h1 className="mt-1 text-xl font-extrabold text-textPrimary sm:text-2xl">
						{item.title}
					</h1>
					<p className="mt-1 text-sm text-textSecondary">
						৳&thinsp;{item.pricePerDay} per day
					</p>
				</div>

				<div className="space-y-5 sm:space-y-6">
					{/* ── Dates ── */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="space-y-1">
							<label className="text-xs font-bold uppercase tracking-wider text-textSecondary">
								Start Date
							</label>
							<input
								type="date"
								value={startDate}
								min={todayStr()}
								onChange={(e) => handleStartDateChange(e.target.value)}
								className="w-full rounded-xl border border-borderLight bg-surface px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
							/>
						</div>
						<div className="space-y-1">
							<label className="text-xs font-bold uppercase tracking-wider text-textSecondary">
								End Date
							</label>
							<input
								type="date"
								value={endDate}
								min={startDate}
								onChange={(e) => handleEndDateChange(e.target.value)}
								className="w-full rounded-xl border border-borderLight bg-surface px-4 py-3 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
							/>
						</div>
					</div>

					{/* ── Duration slider ── */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<label className="text-xs font-bold uppercase tracking-wider text-textSecondary">
								Rental Duration
							</label>
							<span className="rounded-lg border border-borderLight bg-surfaceVariant px-3 py-1 text-sm font-bold text-textPrimary">
								{duration} {duration === 1 ? "day" : "days"}
							</span>
						</div>
						<input
							type="range"
							min={1}
							max={MAX_DAYS}
							value={duration}
							onChange={(e) => handleDurationSlider(parseInt(e.target.value, 10))}
							className="w-full accent-primary"
						/>
						<div className="flex justify-between text-xs text-textSecondary">
							<span>1 day</span>
							{startDate && endDate && (
								<span className="text-textSecondary">
									{formatShortDate(startDate)} → {formatShortDate(endDate)}
								</span>
							)}
							<span>{MAX_DAYS} days</span>
						</div>
					</div>

					{/* ── Optional message ── */}
					<div className="space-y-1">
						<label className="text-xs font-bold uppercase tracking-wider text-textSecondary">
							Message to Owner{" "}
							<span className="font-normal normal-case tracking-normal text-textSecondary">
								(optional)
							</span>
						</label>
						<textarea
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							rows={3}
							maxLength={1000}
							placeholder="Introduce yourself, explain your use case, or ask a question…"
							className="w-full resize-none rounded-xl border border-borderLight bg-surface px-4 py-3 text-sm text-textPrimary placeholder-textSecondary outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
						/>
						<p className="text-right text-xs text-textSecondary">
							{message.length}/1000
						</p>
					</div>

					{/* ── Errors ── */}
					{submitError && (
						<div className="flex items-start gap-3 rounded-xl border border-error bg-errorLight/30 p-4 text-sm text-errorDark">
							<AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
							<span>{submitError}</span>
						</div>
					)}

					{/* ── Booking request summary ── */}
					<div className="space-y-4 rounded-xl border border-borderLight bg-surfaceVariant p-4 sm:p-5">
						<h3 className="text-sm font-bold uppercase tracking-wider text-textPrimary">
							Booking Request Summary
						</h3>
						<div className="space-y-2 text-sm">
							<div className="flex items-center justify-between text-textSecondary">
								<span>
									৳&thinsp;{item.pricePerDay} × {duration}{" "}
									{duration === 1 ? "day" : "days"}
								</span>
								<span className="font-semibold text-textPrimary">
									৳&thinsp;{totalRental.toFixed(2)}
								</span>
							</div>
							{item.deposit > 0 && (
								<div className="flex items-center justify-between text-textSecondary">
									<span className="flex items-center gap-1.5">
										Refundable Deposit
										<Info className="h-3.5 w-3.5" />
									</span>
									<span className="font-semibold text-textPrimary">
										৳&thinsp;{item.deposit.toFixed(2)}
									</span>
								</div>
							)}
							<div className="mt-3 flex items-center justify-between border-t border-borderLight pt-3">
								<span className="font-bold text-textPrimary">
									Estimated Total
								</span>
								<span className="text-xl font-extrabold text-primary sm:text-2xl">
									৳&thinsp;{(totalRental + item.deposit).toFixed(2)}
								</span>
							</div>
						</div>
					</div>

					{/* ── Payment info notice ── */}
					<div className="flex items-start gap-3 rounded-xl border border-borderLight bg-surface p-4 text-sm">
						<Info className="mt-0.5 h-5 w-5 shrink-0 text-textSecondary" />
						<div className="text-textSecondary">
							<strong className="mb-0.5 block text-textPrimary">How payment works</strong>
							Payment is arranged directly with the owner after they approve your
							request. The refundable deposit is settled between you and the owner
							at handover and returned when the item is safely back.
						</div>
					</div>

					{/* ── Submit ── */}
					<button
						disabled={submitting}
						onClick={handleSubmit}
						className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-base font-bold text-white shadow-sm transition-colors hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg">
						{submitting ? (
							<>
								<Loader2 className="h-5 w-5 animate-spin" />
								Submitting Request…
							</>
						) : (
							"Confirm Booking Request"
						)}
					</button>
					<p className="px-2 text-center text-xs text-textSecondary">
						No payment is collected now. You&apos;ll coordinate with the owner after approval.
					</p>
				</div>
			</div>
		</div>
	);
}
