"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
	AlertOctagon,
	CheckCircle2,
	Loader2,
} from "lucide-react";
import api from "@/lib/api";

type BookingResponse = {
	id?: string | number;
	bookingId?: string | number;
	depositAmount?: number;
	securityDeposit?: number;
	deposit?: number;
	itemTitle?: string;
	item?: {
		title?: string;
	};
	[item: string]: unknown;
};

const resolveBooking = (payload: unknown): BookingResponse | null => {
	if (!payload || typeof payload !== "object") return null;

	const record = payload as Record<string, unknown>;
	const candidates = [record.data, record.booking, record.result, payload];

	for (const candidate of candidates) {
		if (candidate && typeof candidate === "object") {
			return candidate as BookingResponse;
		}
	}

	return null;
};

const toNumber = (value: unknown, fallback = 0) => {
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
};

export default function PenaltyRequestPage() {
	const params = useParams();
	const bookingId = params?.bookingId as string;

	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	const [itemName, setItemName] = useState("Item");
	const [depositLimit, setDepositLimit] = useState(0);

	const [amount, setAmount] = useState("");
	const [reason, setReason] = useState("");

	useEffect(() => {
		const loadBooking = async () => {
			if (!bookingId) return;

			setLoading(true);
			setError("");

			try {
				const res = await api.get(`/bookings/${bookingId}`);
				const booking = resolveBooking(res.data);

				if (!booking) {
					throw new Error("Booking not found.");
				}

				setItemName(
					booking.itemTitle || booking.item?.title || "Rental item",
				);

				setDepositLimit(
					toNumber(
						booking.depositAmount ??
							booking.securityDeposit ??
							booking.deposit,
						0,
					),
				);
			} catch (err: any) {
				console.error("Failed to load booking", err);
				setError(
					err?.response?.data?.message ||
						err.message ||
						"Failed to load booking details.",
				);
			} finally {
				setLoading(false);
			}
		};

		loadBooking();
	}, [bookingId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setError("");
		setSubmitting(true);

		try {
			const finalAmount = Math.min(Number(amount), depositLimit);

			await api.post(`/bookings/${bookingId}/penalty-request`, {
				amount: finalAmount,
				reason,
			});

			setSubmitted(true);
		} catch (err: any) {
			console.error("Penalty request failed", err);
			setError(
				err?.response?.data?.message ||
					err.message ||
					"Failed to submit penalty request.",
			);
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="mx-auto flex max-w-2xl flex-col items-center justify-center space-y-3 px-3 py-16 text-center sm:px-4 sm:py-20">
				<Loader2 className="h-8 w-8 animate-spin text-primary sm:h-10 sm:w-10" />
				<p className="text-sm font-medium text-textSecondary sm:text-base">
					Loading booking details...
				</p>
			</div>
		);
	}

	if (submitted) {
		return (
			<div className="mx-auto max-w-xl space-y-5 px-3 py-16 text-center sm:px-4 sm:py-20">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warningLight text-warningDark sm:h-20 sm:w-20">
					<CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10" />
				</div>
				<h1 className="text-2xl font-extrabold text-textPrimary sm:text-3xl">
					Penalty Request Submitted
				</h1>
				<p className="text-sm text-textSecondary sm:text-base">
					ResourceX admins will review your request. The renter&apos;s
					deposit is held during this investigation.
				</p>
				<Link
					href="/my-posts/active-rentals"
					className="mt-4 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primaryDark sm:px-6">
					Back to Rentals
				</Link>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-2xl space-y-5 px-3 pb-16 sm:px-4 sm:pb-20 lg:px-0">
			

			<div>
				<h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
					<AlertOctagon className="h-5 w-5 text-error sm:h-6 sm:w-6" />
					Report Damage / Request Penalty
				</h1>
				<p className="mt-2 text-sm text-textSecondary sm:text-base">
					Submit this form if {itemName} was returned damaged or had
					issues. This deducts from the renter&apos;s deposit upon admin
					approval.
				</p>
			</div>

			{error && (
				<div className="rounded-xl bg-errorLight p-4 text-sm font-semibold text-error">
					{error}
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className="space-y-5 rounded-2xl border border-error/20 bg-surface p-4 shadow-sm sm:p-6 md:p-8">

				<div className="flex gap-2 rounded-xl bg-errorLight p-4 text-sm font-semibold text-error">
					<AlertOctagon className="h-5 w-5 shrink-0" />
					<div>
						Note: Maximum deduction limit is the held deposit amount:
						&nbsp;৳ {depositLimit}
					</div>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-bold text-textPrimary">
						Penalty Amount Requested (৳)
					</label>
					<input
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						type="number"
						min="0"
						max={depositLimit}
						placeholder="e.g. 150"
						className="w-full rounded-xl border border-borderLight bg-surfaceVariant px-4 py-3 text-sm text-textPrimary transition-all focus:border-error focus:outline-none focus:ring-1 focus:ring-error"
						required
					/>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-bold text-textPrimary">
						Detailed Reason
					</label>
					<textarea
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						rows={5}
						placeholder="Describe the damage..."
						className="w-full resize-none rounded-xl border border-borderLight bg-surfaceVariant px-4 py-3 text-sm text-textPrimary transition-all focus:border-error focus:outline-none focus:ring-1 focus:ring-error"
						required></textarea>
				</div>

				<button
					type="submit"
					disabled={submitting}
					className={`w-full rounded-xl py-3.5 font-bold text-white shadow-sm transition-colors sm:py-4 ${
						submitting
							? "cursor-not-allowed bg-outlineVariant"
							: "bg-error hover:bg-errorDark"
					}`}>
					{submitting ? "Submitting..." : "Submit Penalty Request"}
				</button>
			</form>
		</div>
	);
}