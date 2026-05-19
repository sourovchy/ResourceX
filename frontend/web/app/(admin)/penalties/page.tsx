"use client";

import React, { useState } from "react";
import { DollarSign, CheckCircle2, XCircle, Edit2, X } from "lucide-react";

const MOCK_PENALTIES = [
	{
		id: "PEN-001",
		bookingId: "BK-2041",
		owner: "Sumaiya Begum",
		renter: "Arif Hossain",
		reason:
			"Camera LCD cracked during rental period. Estimated repair cost ৳4,500.",
		amount: 4500,
		deposit: 2000,
		status: "PENDING",
		date: "May 5, 2024",
	},
	{
		id: "PEN-002",
		bookingId: "BK-2037",
		owner: "Tanvir Ahmed",
		renter: "Fahim Chowdhury",
		reason: "Missing speaker cable and carrying case. Replacement cost ৳1,200.",
		amount: 1200,
		deposit: 1000,
		status: "PENDING",
		date: "May 3, 2024",
	},
	{
		id: "PEN-003",
		bookingId: "BK-2030",
		owner: "Rafi Uddin",
		renter: "Priya Sen",
		reason: "Late return penalty — 3 days overdue at ৳50/day.",
		amount: 150,
		deposit: 500,
		status: "APPROVED",
		date: "Apr 22, 2024",
	},
	{
		id: "PEN-004",
		bookingId: "BK-2028",
		owner: "Nusrat Jahan",
		renter: "Mehedi Islam",
		reason:
			"Minor scuffs on casing. Owner requests ৳800 but item condition acceptable.",
		amount: 800,
		deposit: 1500,
		status: "WAIVED",
		date: "Apr 18, 2024",
	},
];

const STATUS_STYLES: Record<string, string> = {
	PENDING: "bg-warningLight text-warning",
	APPROVED: "bg-successLight text-success",
	WAIVED: "bg-surfaceVariant text-textSecondary",
};

export default function AdminPenaltiesPage() {
	const [modifyId, setModifyId] = useState<string | null>(null);
	const [modifyAmount, setModifyAmount] = useState("");

	const pending = MOCK_PENALTIES.filter((p) => p.status === "PENDING").length;

	return (
		<div className="max-w-5xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary">
						Penalty Override
					</h1>
					<p className="text-textSecondary text-sm mt-1">
						Review penalty requests and approve, modify, or waive them.
					</p>
				</div>
				{pending > 0 && (
					<div className="flex items-center gap-2 bg-warningLight border border-warning/40 text-warning px-4 py-2 rounded-xl text-sm font-bold">
						<DollarSign className="w-4 h-4" />
						{pending} Pending
					</div>
				)}
			</div>

			{/* Modify Amount Modal */}
			{modifyId && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
					<div className="bg-surface border border-borderLight rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-bold text-textPrimary">
								Modify Penalty Amount
							</h3>
							<button onClick={() => setModifyId(null)}>
								<X className="w-5 h-5 text-textTertiary hover:text-textPrimary transition" />
							</button>
						</div>
						<p className="text-sm text-textSecondary">
							Enter the new approved penalty amount:
						</p>
						<div className="relative">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-textTertiary font-medium">
								৳
							</span>
							<input
								type="number"
								value={modifyAmount}
								onChange={(e) => setModifyAmount(e.target.value)}
								placeholder="0"
								className="w-full pl-8 pr-4 py-2.5 bg-surfaceVariant border border-outlineVariant rounded-xl text-textPrimary focus:ring-2 focus:ring-primary outline-none text-sm transition"
							/>
						</div>
						<div className="flex gap-3">
							<button
								onClick={() => setModifyId(null)}
								className="flex-1 py-2.5 rounded-xl border border-outlineVariant text-textSecondary font-semibold text-sm hover:bg-surfaceVariant transition">
								Cancel
							</button>
							<button
								onClick={() => setModifyId(null)}
								className="flex-1 py-2.5 rounded-xl bg-primary text-onPrimary font-bold text-sm hover:opacity-90 transition">
								Apply
							</button>
						</div>
					</div>
				</div>
			)}

			<div className="space-y-4">
				{MOCK_PENALTIES.map((p) => (
					<div
						key={p.id}
						className={`bg-surface border rounded-2xl shadow-sm p-5 ${
							p.status === "PENDING"
								? "border-warning/40"
								: "border-borderLight"
						}`}>
						<div className="flex flex-col sm:flex-row items-start justify-between gap-4">
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-3 flex-wrap mb-2">
									<span className="font-mono text-xs font-bold text-textTertiary">
										{p.id}
									</span>
									<span className="font-mono text-xs text-textTertiary">
										Booking: {p.bookingId}
									</span>
									<span
										className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[p.status]}`}>
										{p.status}
									</span>
									<span className="text-xs text-textTertiary">{p.date}</span>
								</div>
								<div className="text-sm text-textSecondary mb-1">
									<span className="font-semibold text-textPrimary">
										{p.owner}
									</span>{" "}
									(owner) →{" "}
									<span className="font-semibold text-textPrimary">
										{p.renter}
									</span>{" "}
									(renter)
								</div>
								<p className="text-sm text-textSecondary leading-relaxed">
									{p.reason}
								</p>
								<div className="flex items-center gap-6 mt-3">
									<div>
										<div className="text-xs text-textTertiary">Requested</div>
										<div className="text-lg font-extrabold text-textPrimary">
											৳{p.amount.toLocaleString()}
										</div>
									</div>
									<div>
										<div className="text-xs text-textTertiary">
											Available Deposit
										</div>
										<div className="text-lg font-extrabold text-success">
											৳{p.deposit.toLocaleString()}
										</div>
									</div>
								</div>
							</div>

							{p.status === "PENDING" && (
								<div className="flex flex-col gap-2 shrink-0">
									<button className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-xl text-sm font-bold hover:opacity-90 transition shadow">
										<CheckCircle2 className="w-4 h-4" /> Approve
									</button>
									<button
										onClick={() => {
											setModifyId(p.id);
											setModifyAmount(String(p.amount));
										}}
										className="flex items-center gap-2 px-4 py-2 bg-primaryLight text-primary border border-primary/30 rounded-xl text-sm font-bold hover:bg-primary/20 transition">
										<Edit2 className="w-4 h-4" /> Modify
									</button>
									<button className="flex items-center gap-2 px-4 py-2 bg-surfaceVariant text-textSecondary border border-outlineVariant rounded-xl text-sm font-bold hover:bg-borderLight transition">
										<XCircle className="w-4 h-4" /> Waive
									</button>
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
