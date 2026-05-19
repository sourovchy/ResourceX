"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PlusCircle, Search, Scale, FileText } from "lucide-react";

const MOCK_DISPUTES = [
	{
		id: "DSP-1002",
		bookingItem: "Sony Alpha A7III Camera",
		dateFiled: "May 1, 2024",
		status: "OPEN",
		statusColor: "bg-warningLight text-warningDark",
		description:
			"Owner falsely claimed I scratched the display. I have pre-handover photos to prove otherwise.",
		adminDecision: null,
	},
	{
		id: "DSP-0994",
		bookingItem: "Calculus Textbook Vol 2",
		dateFiled: "April 15, 2024",
		status: "RESOLVED",
		statusColor: "bg-successLight text-successDark",
		description: "Renter did not return the item on time and is unresponsive.",
		adminDecision:
			"Renter found at fault. Deposit of ৳ 100 deducted and given to Owner. Trust score penalty applied to renter.",
	},
	{
		id: "DSP-0811",
		bookingItem: "Camping Tent",
		dateFiled: "March 2, 2024",
		status: "DISMISSED",
		statusColor:
			"bg-surfaceVariant text-textSecondary border border-borderLight",
		description: "Tent zipper is slightly stiff.",
		adminDecision:
			"Dismissed due to normal wear and tear expectation. No penalty.",
	},
];

export default function MyDisputesPage() {
	return (
		<div className="max-w-5xl mx-auto space-y-6 pb-20">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary tracking-tight">
						My Disputes & Case History
					</h1>
					<p className="text-sm text-textSecondary mt-1">
						View all disputes you've raised, track their status, and see admin decisions.
					</p>
				</div>
				<Link
					href="/disputes/raise"
					className="flex items-center gap-2 px-5 py-2.5 bg-error text-white rounded-xl font-bold text-sm shadow-sm hover:bg-errorDark transition-colors">
					<Scale className="w-4 h-4" /> Raise a Dispute
				</Link>
			</div>

			<div className="bg-surface border border-borderLight rounded-2xl shadow-sm flex flex-col overflow-hidden">
				<div className="px-6 py-4 border-b border-borderLight bg-surfaceVariant flex items-center justify-between">
					<h2 className="font-bold text-sm text-textPrimary uppercase tracking-wider">
						Your Dispute Records
					</h2>
				</div>

				<div className="divide-y divide-borderLight">
					{MOCK_DISPUTES.map((d) => (
						<div key={d.id} className="p-6">
							<div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
								<div>
									<div className="flex items-center gap-3">
										<h3 className="font-bold text-textPrimary text-lg">
											{d.bookingItem}
										</h3>
										<span
											className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${d.statusColor}`}>
											{d.status}
										</span>
									</div>
									<div className="text-xs font-semibold text-textSecondary mt-1">
										Ticket: {d.id} • Filed on {d.dateFiled}
									</div>
								</div>
							</div>

							<div className="bg-surfaceVariant rounded-xl p-4 text-sm text-textSecondary flex items-start gap-3">
								<FileText className="w-4 h-4 shrink-0 mt-0.5" />
								<div>
									<span className="font-bold text-textPrimary mr-1">
										Your claim:
									</span>
									{d.description}
								</div>
							</div>

							{d.adminDecision && (
								<div
									className={`mt-4 p-4 rounded-xl text-sm ${d.status === "RESOLVED" ? "bg-successLight/50 border border-success/20" : "bg-surface border border-borderLight"}`}>
									<div className="font-bold uppercase tracking-wider text-[11px] mb-1 flex items-center gap-1.5 flex flex-row">
										Admin Decision
									</div>
									<div className="text-textPrimary font-medium">
										{d.adminDecision}
									</div>
								</div>
							)}

							{d.status === "OPEN" && (
								<div className="mt-4 text-xs font-semibold text-warningDark bg-warningLight inline-block px-3 py-1.5 rounded-lg border border-warning/20">
									Under Review. Await admin response.
								</div>
							)}
						</div>
					))}
					{MOCK_DISPUTES.length === 0 && (
						<div className="p-12 text-center text-textSecondary">
							You have no open or past disputes.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
