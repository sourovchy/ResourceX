"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { AlertTriangle, ArrowRight, Clock, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/context/ToastContext";
import { formatDateRange } from "@/lib/dateUtils";
import { extractErrorMessage } from "@/lib/errorUtils";

// Backend statuses: PENDING | APPROVED | COMPLETED | CANCELLED | REJECTED
const STATUS_STYLES: Record<string, { label: string; className: string }> = {
	PENDING:   { label: "Awaiting Owner Response", className: "bg-warningLight text-warningDark" },
	APPROVED:  { label: "Approved",  className: "bg-primaryLight text-primaryDark" },
	COMPLETED: { label: "Completed", className: "bg-successLight text-successDark" },
	CANCELLED: { label: "Cancelled", className: "bg-errorLight text-errorDark" },
	REJECTED:  { label: "Rejected",  className: "bg-errorLight text-error" },
};

const TABS = ["All", "Pending", "Approved", "Completed", "Cancelled"] as const;
type Tab = (typeof TABS)[number];

export default function StudentBookings() {
	const { toast } = useToast();
	const [bookings, setBookings] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<Tab>("All");
	const [actionLoading, setActionLoading] = useState<number | null>(null);
	const [cancelTarget, setCancelTarget] = useState<number | null>(null);

	const load = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await api.get("/bookings/me");
			setBookings(Array.isArray(res.data) ? res.data : []);
		} catch (err) {
			setError(extractErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { load(); }, []);

	const filtered = useMemo(() => {
		if (activeTab === "All") return bookings;
		const key = activeTab.toUpperCase();
		// "Approved" tab shows APPROVED bookings only
		return bookings.filter((b) => b.status === key);
	}, [bookings, activeTab]);

	const cancelBooking = async (bookingId: number) => {
		setCancelTarget(null);
		setActionLoading(bookingId);
		try {
			await api.patch(`/bookings/${bookingId}/cancel`);
			await load();
			toast("Booking request cancelled.");
		} catch (err) {
			toast(extractErrorMessage(err), "error");
		} finally {
			setActionLoading(null);
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
				<p className="text-sm font-medium text-textSecondary">Loading your bookings…</p>
			</div>
		);
	}

	return (
		<div className="w-full space-y-5 px-3 pb-6 sm:space-y-6 sm:px-0 sm:pb-0">
			<h1 className="text-xl font-bold text-textPrimary sm:text-2xl">My Bookings</h1>

			{/* Tab bar */}
			<div className="flex overflow-x-auto border-b border-borderLight [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{TABS.map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={`whitespace-nowrap px-3 py-3 text-sm font-semibold transition-colors sm:px-4 ${
							activeTab === tab
								? "border-b-2 border-primary text-primary"
								: "text-textSecondary hover:text-textPrimary"
						}`}>
						{tab}
					</button>
				))}
			</div>

			{error && (
				<div className="flex items-start gap-3 rounded-xl border border-error bg-errorLight/30 px-4 py-3 text-sm text-errorDark">
					<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
					{error}
				</div>
			)}

			{filtered.length === 0 && !error && (
				<div className="rounded-2xl border border-borderLight bg-surface px-4 py-16 text-center text-sm text-textSecondary">
					{activeTab === "All"
						? "You have no bookings yet."
						: `No ${activeTab.toLowerCase()} bookings.`}
				</div>
			)}

			<div className="space-y-4 pb-2 sm:space-y-5">
				{filtered.map((booking) => {
					const rawStatus = (booking.status ?? "PENDING").toUpperCase();
					const meta = STATUS_STYLES[rawStatus] ?? {
						label: rawStatus,
						className: "bg-surfaceVariant text-textSecondary",
					};
					const isProcessing = actionLoading === booking.bookingId;
					const isPending   = rawStatus === "PENDING";
					const isApproved  = rawStatus === "APPROVED";
					const isCompleted = rawStatus === "COMPLETED";

					return (
						<div
							key={booking.bookingId}
							className="flex flex-col gap-4 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:flex-row sm:gap-5 sm:p-5">
							{/* Item image */}
							<div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-24">
								<SafeImage
									src={booking.item?.imageUrls?.[0]}
									alt={booking.item?.title ?? "Item"}
									fill
									className="object-cover"
								/>
							</div>

							{/* Info */}
							<div className="flex-1 min-w-0">
								<div className="mb-2 flex flex-wrap items-center gap-2">
									<h2 className="font-bold text-textPrimary">
										{booking.item?.title ?? "Unknown Item"}
									</h2>
									<span className={`rounded-md px-2.5 py-1 text-xs font-bold ${meta.className}`}>
										{meta.label}
									</span>
								</div>

								<div className="space-y-1.5 text-sm text-textSecondary">
									<div className="flex items-center gap-2">
										<Clock className="h-3.5 w-3.5 text-primary" />
										{formatDateRange(booking.startDate, booking.endDate)}
									</div>
									<div>
										From{" "}
										<strong className="text-textPrimary">
											{booking.item?.owner?.name ?? "Unknown Owner"}
										</strong>
									</div>
									<div>
										Total:{" "}
										<strong className="text-primary">
											৳&thinsp;{Number(booking.totalPrice).toLocaleString()}
										</strong>
									</div>
									{booking.rejectionReason && rawStatus === "REJECTED" && (
										<div className="mt-1 rounded-xl bg-errorLight/30 px-3 py-2 text-xs text-errorDark">
											<strong>Reason:</strong> {booking.rejectionReason}
										</div>
									)}
								</div>
							</div>

							{/* Actions */}
							<div className="flex w-full flex-col gap-2 sm:w-auto">
								{/* Cancel — only while PENDING */}
								{isPending && (
									<button
										disabled={isProcessing}
										onClick={() => setCancelTarget(booking.bookingId)}
										className="w-full rounded-xl border border-errorLight bg-errorLight px-4 py-2 text-sm font-bold text-errorDark transition-colors hover:bg-error hover:text-white disabled:opacity-50 sm:w-auto">
										{isProcessing ? (
											<span className="flex items-center justify-center gap-1.5">
												<Loader2 className="h-3.5 w-3.5 animate-spin" />
												Cancelling…
											</span>
										) : (
											"Cancel Request"
										)}
									</button>
								)}

								{/* Leave Review — only when COMPLETED */}
								{isCompleted && (
									<Link
										href={`/borrow/review/${booking.bookingId}`}
										className="flex items-center justify-center gap-1 rounded-xl border border-primaryLight bg-primaryLight px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white">
										Leave Review
										<ArrowRight className="h-3 w-3" />
									</Link>
								)}
							</div>
						</div>
					);
				})}
			</div>

			<ConfirmModal
				isOpen={cancelTarget !== null}
				title="Cancel Booking Request"
				message="Are you sure you want to cancel this booking request? This action cannot be undone."
				confirmText="Yes, Cancel"
				cancelText="Keep Booking"
				isDestructive
				onConfirm={() => cancelTarget !== null && cancelBooking(cancelTarget)}
				onCancel={() => setCancelTarget(null)}
			/>
		</div>
	);
}
