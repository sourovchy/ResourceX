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
		<div className="mx-auto max-w-4xl space-y-5 px-3 pb-16 sm:px-4 sm:pb-20 lg:px-0">
			{/* BACK */}
			<Link
				href="/my-posts"
				className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary transition hover:text-primary">
				<ArrowLeft className="w-4 h-4" /> Back to My Posts
			</Link>

			{/* HEADER */}
			<div>
				<h1 className="text-xl font-bold text-textPrimary sm:text-2xl">
					Active Rentals
				</h1>
				<p className="text-sm text-textSecondary sm:text-base">
					Manage items currently rented out to others.
				</p>
			</div>

			{/* EMPTY STATE */}
			{ACTIVE_RENTALS.length === 0 && (
				<div className="rounded-2xl border border-borderLight bg-surface py-16 text-center sm:py-20">
					<p className="text-sm text-textSecondary sm:text-base">
						No active rentals right now.
					</p>
				</div>
			)}

			{/* LIST */}
			<div className="space-y-3 sm:space-y-4">
				{ACTIVE_RENTALS.map((booking) => (
					<div
						key={booking.id}
						className="space-y-4 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6">

						{/* HEADER */}
						<div className="flex flex-col gap-2 border-b border-borderLight pb-4 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h3 className="text-base font-bold text-textPrimary sm:text-lg">
									{booking.title}
								</h3>

								{booking.status === "ACTIVE" && (
									<div className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-primary">
										<Clock className="h-4 w-4" />
										Return Deadline: {booking.deadline}
									</div>
								)}

								{booking.status === "PENDING_HANDOVER" && (
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
									Renter: {booking.renter}
								</div>
								<div className="text-xs text-textSecondary sm:text-sm">
									Phone: {booking.phone}
								</div>
							</div>

							<div className="flex items-center gap-1 rounded-md bg-successLight px-2 py-1 text-xs font-bold text-success">
								<Shield className="w-3.5 h-3.5" /> Trust {booking.trust}
							</div>
						</div>

						{/* ACTIONS */}
						{booking.status === "ACTIVE" && (
							<div className="grid grid-cols-1 gap-3 border-t border-borderLight pt-4 sm:grid-cols-2 lg:grid-cols-4">
								<Link
									href={`/my-posts/condition-report/${booking.id}?phase=AFTER`}
									className="rounded-xl border border-borderLight bg-surface px-4 py-2.5 text-center text-xs font-bold text-textSecondary transition hover:bg-borderLight">
									Condition Report
								</Link>

								<button className="flex items-center justify-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white">
									<CheckCircle className="h-3.5 w-3.5" />
									Mark Returned
								</button>

								<Link
									href={`/my-posts/penalty/${booking.id}`}
									className="col-span-1 flex items-center justify-center gap-1 rounded-xl bg-errorLight px-4 py-2.5 text-xs font-bold text-error lg:col-span-2">
									<AlertOctagon className="h-3.5 w-3.5" />
									Report Damage / Penalty
								</Link>
							</div>
						)}

						{booking.status === "PENDING_HANDOVER" && (
							<div className="grid grid-cols-1 gap-3 border-t border-borderLight pt-4 md:grid-cols-2">
								<Link
									href={`/my-posts/condition-report/${booking.id}?phase=BEFORE`}
									className="rounded-xl border border-borderLight bg-surface px-4 py-2.5 text-center text-xs font-bold text-textSecondary transition hover:bg-borderLight">
									Pre-handover Report
								</Link>

								<button className="flex items-center justify-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white">
									<CheckCircle className="h-3.5 w-3.5" />
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