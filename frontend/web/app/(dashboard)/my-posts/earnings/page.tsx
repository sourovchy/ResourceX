"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
	ArrowUpRight,
	BarChart3,
	Clock,
	DollarSign,
	Loader2,
} from "lucide-react";
import api from "@/lib/api";

type BookingStatus =
	| "PENDING"
	| "APPROVED"
	| "ACTIVE"
	| "COMPLETED"
	| "CANCELLED"
	| "REJECTED"
	| string;

type RawBooking = {
	id?: string | number;
	bookingId?: string | number;
	itemId?: string | number;
	title?: string;
	itemTitle?: string;
	item?: {
		title?: string;
	};
	days?: number;
	rentalDays?: number;
	amount?: number;
	total?: number;
	totalCost?: number;
	totalPrice?: number;
	penaltyAmount?: number;
	status?: BookingStatus;
	paymentStatus?: string;
	startDate?: string;
	endDate?: string;
	createdAt?: string;
};

type EarningsRow = {
	id: string;
	title: string;
	days: number;
	amount: number;
	status: string;
	monthKey: string;
};

const money = (value: number) => `৳ ${new Intl.NumberFormat("en-BD").format(value)}`;

const toNumber = (value: unknown) => {
	const n = Number(value);
	return Number.isFinite(n) ? n : 0;
};

const toISODateKey = (dateString?: string) => {
	if (!dateString) return "Unknown";
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return "Unknown";
	return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(date);
};

const calculateDays = (booking: RawBooking) => {
	const directDays = toNumber(booking.days || booking.rentalDays);
	if (directDays > 0) return directDays;

	if (booking.startDate && booking.endDate) {
		const start = new Date(booking.startDate);
		const end = new Date(booking.endDate);
		const diffMs = end.getTime() - start.getTime();
		const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
		return Number.isFinite(diffDays) && diffDays > 0 ? diffDays : 0;
	}

	return 0;
};

const resolveTitle = (booking: RawBooking) =>
	booking.title || booking.itemTitle || booking.item?.title || "Untitled item";

const resolveAmount = (booking: RawBooking) =>
	toNumber(
		booking.totalPrice ?? booking.totalCost ?? booking.amount ?? booking.total ?? 0,
	);

const resolveStatus = (booking: RawBooking) =>
	String(booking.status || booking.paymentStatus || "").toUpperCase();

const unwrapBookings = (payload: unknown): RawBooking[] => {
	if (Array.isArray(payload)) return payload as RawBooking[];
	if (payload && typeof payload === "object") {
		const record = payload as Record<string, unknown>;
		const candidate =
			record.items ?? record.bookings ?? record.data ?? record.results ?? record.content;
		if (Array.isArray(candidate)) return candidate as RawBooking[];
	}
	return [];
};

export default function EarningsPage() {
	const [bookings, setBookings] = useState<EarningsRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadEarnings = async () => {
			setLoading(true);
			setError("");

			try {
				const res = await api.get("/bookings/owner");
				const rawBookings = unwrapBookings(res.data);

				const rows = rawBookings
					.map((booking) => {
						const amount = resolveAmount(booking);
						const status = resolveStatus(booking);
						const monthKey = toISODateKey(booking.createdAt || booking.startDate || booking.endDate);

						return {
							id: String(booking.id ?? booking.bookingId ?? booking.itemId ?? `${resolveTitle(booking)}-${monthKey}`),
							title: resolveTitle(booking),
							days: calculateDays(booking),
							amount,
							status,
							monthKey,
						};
					})
					.filter((row) => row.title !== "Untitled item" || row.amount > 0 || row.days > 0);

				setBookings(rows);
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to load earnings data.";
				setError(message);
				setBookings([]);
			} finally {
				setLoading(false);
			}
		};

		loadEarnings();
	}, []);

	const stats = useMemo(() => {
		const total = bookings
			.filter((booking) => booking.status === "COMPLETED")
			.reduce((sum, booking) => sum + booking.amount, 0);

		const pending = bookings
			.filter((booking) => booking.status !== "COMPLETED")
			.reduce((sum, booking) => sum + booking.amount, 0);

		const penalty = bookings.reduce((sum, booking) => {
			return sum + (booking.status === "COMPLETED" ? 0 : 0);
		}, 0);

		return { total, pending, penalty };
	}, [bookings]);

	const monthlySeries = useMemo(() => {
		const buckets = new Map<string, number>();

		bookings
			.filter((booking) => booking.status === "COMPLETED")
			.forEach((booking) => {
				buckets.set(booking.monthKey, (buckets.get(booking.monthKey) ?? 0) + booking.amount);
			});

		return Array.from(buckets.entries()).map(([label, amount]) => ({ label, amount }));
	}, [bookings]);

	if (loading) {
		return (
			<div className="mx-auto flex max-w-4xl flex-col items-center justify-center space-y-3 px-3 py-16 text-center sm:px-4 sm:py-20">
				<Loader2 className="h-8 w-8 animate-spin text-primary sm:h-10 sm:w-10" />
				<p className="text-sm font-medium text-textSecondary sm:text-base">
					Loading your earnings...
				</p>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl space-y-5 px-3 pb-16 sm:px-4 sm:pb-20 lg:px-0">
			

			<div className="space-y-1">
				<h1 className="text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
					Earnings Dashboard
				</h1>
				<p className="text-sm text-textSecondary sm:text-base">
					Review your completed rental income and payout overview.
				</p>
			</div>

			{error && (
				<div className="rounded-xl bg-errorLight p-4 text-sm font-semibold text-error">
					{error}
				</div>
			)}

			{bookings.length === 0 && !error ? (
				<div className="rounded-2xl border border-borderLight bg-surface p-6 text-center text-sm text-textSecondary sm:p-10">
					No earnings yet.
				</div>
			) : null}

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div className="rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6">
					<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-successLight text-success sm:h-10 sm:w-10">
						<DollarSign className="h-5 w-5" />
					</div>
					<div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-textSecondary sm:text-xs">
						Total Earnings
					</div>
					<div className="text-2xl font-extrabold text-textPrimary sm:text-3xl">
						{money(stats.total)}
					</div>
				</div>

				<div className="rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6">
					<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primaryLight text-primary sm:h-10 sm:w-10">
						<Clock className="h-5 w-5" />
					</div>
					<div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-textSecondary sm:text-xs">
						Pending Payouts
					</div>
					<div className="text-2xl font-extrabold text-textPrimary sm:text-3xl">
						{money(stats.pending)}
					</div>
				</div>

				<div className="rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6">
					<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-errorLight text-error sm:h-10 sm:w-10">
						<ArrowUpRight className="h-5 w-5" />
					</div>
					<div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-textSecondary sm:text-xs">
						Penalties
					</div>
					<div className="text-2xl font-extrabold text-textPrimary sm:text-3xl">
						{money(stats.penalty)}
					</div>
				</div>
			</div>

			{bookings.length > 0 && (
				<div className="rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6">
					<div className="mb-4 flex items-center gap-2">
						<BarChart3 className="h-5 w-5 text-primary" />
						<h2 className="text-base font-bold text-textPrimary sm:text-lg">
							Monthly Earnings
						</h2>
					</div>

					{monthlySeries.length === 0 ? (
						<p className="text-sm text-textSecondary">No completed rentals yet to chart.</p>
					) : (
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{monthlySeries.map((entry) => {
								const max = Math.max(...monthlySeries.map((item) => item.amount), 1);
								const width = Math.max((entry.amount / max) * 100, 8);

								return (
									<div key={entry.label} className="rounded-xl bg-surfaceVariant p-3">
										<div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-textSecondary">
											<span className="truncate">{entry.label}</span>
											<span>{money(entry.amount)}</span>
										</div>
										<div className="h-2 w-full rounded-full bg-borderLight">
											<div className="h-2 rounded-full bg-primary" style={{ width: `${width}%` }} />
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			)}

			{bookings.length > 0 && (
				<div className="rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6">
					<h2 className="mb-4 text-base font-bold text-textPrimary sm:text-lg">
						Breakdown by Item
					</h2>

					<div className="divide-y divide-borderLight">
						{bookings
							.filter((booking) => booking.status === "COMPLETED")
							.map((item) => (
								<div
									key={item.id}
									className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
									<div className="min-w-0">
										<div className="truncate text-sm font-bold text-textPrimary">
											{item.title}
										</div>
										<div className="text-xs text-textSecondary">
											{item.days > 0 ? `${item.days} rental day${item.days > 1 ? "s" : ""}` : "Completed rental"}
										</div>
									</div>

									<div className="font-extrabold text-success">
										{money(item.amount)}
									</div>
								</div>
							))}
					</div>
				</div>
			)}
		</div>
	);
}