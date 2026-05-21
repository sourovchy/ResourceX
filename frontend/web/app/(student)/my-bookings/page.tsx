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
			<div className="flex flex-col items-center justify-center py-20">
				<Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />

				<p className="text-textSecondary font-medium">
					Loading your bookings...
				</p>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<h1 className="text-2xl font-bold text-textPrimary">My Bookings</h1>

			{/* Tabs */}
			<div className="flex border-b border-borderLight overflow-x-auto">
				{["All", "Active", "Pending", "Completed", "Cancelled"].map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
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
				<div className="bg-errorLight text-errorDark px-4 py-3 rounded-xl">
					{error}
				</div>
			)}

			{/* Empty */}
			{filteredBookings.length === 0 && (
				<div className="text-center py-16 text-textSecondary">
					{activeTab === "All"
						? "No bookings available."
						: `No ${activeTab.toLowerCase()} bookings found`}
				</div>
			)}

			{/* Booking List */}
			<div className="space-y-4">
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
							className="bg-surfaceVariant border border-borderLight rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row gap-5">
							{/* Image */}
							<div className="relative w-full sm:w-24 h-24 shrink-0">
								<Image
									src={
										booking.item?.imageUrls?.[0] ||
										"https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?auto=format&fit=crop&q=80&w=200&h=150"
									}
									alt={booking.item?.title || "Item"}
									fill
									className="object-cover rounded-xl border border-borderLight"
								/>
							</div>

							{/* Info */}
							<div className="flex-1">
								<div className="flex flex-wrap items-center gap-3 mb-2">
									<h2 className="text-lg font-bold text-textPrimary">
										{booking.item?.title || "Unknown Item"}
									</h2>

									<span
										className={`px-2.5 py-1 rounded-md text-xs font-bold ${statusMeta.className}`}>
										{statusMeta.label}
									</span>
								</div>

								<div className="space-y-1 text-sm text-textSecondary">
									<div className="flex items-center gap-2">
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
							<div className="flex flex-col gap-2 w-full sm:w-auto">
								{(booking.status === "ACTIVE" ||
									booking.status === "APPROVED") && (
									<button
										disabled={isProcessing}
										onClick={() => confirmReturn(booking.bookingId)}
										className="px-4 py-2 rounded-xl text-sm font-bold bg-successLight text-successDark border border-successLight hover:bg-success hover:text-white transition-colors disabled:opacity-50">
										{isProcessing ? "Processing..." : "Confirm Return"}
									</button>
								)}

								{booking.status === "PENDING" && (
									<button
										disabled={isProcessing}
										onClick={() => cancelBooking(booking.bookingId)}
										className="px-4 py-2 rounded-xl text-sm font-bold bg-errorLight text-errorDark border border-errorLight hover:bg-error hover:text-white transition-colors disabled:opacity-50">
										{isProcessing ? "Cancelling..." : "Cancel Request"}
									</button>
								)}

								{booking.status === "COMPLETED" && (
									<Link
										href={`/borrow/review/${booking.bookingId}`}
										className="px-4 py-2 rounded-xl text-sm font-bold bg-primaryLight text-primary border border-primaryLight hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-1">
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
