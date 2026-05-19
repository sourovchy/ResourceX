"use client";

import React, { useState } from "react";
import TrustBadge from "@/components/TrustBadge";
import { Star, TrendingUp, TrendingDown, Edit2, Search, X } from "lucide-react";

const MOCK_USERS = [
	{ id: "U001", name: "Arif Hossain", email: "arif@uni.edu", score: 105 },
	{ id: "U002", name: "Priya Sen", email: "priya@uni.edu", score: 72 },
	{ id: "U003", name: "Mehedi Islam", email: "mehedi@uni.edu", score: 60 },
	{ id: "U004", name: "Tanvir Ahmed", email: "tanvir@uni.edu", score: 45 },
	{ id: "U005", name: "Rafi Uddin", email: "rafi@uni.edu", score: 87 },
	{ id: "U006", name: "Sumaiya Begum", email: "sumaiya@uni.edu", score: 120 },
];

const FULL_AUDIT_LOG = [
	{
		userId: "U006",
		name: "Sumaiya Begum",
		change: +10,
		reason: "Successful rental × 2",
		timestamp: "May 4, 2024 14:32",
	},
	{
		userId: "U001",
		name: "Arif Hossain",
		change: -5,
		reason: "Late return — 2 days overdue",
		timestamp: "May 3, 2024 09:10",
	},
	{
		userId: "U005",
		name: "Rafi Uddin",
		change: +5,
		reason: "Positive review received",
		timestamp: "May 2, 2024 16:44",
	},
	{
		userId: "U002",
		name: "Priya Sen",
		change: -10,
		reason: "Item returned damaged",
		timestamp: "May 1, 2024 12:00",
	},
	{
		userId: "U003",
		name: "Mehedi Islam",
		change: +5,
		reason: "Admin bonus — verified student",
		timestamp: "Apr 30, 2024 10:15",
	},
	{
		userId: "U001",
		name: "Arif Hossain",
		change: +10,
		reason: "Booking completed successfully",
		timestamp: "Apr 28, 2024 17:30",
	},
	{
		userId: "U004",
		name: "Tanvir Ahmed",
		change: -15,
		reason: "Dispute resolved against renter",
		timestamp: "Apr 25, 2024 11:00",
	},
];

export default function AdminTrustScoresPage() {
	const [search, setSearch] = useState("");
	const [adjustUser, setAdjustUser] = useState<(typeof MOCK_USERS)[0] | null>(
		null,
	);
	const [adjustVal, setAdjustVal] = useState("");
	const [adjustReason, setAdjustReason] = useState("");

	const filteredUsers = MOCK_USERS.filter(
		(u) =>
			u.name.toLowerCase().includes(search.toLowerCase()) ||
			u.email.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<div className="max-w-5xl mx-auto space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-textPrimary">Trust Scores</h1>
				<p className="text-textSecondary text-sm mt-1">
					Monitor and manually adjust student trust scores with full audit
					trail.
				</p>
			</div>

			{/* Manual Override Modal */}
			{adjustUser && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
					<div className="bg-surface border border-borderLight rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-bold text-textPrimary">
								Adjust Trust Score
							</h3>
							<button onClick={() => setAdjustUser(null)}>
								<X className="w-5 h-5 text-textTertiary hover:text-textPrimary transition" />
							</button>
						</div>
						<div className="flex items-center gap-3 bg-surfaceVariant rounded-xl p-3">
							<div className="w-9 h-9 rounded-full bg-primaryLight flex items-center justify-center font-bold text-primary text-sm shrink-0">
								{adjustUser.name[0]}
							</div>
							<div>
								<div className="text-sm font-bold text-textPrimary">
									{adjustUser.name}
								</div>
								<div className="text-xs text-textTertiary">
									Current score:{" "}
									<span className="font-bold text-textPrimary">
										{adjustUser.score}
									</span>
								</div>
							</div>
						</div>
						<div>
							<label className="text-xs font-bold text-textSecondary uppercase tracking-wider">
								Adjustment value
							</label>
							<input
								type="number"
								value={adjustVal}
								onChange={(e) => setAdjustVal(e.target.value)}
								placeholder="+10 or -5"
								className="mt-1.5 w-full px-3 py-2.5 bg-surfaceVariant border border-outlineVariant rounded-xl text-textPrimary focus:ring-2 focus:ring-primary outline-none text-sm transition"
							/>
						</div>
						<div>
							<label className="text-xs font-bold text-textSecondary uppercase tracking-wider">
								Reason
							</label>
							<input
								type="text"
								value={adjustReason}
								onChange={(e) => setAdjustReason(e.target.value)}
								placeholder="e.g. Manual override — dispute resolved in favour"
								className="mt-1.5 w-full px-3 py-2.5 bg-surfaceVariant border border-outlineVariant rounded-xl text-textPrimary focus:ring-2 focus:ring-primary outline-none text-sm transition"
							/>
						</div>
						<div className="flex gap-3">
							<button
								onClick={() => setAdjustUser(null)}
								className="flex-1 py-2.5 rounded-xl border border-outlineVariant text-textSecondary font-semibold text-sm hover:bg-surfaceVariant transition">
								Cancel
							</button>
							<button
								onClick={() => {
									setAdjustUser(null);
									setAdjustVal("");
									setAdjustReason("");
								}}
								className="flex-1 py-2.5 rounded-xl bg-primary text-onPrimary font-bold text-sm hover:opacity-90 transition">
								Apply & Log
							</button>
						</div>
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Users trust score list */}
				<div className="bg-surface border border-borderLight rounded-2xl shadow-sm overflow-hidden">
					<div className="px-5 py-4 border-b border-borderLight flex items-center justify-between gap-3">
						<h2 className="font-bold text-textPrimary flex items-center gap-2">
							<Star className="w-4 h-4 text-success" />
							All Users
						</h2>
						<div className="relative">
							<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-textTertiary" />
							<input
								type="text"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search..."
								className="pl-7 pr-3 py-1.5 bg-surfaceVariant border border-outlineVariant rounded-lg text-xs text-textPrimary focus:ring-2 focus:ring-primary outline-none transition w-40"
							/>
						</div>
					</div>
					<div className="divide-y divide-borderLight">
						{filteredUsers.map((u) => (
							<div
								key={u.id}
								className="flex items-center justify-between px-5 py-3.5 hover:bg-surfaceVariant/40 transition-colors">
								<div className="flex items-center gap-3">
									<div className="w-9 h-9 rounded-full bg-primaryLight flex items-center justify-center font-bold text-primary text-sm shrink-0">
										{u.name[0]}
									</div>
									<div>
										<div className="text-sm font-semibold text-textPrimary">
											{u.name}
										</div>
										<div className="text-xs text-textTertiary">{u.email}</div>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<TrustBadge score={u.score} compact={true} />
									<button
										onClick={() => setAdjustUser(u)}
										className="flex items-center gap-1 px-2.5 py-1.5 bg-primaryLight text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition">
										<Edit2 className="w-3 h-3" /> Adjust
									</button>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Audit Log */}
				<div className="bg-surface border border-borderLight rounded-2xl shadow-sm overflow-hidden">
					<div className="px-5 py-4 border-b border-borderLight">
						<h2 className="font-bold text-textPrimary flex items-center gap-2">
							Audit Log
						</h2>
					</div>
					<div className="divide-y divide-borderLight max-h-[480px] overflow-y-auto">
						{FULL_AUDIT_LOG.map((log, i) => (
							<div
								key={i}
								className="flex items-center justify-between px-5 py-3.5">
								<div className="flex items-center gap-3 min-w-0">
									{log.change > 0 ? (
										<TrendingUp className="w-4 h-4 text-success shrink-0" />
									) : (
										<TrendingDown className="w-4 h-4 text-error shrink-0" />
									)}
									<div className="min-w-0">
										<div className="text-xs font-bold text-textPrimary truncate">
											{log.name}
										</div>
										<div className="text-xs text-textSecondary truncate">
											{log.reason}
										</div>
										<div className="text-[10px] text-textTertiary mt-0.5">
											{log.timestamp}
										</div>
									</div>
								</div>
								<span
									className={`text-sm font-extrabold shrink-0 ml-3 ${log.change > 0 ? "text-success" : "text-error"}`}>
									{log.change > 0 ? `+${log.change}` : log.change}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
