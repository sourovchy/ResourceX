"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
	Clock,
	Calendar,
	Package,
	CheckCircle2,
	XCircle,
	ArrowRight,
	Loader2,
} from "lucide-react";
import api from "@/lib/api";

export default function HistoryPage() {
	const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");
	const [history, setHistory] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchHistory = async () => {
			try {
				const response = await api.get("/bookings/my");
				const completedBookings = response.data.filter(
					(b: any) =>
						b.status === "COMPLETED" ||
						b.status === "CANCELLED" ||
						b.status === "REJECTED",
				);
				setHistory(completedBookings);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		fetchHistory();
	}, []);

	const sortedHistory = [...history].sort((a, b) => {
		const dateA = new Date(a.endDate || a.startDate);
		const dateB = new Date(b.endDate || b.startDate);
		return sortBy === "recent"
			? dateB.getTime() - dateA.getTime()
			: dateA.getTime() - dateB.getTime();
	});

	if (loading) {
		return (
			<div className="flex justify-center py-20">
				<Loader2 className="w-10 h-10 text-primary animate-spin" />
			</div>
		);
	}

	return (
		<div className="max-w-5xl mx-auto space-y-6 pb-20">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary">
						Rental History
					</h1>
					<p className="text-textSecondary text-sm mt-1">
						{history.length} completed rentals
					</p>
				</div>
				<select
					value={sortBy}
					onChange={(e) => setSortBy(e.target.value as "recent" | "oldest")}
					className="px-3 py-2 bg-surface border border-borderLight rounded-lg text-textPrimary text-sm focus:ring-2 focus:ring-primary">
					<option value="recent">Most Recent</option>
					<option value="oldest">Oldest First</option>
				</select>
			</div>

			<div className="space-y-3">
				{sortedHistory.map((rental) => (
					<div
						key={rental.id}
						className="bg-surface border border-borderLight rounded-xl p-5 hover:shadow-md transition-shadow">
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1">
								<div className="flex items-start justify-between mb-2">
									<div>
										<h3 className="font-semibold text-textPrimary">
											{rental.itemName}
										</h3>
										<p className="text-sm text-textSecondary">
											from {rental.ownerName}
										</p>
									</div>
									<div className="text-right">
										<p className="font-bold text-primary">
											৳{rental.totalPrice}
										</p>
										<p className="text-xs text-textTertiary mt-1 font-bold">
											{rental.status}
										</p>
									</div>
								</div>

								<div className="flex items-center gap-4 text-sm text-textTertiary mt-3">
									<span className="flex items-center gap-1">
										<Calendar className="w-4 h-4" />
										{new Date(rental.startDate).toLocaleDateString()} to{" "}
										{new Date(rental.endDate).toLocaleDateString()}
									</span>
								</div>
							</div>

							<Link
								href={`/my-bookings`}
								className="px-3 py-2 text-sm font-semibold rounded-lg bg-primaryLight text-primary hover:bg-primary hover:text-onPrimary transition">
								Details
							</Link>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
