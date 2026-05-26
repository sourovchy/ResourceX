"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Loader2 } from "lucide-react";
import api from "@/lib/api";

type BookingStatus =
	| "PENDING"
	| "APPROVED"
	| "ACTIVE"
	| "COMPLETED"
	| "CANCELLED"
	| "REJECTED";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
	PENDING: {
		label: "Pending",
		className: "bg-yellow-100 text-yellow-700",
	},
	APPROVED: {
		label: "Approved",
		className: "bg-blue-100 text-blue-700",
	},
	ACTIVE: {
		label: "Active",
		className: "bg-emerald-100 text-emerald-700",
	},
	COMPLETED: {
		label: "Completed",
		className: "bg-successLight text-successDark border border-successLight",
	},
	CANCELLED: {
		label: "Cancelled",
		className: "bg-errorLight text-errorDark border border-errorLight",
	},
	REJECTED: {
		label: "Rejected",
		className: "bg-red-100 text-red-700",
	},
};

export default function MyBookingsPage() {
	const [bookings, setBookings] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("All");
	const [actionLoading, setActionLoading] = useState<number | null>(null);

	const fetchBookings = async () => {
		try {
			setLoading(true);

			const response = await api.get("/bookings/me");

			setBookings(response.data || []);
			setError(null);
		} catch (err) {
			console.error(err);
			setError("Failed to load bookings");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchBookings();
	}, []);

	const filteredBookings = useMemo(() => {
		if (activeTab === "All") {
			return bookings;
		}

		return bookings.filter((booking) => {
			const status = booking.status;

			if (activeTab === "Active") {
				return status === "ACTIVE" || status === "APPROVED";
			}

			return status === activeTab.toUpperCase();
		});
	}, [bookings, activeTab]);

	const cancelBooking = async (bookingId: number) => {
		try {
			setActionLoading(bookingId);

			await api.patch(`/bookings/${bookingId}/cancel`);

			await fetchBookings();
		} catch (err) {
			console.error(err);
			alert("Failed to cancel booking");
		} finally {
			setActionLoading(null);
		}
	};

	const confirmReturn = async (bookingId: number) => {
		try {
			setActionLoading(bookingId);

			await api.patch(`/bookings/${bookingId}/complete`);

			await fetchBookings();
		} catch (err) {
			console.error(err);
			alert("Failed to confirm return");
		} finally {
			setActionLoading(null);
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
				<p className="text-sm font-medium text-textSecondary sm:text-base">
					Loading your bookings...
				</p>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl space-y-5 px-3 pb-6 sm:space-y-6 sm:px-0 sm:pb-0">
			<h1 className="text-xl font-bold text-textPrimary sm:text-2xl">My Bookings</h1>

			{/* Tabs */}
			<div className="flex overflow-x-auto border-b border-borderLight [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{["All", "Active", "Pending", "Completed", "Cancelled"].map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={`px-3 py-3 text-sm font-semibold whitespace-nowrap transition-colors sm:px-4 ${
							activeTab === tab
								? "border-b-2 border-primary text-primary"
								: "text-textSecondary hover:text-textPrimary"
						}`}>
						{tab}
					</button>
				))}
			</div>

			{/* Error */}
			{error && (
				<div className="rounded-xl bg-errorLight px-4 py-3 text-sm text-errorDark">
					{error}
				</div>
			)}

			{/* Empty */}
			{filteredBookings.length === 0 && (
				<div className="px-4 py-16 text-center text-sm text-textSecondary sm:text-base">
					{activeTab === "All"
						? "No bookings available."
						: `No ${activeTab.toLowerCase()} bookings found`}
				</div>
			)}

			{/* Booking List */}
			<div className="space-y-4 pb-2 sm:space-y-5">
				{filteredBookings.map((booking) => {
					const statusMeta = STATUS_STYLES[booking.status as BookingStatus] || {
						label: booking.status,
						className: "bg-gray-100 text-gray-700",
					};

					const startDate = new Date(booking.startDate).toLocaleDateString(
						"en-US",
						{
							month: "short",
							day: "numeric",
						},
					);

					const endDate = new Date(booking.endDate).toLocaleDateString(
						"en-US",
						{
							month: "short",
							day: "numeric",
						},
					);

					const isProcessing = actionLoading === booking.bookingId;

					return (
						<div
							key={booking.bookingId}
							className="flex flex-col gap-4 rounded-2xl border border-borderLight bg-surfaceVariant p-4 shadow-sm sm:flex-row sm:gap-5 sm:p-5">
							{/* Image */}
							<div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-24">
								<Image
									src={
										booking.item?.imageUrls?.[0] ||
										"https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?auto=format&fit=crop&q=80&w=200&h=150"
									}
									alt={booking.item?.title || "Item"}
									fill
									className="object-cover"
								/>
							</div>

							{/* Info */}
							<div className="flex-1">
								<div className="mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
									<h2 className="min-w-0 text-lg font-bold text-textPrimary break-words">
										{booking.item?.title || "Unknown Item"}
									</h2>

									<span
										className={`rounded-md px-2.5 py-1 text-xs font-bold ${statusMeta.className}`}>
										{statusMeta.label}
									</span>
								</div>

								<div className="space-y-2 text-sm text-textSecondary">
									<div className="flex items-start gap-2">
										<Clock className="w-4 h-4 text-primary" />

										<span>
											{startDate} - {endDate}
										</span>
									</div>

									<div>
										From{" "}
										<strong className="text-textPrimary">
											{booking.item?.owner?.name || "Unknown Owner"}
										</strong>
									</div>

									<div>
										Total:{" "}
										<strong className="text-primary">
											৳ {booking.totalPrice}
										</strong>
									</div>
								</div>
							</div>

							{/* Actions */}
							<div className="flex w-full flex-col gap-2 sm:w-auto">
								{(booking.status === "ACTIVE" ||
									booking.status === "APPROVED") && (
									<button
										disabled={isProcessing}
										onClick={() => confirmReturn(booking.bookingId)}
										className="w-full rounded-xl border border-successLight bg-successLight px-4 py-2 text-sm font-bold text-successDark transition-colors hover:bg-success hover:text-white disabled:opacity-50 sm:w-auto">
										{isProcessing ? "Processing..." : "Confirm Return"}
									</button>
								)}

								{booking.status === "PENDING" && (
									<button
										disabled={isProcessing}
										onClick={() => cancelBooking(booking.bookingId)}
										className="w-full rounded-xl border border-errorLight bg-errorLight px-4 py-2 text-sm font-bold text-errorDark transition-colors hover:bg-error hover:text-white disabled:opacity-50 sm:w-auto">
										{isProcessing ? "Cancelling..." : "Cancel Request"}
									</button>
								)}

								{booking.status === "COMPLETED" && (
									<Link
										href={`/borrow/review/${booking.bookingId}`}
										className="flex items-center justify-center gap-1 rounded-xl border border-primaryLight bg-primaryLight px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white">
										Leave Review
										<ArrowRight className="w-3 h-3" />
									</Link>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
