"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
	Shield,
	Loader2,
	AlertTriangle,
	Calendar,
} from "lucide-react";
import api from "@/lib/api";
import { formatShortDate } from "@/lib/dateUtils";
import type { BookingResponse } from "@/types/booking";

function formatDate(date?: string) {
	if (!date) return "—";
	return formatShortDate(date);
}

export default function DepositTrackerPage() {
	const [bookings, setBookings] = useState<BookingResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		const fetchDeposits = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await api.get<BookingResponse[]>("/bookings/deposits");
				if (!active) return;
				setBookings(Array.isArray(res.data) ? res.data : []);
			} catch (err) {
				if (!active) return;
				setError(
					err instanceof Error ? err.message : "Failed to load deposit data.",
				);
			} finally {
				if (active) setLoading(false);
			}
		};

		void fetchDeposits();
		return () => { active = false; };
	}, []);

	const totalDeposit = bookings.reduce((sum, b) => {
		return sum + (Number(b.item?.deposit) || 0);
	}, 0);

	if (loading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center gap-3 px-4 text-center text-textSecondary">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
				<span className="text-sm font-medium sm:text-base">Loading deposits...</span>
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
					Unable to Load Deposits
				</h1>
				<p className="mt-2 text-sm text-textSecondary sm:text-base">{error}</p>
			</div>
		);
	}

	return (
		<div className="w-full space-y-6 px-4 pb-20 sm:px-6 lg:space-y-8 lg:px-8">
			

			<div className="flex flex-col gap-4 rounded-2xl border border-borderLight bg-surface p-5 shadow-sm transition-shadow hover:shadow-md md:flex-row md:items-center md:justify-between sm:p-6 lg:p-8">
				<div>
					<h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl lg:text-4xl">
						<Shield className="h-6 w-6 text-primary sm:h-8 sm:w-8" />
						Deposit Tracker
					</h1>
					<p className="mt-2 text-sm text-textSecondary sm:text-base lg:text-lg">
						Security deposits held from your active rentals.
					</p>
				</div>
				<div className="rounded-xl border border-primary/20 bg-primaryLight px-5 py-3 text-center">
					<p className="text-xs font-semibold text-textSecondary">Total Held</p>
					<p className="text-xl font-extrabold text-primary">
						৳{totalDeposit.toLocaleString()}
					</p>
				</div>
			</div>

			{bookings.length > 0 ? (
				<div className="space-y-4 lg:space-y-5">
					{bookings.map((booking) => {
						const deposit = Number(booking.item?.deposit) || 0;
						return (
							<div
								key={booking.bookingId}
								className="rounded-2xl border border-borderLight bg-surface p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:p-6">
								<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
									<div className="min-w-0 flex-1">
										<h3 className="break-words font-semibold text-textPrimary">
											{booking.item?.title ?? "Untitled Item"}
										</h3>
										<p className="text-sm text-textSecondary">
											Rented by{" "}
											<span className="font-medium text-textPrimary">
												{booking.renter?.name ?? "Unknown"}
											</span>
										</p>
										<div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-textTertiary">
											<span className="flex items-center gap-1">
												<Calendar className="h-4 w-4" />
												{formatDate(booking.startDate)} — {formatDate(booking.endDate)}
											</span>
											<span className="text-textSecondary">
												Rental: ৳{Number(booking.totalPrice).toLocaleString()}
											</span>
										</div>
									</div>
									<div className="flex flex-col items-start gap-1 sm:items-end">
										<p className="text-xs font-semibold text-textSecondary">
											Deposit Held
										</p>
										{deposit > 0 ? (
											<p className="text-lg font-extrabold text-primary">
												৳{deposit.toLocaleString()}
											</p>
										) : (
											<p className="text-sm font-medium text-textTertiary">
												No deposit
											</p>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-borderLight bg-surface px-6 py-16 text-center shadow-sm sm:py-20">
					<div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primaryLight">
						<Shield className="h-10 w-10 text-primary opacity-60" />
					</div>
					<h2 className="text-lg font-bold text-textPrimary sm:text-xl">
						No active deposits
					</h2>
					<p className="mx-auto mt-2 max-w-sm text-sm text-textSecondary sm:text-base">
						Deposits will appear here once renters book your approved listings.
					</p>
				</div>
			)}
		</div>
	);
}
