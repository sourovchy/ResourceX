"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, XCircle, Eye, Package } from "lucide-react";

const MOCK_ITEMS = [
	{
		id: "IT-101",
		title: "DSLR Camera Kit – Sony A7III",
		owner: "Sumaiya Begum",
		category: "Electronics",
		price: "৳500/day",
		status: "ACTIVE",
		submitted: "May 4, 2024",
	},
	{
		id: "IT-102",
		title: "Scientific Calculator – Casio fx-991EX",
		owner: "Arif Hossain",
		category: "Electronics",
		price: "৳20/day",
		status: "ACTIVE",
		submitted: "Apr 20, 2024",
	},
	{
		id: "IT-103",
		title: "Arduino Mega Kit",
		owner: "Rafi Uddin",
		category: "Lab Equipment",
		price: "৳80/day",
		status: "ACTIVE",
		submitted: "May 3, 2024",
	},
	{
		id: "IT-104",
		title: "Calculus Textbook Vol 2",
		owner: "Priya Sen",
		category: "Books",
		price: "৳15/day",
		status: "ACTIVE",
		submitted: "Mar 28, 2024",
	},
	{
		id: "IT-105",
		title: "JBL PartyBox 310",
		owner: "Tanvir Ahmed",
		category: "Audio/Visual",
		price: "৳800/day",
		status: "ACTIVE",
		submitted: "Apr 10, 2024",
	},
	{
		id: "IT-106",
		title: "Projector – Epson EB-X51",
		owner: "Nusrat Jahan",
		category: "Electronics",
		price: "৳300/day",
		status: "ACTIVE",
		submitted: "May 5, 2024",
	},
	{
		id: "IT-107",
		title: "Organic Chemistry Set",
		owner: "Mehedi Islam",
		category: "Lab Equipment",
		price: "৳50/day",
		status: "ACTIVE",
		submitted: "Feb 14, 2024",
	},
];

type FilterType = "ALL" | "ACTIVE";

const STATUS_COLORS: Record<string, string> = {
	ACTIVE: "bg-successLight text-success",
};

export default function AdminItemsPage() {
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<FilterType>("ALL");
	const [removeId, setRemoveId] = useState<string | null>(null);
	const [removeReason, setRemoveReason] = useState("");

	const filtered = MOCK_ITEMS.filter((item) => {
		const matchSearch =
			item.title.toLowerCase().includes(search.toLowerCase()) ||
			item.owner.toLowerCase().includes(search.toLowerCase()) ||
			item.category.toLowerCase().includes(search.toLowerCase());

		const matchFilter = filter === "ALL" || item.status === filter;
		return matchSearch && matchFilter;
	});

	return (
		<div className="max-w-7xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary">
						Item Moderation
					</h1>
					<p className="text-textSecondary text-sm mt-1">
						Review and remove inappropriate item listings.
					</p>
				</div>
				<div className="flex items-center gap-2 bg-surface border border-borderLight px-3 py-2 rounded-xl shadow-sm text-sm text-textSecondary">
					<Package className="w-4 h-4" />
					<span className="font-bold text-textPrimary">
						{MOCK_ITEMS.length}
					</span>{" "}
					items
				</div>
			</div>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textTertiary" />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by title, owner, or category..."
						className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outlineVariant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textPrimary text-sm"
					/>
				</div>
				<div className="flex flex-wrap gap-2 shrink-0">
					{(["ALL", "ACTIVE"] as FilterType[]).map((f) => (
						<button
							key={f}
							onClick={() => setFilter(f)}
							className={`px-4 py-2 rounded-xl text-sm font-semibold transition border ${
								filter === f
									? "bg-primary text-onPrimary border-primary shadow"
									: "bg-surface border-outlineVariant text-textSecondary hover:bg-surfaceVariant"
							}`}>
							{f}
						</button>
					))}
				</div>
			</div>

			{/* Remove Modal */}
			{removeId && (
				<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
					<div className="bg-surface border border-borderLight rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
						<h3 className="text-lg font-bold text-textPrimary">Remove Item</h3>
						<p className="text-sm text-textSecondary">
							Provide a reason. This will be sent as a notification to the
							owner.
						</p>
						<textarea
							value={removeReason}
							onChange={(e) => setRemoveReason(e.target.value)}
							rows={3}
							placeholder="e.g. This listing is inappropriate and violates platform rules."
							className="w-full px-3 py-2.5 bg-surfaceVariant border border-outlineVariant rounded-xl text-sm text-textPrimary focus:ring-2 focus:ring-primary outline-none resize-none transition"
						/>
						<div className="flex gap-3">
							<button
								onClick={() => {
									setRemoveId(null);
									setRemoveReason("");
								}}
								className="flex-1 py-2.5 rounded-xl border border-outlineVariant text-textSecondary font-semibold text-sm hover:bg-surfaceVariant transition">
								Cancel
							</button>
							<button
								onClick={() => {
									setRemoveId(null);
									setRemoveReason("");
								}}
								className="flex-1 py-2.5 rounded-xl bg-error text-white font-bold text-sm hover:opacity-90 transition">
								Confirm Remove
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Table */}
			<div className="bg-surface border border-borderLight rounded-2xl shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-borderLight bg-surfaceVariant/60">
								<th className="px-5 py-3.5 text-left text-xs font-bold text-textTertiary uppercase tracking-wider">
									Item
								</th>
								<th className="px-5 py-3.5 text-left text-xs font-bold text-textTertiary uppercase tracking-wider">
									Owner
								</th>
								<th className="px-5 py-3.5 text-left text-xs font-bold text-textTertiary uppercase tracking-wider">
									Category
								</th>
								<th className="px-5 py-3.5 text-left text-xs font-bold text-textTertiary uppercase tracking-wider">
									Price
								</th>
								<th className="px-5 py-3.5 text-left text-xs font-bold text-textTertiary uppercase tracking-wider">
									Status
								</th>
								<th className="px-5 py-3.5 text-left text-xs font-bold text-textTertiary uppercase tracking-wider">
									Submitted
								</th>
								<th className="px-5 py-3.5 text-right text-xs font-bold text-textTertiary uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-borderLight">
							{filtered.map((item) => (
								<tr
									key={item.id}
									className="hover:bg-surfaceVariant/40 transition-colors">
									<td className="px-5 py-3.5">
										<div className="font-semibold text-textPrimary">
											{item.title}
										</div>
										<div className="text-xs text-textTertiary font-mono">
											{item.id}
										</div>
									</td>
									<td className="px-5 py-3.5 text-textSecondary">
										{item.owner}
									</td>
									<td className="px-5 py-3.5">
										<span className="text-xs font-semibold bg-primaryLight text-primary px-2.5 py-1 rounded-full">
											{item.category}
										</span>
									</td>
									<td className="px-5 py-3.5 text-textSecondary font-medium">
										{item.price}
									</td>
									<td className="px-5 py-3.5">
										<span
											className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[item.status]}`}>
											{item.status}
										</span>
									</td>
									<td className="px-5 py-3.5 text-textTertiary text-xs">
										{item.submitted}
									</td>
									<td className="px-5 py-3.5">
										<div className="flex items-center justify-end gap-2">
											<button
												onClick={() => setRemoveId(item.id)}
												className="flex items-center gap-1 px-2.5 py-1.5 bg-errorLight text-error rounded-lg text-xs font-bold hover:bg-error/20 transition">
												<XCircle className="w-3.5 h-3.5" /> Remove
											</button>
											<Link
												href={`items/${item.id}`}
												className="flex items-center gap-1 px-2.5 py-1.5 bg-surfaceVariant text-textSecondary rounded-lg text-xs font-bold hover:bg-borderLight transition">
												<Eye className="w-3.5 h-3.5" /> View
											</Link>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{filtered.length === 0 && (
						<div className="py-16 text-center text-textTertiary">
							<Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
							No items match your filter.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
