"use client";

import React, { useState } from "react";
import { ShieldAlert, CheckCircle2, X } from "lucide-react";

const MOCK_DISPUTES = [
	{
		id: "D-001",
		bookingId: "BK-2041",
		raisedBy: "Arif Hossain",
		against: "Sumaiya Begum",
		reason:
			"Item returned damaged – camera body has a visible crack on LCD screen.",
		evidence: "Photo evidence attached (3 images)",
		status: "OPEN",
		date: "May 5, 2024",
	},
	{
		id: "D-002",
		bookingId: "BK-2039",
		raisedBy: "Priya Sen",
		against: "Arif Hossain",
		reason: "Owner did not hand over the item at the agreed time and location.",
		evidence: "Chat screenshot provided",
		status: "OPEN",
		date: "May 4, 2024",
	},
	{
		id: "D-003",
		bookingId: "BK-2035",
		raisedBy: "Mehedi Islam",
		against: "Nusrat Jahan",
		reason:
			"Security deposit was not returned 3 days after item was returned in good condition.",
		evidence: "Return confirmation receipt",
		status: "RESOLVED",
		date: "Apr 28, 2024",
		resolution: "Deposit refunded manually by admin. Owner warned.",
	},
	{
		id: "D-004",
		bookingId: "BK-2037",
		raisedBy: "Fahim Chowdhury",
		against: "Tanvir Ahmed",
		reason: "Speaker was returned with a missing cable and carrying case.",
		evidence: "None uploaded",
		status: "OPEN",
		date: "May 3, 2024",
	},
];

export default function AdminDisputesPage() {
	const [activeDispute, setActiveDispute] = useState<string | null>(null);
	const [decision, setDecision] = useState("");
	const [filterOpen, setFilterOpen] = useState<"ALL" | "OPEN" | "RESOLVED">(
		"ALL",
	);

	const filtered = MOCK_DISPUTES.filter(
		(d) => filterOpen === "ALL" || d.status === filterOpen,
	);

	const openCount = MOCK_DISPUTES.filter((d) => d.status === "OPEN").length;

	return (
		<div className="max-w-5xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary">
						Dispute Center
					</h1>
					<p className="text-textSecondary text-sm mt-1">
						Review and resolve platform disputes between renters and owners.
					</p>
				</div>
				{openCount > 0 && (
					<div className="flex items-center gap-2 bg-errorLight border border-error/30 text-error px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
						<ShieldAlert className="w-4 h-4" />
						{openCount} Open
					</div>
				)}
			</div>

			{/* Filter tabs */}
			<div className="flex gap-2">
				{(["ALL", "OPEN", "RESOLVED"] as const).map((f) => (
					<button
						key={f}
						onClick={() => setFilterOpen(f)}
						className={`px-4 py-2 rounded-xl text-sm font-semibold transition border ${
							filterOpen === f
								? f === "OPEN"
									? "bg-error text-white border-error shadow"
									: "bg-primary text-onPrimary border-primary shadow"
								: "bg-surface border-outlineVariant text-textSecondary hover:bg-surfaceVariant"
						}`}>
						{f}
					</button>
				))}
			</div>

			{/* Dispute Cards */}
			<div className="space-y-4">
				{filtered.map((d) => (
					<div
						key={d.id}
						className={`bg-surface border rounded-2xl shadow-sm overflow-hidden ${
							d.status === "OPEN" ? "border-error/40" : "border-borderLight"
						}`}>
						<div className="p-5">
							<div className="flex items-start justify-between gap-4 flex-wrap">
								<div className="min-w-0">
									<div className="flex items-center gap-3 flex-wrap">
										<span className="font-mono text-xs font-bold text-textTertiary">
											{d.id}
										</span>
										<span className="font-mono text-xs text-textTertiary">
											Booking: {d.bookingId}
										</span>
										<span
											className={`text-xs font-bold px-2.5 py-1 rounded-full ${
												d.status === "OPEN"
													? "bg-errorLight text-error"
													: "bg-successLight text-success"
											}`}>
											{d.status}
										</span>
									</div>
									<div className="flex items-center gap-2 mt-2 text-sm">
										<span className="font-semibold text-textPrimary">
											{d.raisedBy}
										</span>
										<span className="text-textTertiary">vs</span>
										<span className="font-semibold text-textPrimary">
											{d.against}
										</span>
										<span className="text-xs text-textTertiary ml-1">
											· {d.date}
										</span>
									</div>
									<p className="mt-2 text-sm text-textSecondary leading-relaxed">
										{d.reason}
									</p>
									<div className="mt-2 flex items-center gap-2 text-xs text-textTertiary">
										<span className="font-bold">Evidence:</span> {d.evidence}
									</div>
									{d.resolution && (
										<div className="mt-3 bg-successLight border border-success/20 rounded-lg px-4 py-2 text-xs text-success">
											<span className="font-bold">Resolution: </span>
											{d.resolution}
										</div>
									)}
								</div>
								{d.status === "OPEN" && (
									<button
										onClick={() => setActiveDispute(d.id)}
										className="shrink-0 flex items-center gap-2 px-4 py-2 bg-primary text-onPrimary rounded-xl text-sm font-bold hover:opacity-90 transition shadow">
										<CheckCircle2 className="w-4 h-4" /> Resolve
									</button>
								)}
							</div>
						</div>

						{/* Resolve panel */}
						{activeDispute === d.id && (
							<div className="border-t border-borderLight bg-surfaceVariant/50 p-5 space-y-3">
								<div className="flex items-center justify-between">
									<h3 className="font-bold text-textPrimary text-sm">
										Admin Decision
									</h3>
									<button onClick={() => setActiveDispute(null)}>
										<X className="w-4 h-4 text-textTertiary hover:text-textPrimary transition" />
									</button>
								</div>
								<p className="text-xs text-textSecondary">
									Your decision will be sent as a notification to both parties.
								</p>
								<textarea
									value={decision}
									onChange={(e) => setDecision(e.target.value)}
									rows={3}
									placeholder="Write your resolution decision here... e.g. After reviewing evidence, a partial refund of ৳500 has been issued."
									className="w-full px-3 py-2.5 bg-surface border border-outlineVariant rounded-xl text-sm text-textPrimary focus:ring-2 focus:ring-primary outline-none resize-none transition"
								/>
								<div className="flex gap-3">
									<button
										onClick={() => setActiveDispute(null)}
										className="px-4 py-2.5 rounded-xl border border-outlineVariant text-textSecondary font-semibold text-sm hover:bg-surface transition">
										Cancel
									</button>
									<button
										onClick={() => {
											setActiveDispute(null);
											setDecision("");
										}}
										className="px-5 py-2.5 rounded-xl bg-success text-white font-bold text-sm hover:opacity-90 transition shadow">
										Submit Decision & Resolve
									</button>
								</div>
							</div>
						)}
					</div>
				))}

				{filtered.length === 0 && (
					<div className="py-16 text-center text-textTertiary bg-surface border border-borderLight rounded-2xl">
						<ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-30" />
						No disputes in this category.
					</div>
				)}
			</div>
		</div>
	);
}
