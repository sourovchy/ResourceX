"use client";

import React from "react";
import Link from "next/link";
import {
	ArrowLeft,
	Clock,
	Shield,
	CheckCircle,
	AlertOctagon,
} from "lucide-react";

const ACTIVE_RENTALS = [
	{
		id: "b1",
		title: "Arduino Mega 2560 Kit",
		status: "ACTIVE",
		deadline: "May 20, 2024",
		renter: "Nusrat J.",
		phone: "01700-000000",
		trust: 110,
	},
	{
		id: "b2",
		title: "Sony Alpha A7III DSLR Camera",
		status: "PENDING_HANDOVER",
		startDate: "Today",
		renter: "John Doe",
		phone: "01800-000000",
		trust: 95,
	},
];

export default function ActiveRentalsPage() {
	return (
		<div className="max-w-4xl mx-auto space-y-6 pb-20">
			{/* BACK */}
			<Link
				href="/my-posts"
				className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary hover:text-primary transition">
				<ArrowLeft className="w-4 h-4" /> Back to My Posts
			</Link>

			{/* HEADER */}
			<div>
				<h1 className="text-2xl font-bold text-textPrimary">
					Active Rentals
				</h1>
				<p className="text-sm text-textSecondary">
					Manage items currently rented out to others.
				</p>
			</div>

			{/* EMPTY STATE */}
			{ACTIVE_RENTALS.length === 0 && (
				<div className="text-center py-20 border border-borderLight rounded-2xl bg-surface">
					<p className="text-textSecondary text-sm">
						No active rentals right now.
					</p>
				</div>
			)}

			{/* LIST */}
			<div className="space-y-4">
				{ACTIVE_RENTALS.map((booking) => (
					<div
						key={booking.id}
						className="bg-surface border border-borderLight rounded-2xl p-6 shadow-sm space-y-4">

						{/* HEADER */}
						<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-borderLight">
							<div>
								<h3 className="font-bold text-textPrimary text-lg">
									{booking.title}
								</h3>

								{booking.status === "ACTIVE" && (
									<div className="text-sm font-bold text-primary flex items-center gap-1.5 mt-0.5">
										<Clock className="w-4 h-4" />
										Return Deadline: {booking.deadline}
									</div>
								)}

								{booking.status === "PENDING_HANDOVER" && (
									<div className="text-sm font-bold text-primary flex items-center gap-1.5 mt-0.5">
										<Clock className="w-4 h-4" />
										Start Date: {booking.startDate}
									</div>
								)}
							</div>

							<div
								className={`px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap self-start ${
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
						<div className="bg-surfaceVariant p-4 rounded-xl flex items-center justify-between">
							<div>
								<div className="font-bold text-textPrimary text-sm">
									Renter: {booking.renter}
								</div>
								<div className="text-xs text-textSecondary">
									Phone: {booking.phone}
								</div>
							</div>

							<div className="flex items-center gap-1 bg-successLight text-success px-2 py-1 rounded-md text-xs font-bold">
								<Shield className="w-3.5 h-3.5" /> Trust {booking.trust}
							</div>
						</div>

						{/* ACTIONS */}
						{booking.status === "ACTIVE" && (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-borderLight">
								<Link
									href={`/my-posts/condition-report/${booking.id}?phase=AFTER`}
									className="py-2.5 px-4 bg-surface border border-borderLight text-textSecondary rounded-xl font-bold text-xs text-center hover:bg-borderLight transition">
									Condition Report
								</Link>

								<button className="py-2.5 px-4 bg-primary text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1">
									<CheckCircle className="w-3.5 h-3.5" />
									Mark Returned
								</button>

								<Link
									href={`/my-posts/penalty/${booking.id}`}
									className="py-2.5 px-4 bg-errorLight text-error rounded-xl font-bold text-xs flex items-center justify-center gap-1 col-span-1 lg:col-span-2">
									<AlertOctagon className="w-3.5 h-3.5" />
									Report Damage / Penalty
								</Link>
							</div>
						)}

						{booking.status === "PENDING_HANDOVER" && (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-borderLight">
								<Link
									href={`/my-posts/condition-report/${booking.id}?phase=BEFORE`}
									className="py-2.5 px-4 bg-surface border border-borderLight text-textSecondary rounded-xl font-bold text-xs text-center hover:bg-borderLight transition">
									Pre-handover Report
								</Link>

								<button className="py-2.5 px-4 bg-primary text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1">
									<CheckCircle className="w-3.5 h-3.5" />
									Confirm Handover
								</button>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}