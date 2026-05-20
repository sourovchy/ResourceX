"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Clock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

type BookingStatus = "active" | "pending" | "completed" | "cancelled";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
	PENDING: {
		label: "Pending",
		className: "bg-yellow-100 text-yellow-700",
	},
	APPROVED: {
		label: "Active",
		className: "bg-emerald-100 text-emerald-700",
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
};

export default function MyBookingsPage() {
	const [bookings, setBookings] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("All");

	useEffect(() => {
		const fetchBookings = async () => {
			try {
				setLoading(true);
				const response = await api.get("/bookings");
				setBookings(response.data);
				setError(null);
			} catch (err) {
				console.error("Error fetching bookings:", err);
				setError("Failed to load bookings.");
			} finally {
				setLoading(false);
			}
		};

		fetchBookings();
	}, []);

	const filteredBookings =
		activeTab === "All"
			? bookings
			: bookings.filter((b) => {
					const status = b.status?.toUpperCase();
					if (activeTab === "Active")
						return status === "ACTIVE" || status === "APPROVED";
					return status === activeTab.toUpperCase();
				});

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
				<p className="text-textSecondary font-medium">
					Loading your bookings...
				</p>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<h1 className="text-2xl font-bold text-textPrimary tracking-tight">
				My Bookings
			</h1>

			{/* Tabs */}
			<div className="flex border-b border-borderLight -mb-2">
				{["All", "Active", "Pending", "Completed", "Cancelled"].map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={`px-4 py-3 text-sm font-semibold transition-colors ${
							activeTab === tab
								? "border-b-2 border-primary text-primary"
								: "text-textSecondary hover:text-textPrimary"
						}`}>
						{tab}
					</button>
				))}
			</div>

			{/* Empty State */}
			{filteredBookings.length === 0 && (
				<p className="text-center text-textSecondary py-10">
					{activeTab === "All"
						? "No bookings found"
						: `You have no ${activeTab.toLowerCase()} bookings`}
				</p>
			)}

			{/* Booking Cards */}
			<div className="space-y-4 pt-2">
				{filteredBookings.map((b) => {
					const statusMeta = STATUS_STYLES[b.status] || {
						label: b.status,
						className: "bg-gray-100 text-gray-700",
					};
					const startDate = new Date(b.startDate).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
					});
					const endDate = new Date(b.endDate).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
					});

					return (
						<div
							key={b.bookingId}
							className="bg-surfaceVariant border border-borderLight rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5 animate-in slide-in-from-bottom-2 duration-300">
							{/* Image */}
							<div className="relative w-full sm:w-24 h-24 shrink-0">
								<Image
									src={
										b.item?.imageUrls?.[0] ||
										"https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?auto=format&fit=crop&q=80&w=200&h=150"
									}
									alt={`${b.item?.title} booking item`}
									fill
									className="object-cover rounded-xl border border-borderLight"
								/>
							</div>

							{/* Info */}
							<div className="flex-1 w-full text-left">
								<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
									<h3 className="font-bold text-textPrimary truncate text-lg">
										{b.item?.title || "Unknown Item"}
									</h3>

									<span
										className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap ${statusMeta.className}`}>
										{statusMeta.label}
									</span>
								</div>

								<div className="text-sm text-textSecondary space-y-1">
									<div className="flex items-center gap-1.5">
										<Clock className="w-4 h-4 text-primary" />
										{startDate} - {endDate}
									</div>

									<div className="flex items-center gap-1.5 mt-1">
										From:
										<strong className="text-textPrimary">
											{b.item?.owner?.name || "Campus Owner"}
										</strong>
										• Total:
										<strong className="text-primary font-bold">
											৳ {b.totalPrice}
										</strong>
									</div>
								</div>
							</div>

							{/* Actions */}
							<div className="w-full sm:w-auto flex flex-col gap-2 shrink-0">
								{(b.status === "ACTIVE" || b.status === "APPROVED") && (
									<button className="px-4 py-2 bg-successLight text-successDark border border-successLight rounded-xl text-sm font-bold w-full transition-colors hover:bg-success hover:text-white">
										Confirm Return
									</button>
								)}

								{b.status === "PENDING" && (
									<button className="px-4 py-2 bg-errorLight text-errorDark border border-errorLight rounded-xl text-sm font-bold w-full transition-colors hover:bg-error hover:text-white">
										Cancel Request
									</button>
								)}

								{b.status === "COMPLETED" && (
									<Link
										href={`/borrow/review/${b.bookingId}`}
										className="px-4 py-2 bg-primaryLight text-primary border border-primaryLight rounded-xl text-sm font-bold w-full transition-colors hover:bg-primary hover:text-white flex justify-center items-center gap-1">
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
