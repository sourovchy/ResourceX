"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
	Clock,
	Shield,
	CheckCircle,
	AlertOctagon,
    Loader2,
    AlertCircle,
} from "lucide-react";
import api from "@/lib/api";
import { BookingResponse } from "@/types/booking";

export default function ActiveRentalsPage() {
    const [bookings, setBookings] = useState<BookingResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function fetchRentals() {
            try {
                // Owner's bookings where they rented out items
                const response = await api.get<BookingResponse[]>("/bookings/owner");
                if (!active) return;
                
                // Filter for rentals that are either approved (awaiting handover) or active
                const activeRentals = (response.data || []).filter(
                    b => b.status === "ACTIVE" || b.status === "APPROVED"
                );
                
                setBookings(activeRentals);
            } catch (err) {
                if (active) setError("Failed to load active rentals. Please try again.");
            } finally {
                if (active) setLoading(false);
            }
        }

        void fetchRentals();

        return () => { active = false; };
    }, []);

	return (
		<div className="mx-auto max-w-4xl space-y-5 px-3 pb-16 sm:px-4 sm:pb-20 lg:px-0">
			{/* HEADER */}
			<div>
				<h1 className="text-xl font-bold text-textPrimary sm:text-2xl">
					Active Rentals
				</h1>
				<p className="text-sm text-textSecondary sm:text-base">
					Manage items currently rented out to others.
				</p>
			</div>

			{/* LOADING STATE */}
            {loading && (
                <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-textSecondary">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-sm font-medium">Loading rentals...</span>
                </div>
            )}

            {/* ERROR STATE */}
            {error && (
                <div className="flex items-center gap-3 rounded-xl border border-error/40 bg-errorLight px-4 py-3 text-sm font-medium text-error animate-slide-down">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

			{/* EMPTY STATE */}
			{!loading && !error && bookings.length === 0 && (
				<div className="rounded-2xl border border-borderLight bg-surface py-16 text-center sm:py-20 animate-fade-in">
					<p className="text-sm text-textSecondary sm:text-base">
						No active rentals right now.
					</p>
				</div>
			)}

			{/* LIST */}
			{!loading && !error && bookings.length > 0 && (
			<div className="space-y-3 sm:space-y-4 animate-fade-in stagger-children">
				{bookings.map((booking) => (
					<div
						key={booking.bookingId}
						className="space-y-4 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6">

						{/* HEADER */}
						<div className="flex flex-col gap-2 border-b border-borderLight pb-4 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h3 className="text-base font-bold text-textPrimary sm:text-lg">
									{booking.item?.title || "Unknown Item"}
								</h3>

								{booking.status === "ACTIVE" && (
									<div className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-primary">
										<Clock className="h-4 w-4" />
										Return Deadline: {booking.endDate}
									</div>
								)}

								{booking.status === "APPROVED" && (
									<div className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-primary">
										<Clock className="h-4 w-4" />
										Start Date: {booking.startDate}
									</div>
								)}
							</div>

							<div
								className={`self-start rounded-lg px-3 py-1.5 text-sm font-bold whitespace-nowrap ${
									booking.status === "ACTIVE"
										? "bg-successLight text-successDark"
										: "bg-warningLight text-warningDark"
								}`}>
								{booking.status === "ACTIVE"
									? "Currently with Renter"
									: "Awaiting Handover"}
							</div>
						</div>

						{/* RENTER */}
						<div className="flex flex-col gap-3 rounded-xl bg-surfaceVariant p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
							<div>
								<div className="text-sm font-bold text-textPrimary">
									Renter: {booking.renter?.name || "Unknown Renter"}
								</div>
								<div className="text-xs text-textSecondary sm:text-sm">
									Phone: {booking.renter?.phone || "N/A"}
								</div>
							</div>

							<div className="flex items-center gap-1 rounded-md bg-successLight px-2 py-1 text-xs font-bold text-success">
								<Shield className="w-3.5 h-3.5" /> Trust {booking.renter?.studentProfile?.trustScore ?? "N/A"}
							</div>
						</div>

						{/* ACTIONS */}
						{booking.status === "ACTIVE" && (
							<div className="grid grid-cols-1 gap-3 border-t border-borderLight pt-4 sm:grid-cols-2 lg:grid-cols-4">
								<Link
									href={`/my-posts/condition-report/${booking.bookingId}?phase=AFTER`}
									className="rounded-xl border border-borderLight bg-surface px-4 py-2.5 text-center text-xs font-bold text-textSecondary transition hover:bg-borderLight">
									Condition Report
								</Link>

								<button className="flex items-center justify-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-primaryDark">
									<CheckCircle className="h-3.5 w-3.5" />
									Mark Returned
								</button>

								<Link
									href={`/my-posts/penalty/${booking.bookingId}`}
									className="col-span-1 flex items-center justify-center gap-1 rounded-xl bg-errorLight px-4 py-2.5 text-xs font-bold text-error lg:col-span-2 transition hover:bg-errorLight/80">
									<AlertOctagon className="h-3.5 w-3.5" />
									Report Damage / Penalty
								</Link>
							</div>
						)}

						{booking.status === "APPROVED" && (
							<div className="grid grid-cols-1 gap-3 border-t border-borderLight pt-4 md:grid-cols-2">
								<Link
									href={`/my-posts/condition-report/${booking.bookingId}?phase=BEFORE`}
									className="rounded-xl border border-borderLight bg-surface px-4 py-2.5 text-center text-xs font-bold text-textSecondary transition hover:bg-borderLight">
									Pre-handover Report
								</Link>

								<button className="flex items-center justify-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-primaryDark">
									<CheckCircle className="h-3.5 w-3.5" />
									Confirm Handover
								</button>
							</div>
						)}
					</div>
				))}
			</div>
            )}
		</div>
	);
}