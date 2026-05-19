"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
	Clock,
	Calendar,
	Package,
	CheckCircle2,
	XCircle,
	ArrowRight,
} from "lucide-react";

const MOCK_HISTORY = [
	{
		id: "BK-001",
		item: "Sony Alpha A7III",
		owner: "John Doe",
		startDate: "May 1, 2024",
		endDate: "May 3, 2024",
		amount: "৳1,500",
		status: "COMPLETED",
		rating: 5,
		returnedOnTime: true,
	},
	{
		id: "BK-002",
		item: "Arduino Mega Kit",
		owner: "Nusrat J.",
		startDate: "Apr 25, 2024",
		endDate: "Apr 28, 2024",
		amount: "৳240",
		status: "COMPLETED",
		rating: 4,
		returnedOnTime: true,
	},
	{
		id: "BK-003",
		item: "Calculus Textbook Vol 2",
		owner: "Sam I.",
		startDate: "Apr 15, 2024",
		endDate: "Apr 22, 2024",
		amount: "৳105",
		status: "COMPLETED",
		rating: 3,
		returnedOnTime: false,
	},
	{
		id: "BK-004",
		item: "Projector – Epson",
		owner: "Mike J.",
		startDate: "Apr 1, 2024",
		endDate: "Apr 5, 2024",
		amount: "৳1,200",
		status: "COMPLETED",
		rating: 5,
		returnedOnTime: true,
	},
	{
		id: "BK-005",
		item: "Wireless Microphone",
		owner: "Emma W.",
		startDate: "Mar 20, 2024",
		endDate: "Mar 25, 2024",
		amount: "৳600",
		status: "COMPLETED",
		rating: 4,
		returnedOnTime: true,
	},
];

export default function HistoryPage() {
	const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");

	const sortedHistory = [...MOCK_HISTORY].sort((a, b) => {
		const dateA = new Date(a.endDate);
		const dateB = new Date(b.endDate);
		return sortBy === "recent"
			? dateB.getTime() - dateA.getTime()
			: dateA.getTime() - dateB.getTime();
	});

	return (
		<div className="max-w-5xl mx-auto space-y-6 pb-20">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary">
						Rental History
					</h1>
					<p className="text-textSecondary text-sm mt-1">
						{MOCK_HISTORY.length} completed rentals
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
											{rental.item}
										</h3>
										<p className="text-sm text-textSecondary">
											from {rental.owner}
										</p>
									</div>
									<div className="text-right">
										<p className="font-bold text-primary">{rental.amount}</p>
										<p className="text-xs text-textTertiary mt-1">
											{rental.status}
										</p>
									</div>
								</div>

								<div className="flex items-center gap-4 text-sm text-textTertiary mt-3">
									<span className="flex items-center gap-1">
										<Calendar className="w-4 h-4" />
										{rental.startDate} to {rental.endDate}
									</span>
									{rental.returnedOnTime ? (
										<span className="flex items-center gap-1 text-success">
											<CheckCircle2 className="w-4 h-4" />
											Returned on time
										</span>
									) : (
										<span className="flex items-center gap-1 text-warning">
											<Clock className="w-4 h-4" />
											Late return
										</span>
									)}
									<span className="text-amber-500">⭐ {rental.rating}/5</span>
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
