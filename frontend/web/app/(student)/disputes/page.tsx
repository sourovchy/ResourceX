"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Scale } from "lucide-react";
import {
	AlertTriangle,
	CheckCircle2,
	Clock,
	MessageSquare,
	FileText,
	Upload,
} from "lucide-react";

const MOCK_DISPUTES = [
	{
		id: "D-001",
		bookingId: "BK-2041",
		item: "DSLR Camera Kit – Sony A7III",
		against: "Sumaiya Begum",
		reason:
			"Item returned damaged – camera body has a visible crack on LCD screen.",
		evidence: "3 images uploaded",
		status: "OPEN",
		date: "May 5, 2024",
		severity: "HIGH",
	},
	{
		id: "D-002",
		bookingId: "BK-2039",
		item: "Scientific Calculator – Casio fx-991EX",
		against: "Arif Hossain",
		reason: "Owner did not hand over the item at the agreed time and location.",
		evidence: "Chat screenshot provided",
		status: "OPEN",
		date: "May 4, 2024",
		severity: "MEDIUM",
	},
	{
		id: "D-003",
		bookingId: "BK-2035",
		item: "Projector – Epson EB-X04",
		against: "Nusrat Jahan",
		reason: "Security deposit was not returned 3 days after item was returned.",
		evidence: "Return confirmation receipt",
		status: "RESOLVED",
		date: "Apr 28, 2024",
		severity: "MEDIUM",
		resolution: "Deposit refunded. Owner warned.",
	},
];

const statusColors: Record<string, { bg: string; text: string }> = {
	OPEN: { bg: "bg-errorLight", text: "text-error" },
	RESOLVED: { bg: "bg-successLight", text: "text-success" },
};

const severityColors: Record<string, string> = {
	HIGH: "text-error",
	MEDIUM: "text-warning",
	LOW: "text-success",
};

export default function DisputesPage() {
	const [selectedDispute, setSelectedDispute] = useState<
		(typeof MOCK_DISPUTES)[0] | null
	>(null);

	return (
		<div className="max-w-5xl mx-auto space-y-6 pb-20">
			<div className="flex flex-col items-start gap-4">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary tracking-tight">
						Disputes
					</h1>
					<p className="text-sm text-textSecondary mt-1">
						View your dispute history or raise a new issue for admin review.
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Link
						href="/disputes/my"
						className="flex items-center gap-2 px-4 py-2 bg-surface border border-borderLight text-textPrimary rounded-xl font-semibold text-sm hover:bg-surfaceVariant transition">
						<FileText className="w-4 h-4" />
						My Disputes
					</Link>

					<Link
						href="/disputes/raise"
						className="flex items-center gap-2 px-4 py-2 bg-error text-white rounded-xl font-bold text-sm shadow-sm hover:bg-errorDark transition-colors">
						<Scale className="w-4 h-4" />
						Raise a Dispute
					</Link>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Disputes List */}
				<div className="lg:col-span-2 space-y-3">
					{MOCK_DISPUTES.length === 0 ? (
						<div className="bg-surface border border-borderLight rounded-xl p-8 text-center">
							<CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
							<p className="text-textSecondary">No disputes. All good!</p>
						</div>
					) : (
						MOCK_DISPUTES.map((dispute) => (
							<div
								key={dispute.id}
								onClick={() => setSelectedDispute(dispute)}
								className={`bg-surface border cursor-pointer transition-all rounded-xl p-5 ${
									selectedDispute?.id === dispute.id
										? "border-primary shadow-md"
										: "border-borderLight hover:border-primary hover:shadow-sm"
								}`}>
								<div className="flex items-start gap-4">
									<div
										className={`p-3 rounded-lg ${statusColors[dispute.status].bg}`}>
										{dispute.status === "OPEN" ? (
											<AlertTriangle
												className={`w-5 h-5 ${statusColors[dispute.status].text}`}
											/>
										) : (
											<CheckCircle2
												className={`w-5 h-5 ${statusColors[dispute.status].text}`}
											/>
										)}
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between gap-2">
											<div>
												<h3 className="font-semibold text-textPrimary truncate">
													{dispute.item}
												</h3>
												<p className="text-sm text-textSecondary mt-1">
													Booking #{dispute.bookingId} • {dispute.date}
												</p>
											</div>
											<span
												className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${statusColors[dispute.status].bg} ${statusColors[dispute.status].text}`}>
												{dispute.status}
											</span>
										</div>
										<p className="text-sm text-textSecondary mt-2 line-clamp-2">
											{dispute.reason}
										</p>
										<div className="flex items-center gap-4 mt-3 text-xs text-textTertiary">
											<span className="flex items-center gap-1">
												<Upload className="w-3 h-3" />
												{dispute.evidence}
											</span>
											<span
												className={`font-semibold ${severityColors[dispute.severity]}`}>
												{dispute.severity} Severity
											</span>
										</div>
									</div>
								</div>
							</div>
						))
					)}
				</div>

				{/* Detail Panel */}
				{selectedDispute && (
					<div className="bg-surface border border-borderLight rounded-xl p-6 shadow-md space-y-4">
						<div>
							<h3 className="font-bold text-textPrimary mb-2">
								Dispute Details
							</h3>
							<div className="space-y-3 text-sm">
								<div>
									<p className="text-textTertiary font-medium">Dispute ID</p>
									<p className="text-textPrimary font-semibold">
										{selectedDispute.id}
									</p>
								</div>
								<div>
									<p className="text-textTertiary font-medium">Against</p>
									<p className="text-textPrimary">{selectedDispute.against}</p>
								</div>
								<div>
									<p className="text-textTertiary font-medium">Status</p>
									<span
										className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[selectedDispute.status].bg} ${statusColors[selectedDispute.status].text}`}>
										{selectedDispute.status}
									</span>
								</div>
								<div>
									<p className="text-textTertiary font-medium">Full Reason</p>
									<p className="text-textPrimary mt-1">
										{selectedDispute.reason}
									</p>
								</div>
								{selectedDispute.resolution && (
									<div className="bg-successLight/50 border border-success/30 rounded-lg p-3 mt-2">
										<p className="text-sm font-semibold text-success mb-1">
											✓ Resolution
										</p>
										<p className="text-sm text-textPrimary">
											{selectedDispute.resolution}
										</p>
									</div>
								)}
							</div>
						</div>

						{selectedDispute.status === "OPEN" && (
							<div className="space-y-2 pt-2 border-t border-borderLight">
								<button className="w-full bg-primary hover:bg-primaryDark text-onPrimary py-2 rounded-lg font-semibold text-sm transition">
									<MessageSquare className="w-4 h-4 inline mr-2" />
									Message Admin
								</button>
								<button className="w-full bg-surface border border-borderLight text-textPrimary hover:bg-primaryLight/10 py-2 rounded-lg font-semibold text-sm transition">
									<FileText className="w-4 h-4 inline mr-2" />
									Add Evidence
								</button>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
