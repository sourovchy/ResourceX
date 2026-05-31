"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
	AlertCircle,
	CalendarDays,
	CheckCircle,
	Loader2,
	MessageSquare,
	Phone,
	Shield,
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { formatDateRange, formatShortDate } from "@/lib/dateUtils";
import { extractErrorMessage } from "@/lib/errorUtils";
import MessageModal from "@/components/misc/MessageModal";

type ActiveBooking = {
	bookingId: number;
	startDate: string;
	endDate: string;
	status: string;
	totalPrice: number;
	item: {
		itemId: number;
		title: string;
		dailyRate: number;
	};
	renter: {
		userId: number;
		name: string;
		email: string;
		studentProfile?: {
			phone?: string | null;
			trustScore?: number | null;
			department?: string | null;
			university?: string | null;
		} | null;
	};
};

export default function ActiveRentalsPage() {
	const { toast } = useToast();
	const [bookings, setBookings] = useState<ActiveBooking[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [completeTarget, setCompleteTarget] = useState<number | null>(null);
	const [completing, setCompleting] = useState(false);
	const [messageTarget, setMessageTarget] = useState<{ userId: number; name: string } | null>(null);

	const load = async () => {
		try {
			setLoading(true);
			setError("");
			const res = await api.get("/bookings/owner");
			const all: ActiveBooking[] = Array.isArray(res.data) ? res.data : [];
			// Only APPROVED bookings are "active" rentals
			setBookings(all.filter((b) => b.status === "APPROVED"));
		} catch (err) {
			setError(extractErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { load(); }, []);

	const markCompleted = async () => {
		if (!completeTarget) return;
		setCompleting(true);
		try {
			await api.patch(`/bookings/${completeTarget}/complete`);
			toast("Rental marked as completed.");
			setCompleteTarget(null);
			await load();
		} catch (err) {
			toast(extractErrorMessage(err), "error");
		} finally {
			setCompleting(false);
		}
	};

	const today = new Date().toISOString().split("T")[0];

	return (
		<div className="w-full space-y-5 px-3 pb-16 sm:px-4 sm:pb-20 lg:px-0">
			<div>
				<h1 className="text-xl font-bold text-textPrimary sm:text-2xl">
					Active Rentals
				</h1>
				<p className="text-sm text-textSecondary">
					Items you have approved and are currently rented out.
				</p>
			</div>

			{loading && (
				<div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-textSecondary">
					<Loader2 className="h-7 w-7 animate-spin text-primary" />
					<span className="text-sm font-medium">Loading rentals…</span>
				</div>
			)}

			{!loading && error && (
				<div className="flex items-center gap-3 rounded-xl border border-error/40 bg-errorLight px-4 py-3 text-sm font-medium text-error">
					<AlertCircle className="h-4 w-4 shrink-0" />
					{error}
				</div>
			)}

			{!loading && !error && bookings.length === 0 && (
				<div className="rounded-2xl border border-borderLight bg-surface py-16 text-center">
					<p className="text-sm text-textSecondary">
						No active rentals right now.
					</p>
					<Link
						href="/my-posts/requests"
						className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
						View pending requests →
					</Link>
				</div>
			)}

			{!loading && !error && bookings.length > 0 && (
				<div className="space-y-4">
					{bookings.map((booking) => {
						const started = booking.startDate <= today;
						const overdue  = booking.endDate < today;
						const phase = overdue
							? "Overdue"
							: started
							? "In Progress"
							: "Awaiting Handover";
						const phaseClass = overdue
							? "bg-errorLight text-errorDark"
							: started
							? "bg-successLight text-successDark"
							: "bg-warningLight text-warningDark";

						return (
							<div
								key={booking.bookingId}
								className="space-y-4 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-5">
								{/* Header */}
								<div className="flex flex-col gap-2 border-b border-borderLight pb-4 sm:flex-row sm:items-center sm:justify-between">
									<div className="min-w-0">
										<h3 className="font-bold text-textPrimary">
											{booking.item?.title}
										</h3>
										<div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-textSecondary">
											<span className="flex items-center gap-1">
												<CalendarDays className="h-3.5 w-3.5" />
												{formatDateRange(booking.startDate, booking.endDate)}
											</span>
											<span className="font-semibold text-textPrimary">
												৳&thinsp;{Number(booking.totalPrice).toLocaleString()}
											</span>
										</div>
									</div>
									<span className={`self-start whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-bold ${phaseClass}`}>
										{phase}
									</span>
								</div>

								{/* Renter info */}
								<div className="flex flex-col gap-2 rounded-xl bg-surfaceVariant p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
									<div>
										<p className="text-sm font-bold text-textPrimary">
											{booking.renter?.name}
										</p>
										{booking.renter?.studentProfile?.phone && (
											<a
												href={`tel:${booking.renter.studentProfile.phone}`}
												className="mt-0.5 flex items-center gap-1 text-xs text-textSecondary hover:text-primary">
												<Phone className="h-3 w-3" />
												{booking.renter.studentProfile.phone}
											</a>
										)}
										{booking.renter?.studentProfile?.department && (
											<p className="mt-0.5 text-xs text-textSecondary">
												{booking.renter.studentProfile.department}
											</p>
										)}
									</div>
									{booking.renter?.studentProfile?.trustScore != null && (
										<span className="flex items-center gap-1 self-start rounded-md bg-successLight px-2 py-1 text-xs font-bold text-successDark">
											<Shield className="h-3 w-3" />
											Trust {booking.renter.studentProfile.trustScore}
										</span>
									)}
								</div>

								{/* Actions */}
								<div className="flex flex-col gap-3 border-t border-borderLight pt-3 sm:flex-row">
									<button
										onClick={() => setCompleteTarget(booking.bookingId)}
										className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primaryDark">
										<CheckCircle className="h-4 w-4" />
										{started ? "Mark as Returned" : "Confirm Handover"}
									</button>

									{booking.renter?.userId && (
										<button
											onClick={() =>
												setMessageTarget({
													userId: booking.renter.userId,
													name: booking.renter.name ?? "Renter",
												})
											}
											className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-borderLight bg-surface px-4 py-2.5 text-sm font-semibold text-textSecondary transition-colors hover:border-primary hover:bg-primaryLight hover:text-primary">
											<MessageSquare className="h-4 w-4" />
											Message Renter
										</button>
									)}

									<Link
										href={`/disputes?bookingId=${booking.bookingId}`}
										className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-borderLight bg-surface px-4 py-2.5 text-sm font-semibold text-textSecondary transition-colors hover:bg-surfaceVariant">
										Raise Dispute
									</Link>
								</div>
							</div>
						);
					})}
				</div>
			)}

			<ConfirmModal
				isOpen={completeTarget !== null}
				title="Mark Rental as Completed"
				message="Confirm the item has been returned in good condition. This sets the booking to COMPLETED, makes the item available again, releases the deposit, and lets the renter leave a review. This cannot be undone."
				confirmText="Confirm Return"
				cancelText="Cancel"
				isLoading={completing}
				onConfirm={markCompleted}
				onCancel={() => setCompleteTarget(null)}
			/>

			{messageTarget && (
				<MessageModal
					isOpen={true}
					targetUserId={messageTarget.userId}
					targetName={messageTarget.name}
					onClose={() => setMessageTarget(null)}
				/>
			)}
		</div>
	);
}
