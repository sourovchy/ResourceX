"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, XCircle, Eye, Package, Loader2 } from "lucide-react";
import api from "@/lib/api";

type FilterType = "ALL" | "AVAILABLE" | "UNAVAILABLE" | "BLOCKED" | "DELETED";

const STATUS_COLORS: Record<string, string> = {
	ACTIVE: "bg-successLight text-success",
};

export default function AdminItemsPage() {
	const [items, setItems] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<FilterType>("ALL");
	const [removeId, setRemoveId] = useState<string | null>(null);
	const [removeReason, setRemoveReason] = useState("");

	const fetchItems = async () => {
		try {
			setLoading(true);
			const response = await api.get("/items");
			setItems(response.data);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchItems();
	}, []);

	const filtered = items.filter((item) => {
		const titleStr = item.title?.toLowerCase() || "";
		const ownerStr = item.owner?.name?.toLowerCase() || "";
		const catStr = item.category?.toLowerCase() || "";
		const searchStr = search.toLowerCase();

		const matchSearch =
			titleStr.includes(searchStr) ||
			ownerStr.includes(searchStr) ||
			catStr.includes(searchStr);

		const matchFilter = filter === "ALL" || item.status === filter;
		return matchSearch && matchFilter;
	});

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
			</div>
		);
	}

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
						{items.length}
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
					{(
						[
							"ALL",
							"AVAILABLE",
							"UNAVAILABLE",
							"BLOCKED",
							"DELETED",
						] as FilterType[]
					).map((f) => (
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
								onClick={async () => {
									if (!removeId) return;
									try {
										await api.post(
											`/admin/block-item/${removeId}?reason=${encodeURIComponent(removeReason)}`,
										);
										fetchItems();
										setRemoveId(null);
										setRemoveReason("");
									} catch (err) {
										console.error(err);
										alert("Failed to remove item");
									}
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
									key={item.itemId}
									className="hover:bg-surfaceVariant/40 transition-colors">
									<td className="px-5 py-3.5">
										<div className="font-semibold text-textPrimary">
											{item.title}
										</div>
										<div className="text-xs text-textTertiary font-mono">
											{item.itemId}
										</div>
									</td>
									<td className="px-5 py-3.5 text-textSecondary">
										{item.owner?.name}
									</td>
									<td className="px-5 py-3.5">
										<span className="text-xs font-semibold bg-primaryLight text-primary px-2.5 py-1 rounded-full">
											{item.category}
										</span>
									</td>
									<td className="px-5 py-3.5 text-textSecondary font-medium">
										৳{item.dailyRate}/day
									</td>
									<td className="px-5 py-3.5">
										<span
											className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.status === "AVAILABLE" ? "bg-successLight text-success" : "bg-surfaceVariant text-textSecondary"}`}>
											{item.status}
										</span>
									</td>
									<td className="px-5 py-3.5 text-textTertiary text-xs">
										{item.createdAt
											? new Date(item.createdAt).toLocaleDateString()
											: "N/A"}
									</td>
									<td className="px-5 py-3.5">
										<div className="flex items-center justify-end gap-2">
											<button
												onClick={() => setRemoveId(item.itemId)}
												className="flex items-center gap-1 px-2.5 py-1.5 bg-errorLight text-error rounded-lg text-xs font-bold hover:bg-error/20 transition">
												<XCircle className="w-3.5 h-3.5" /> Remove
											</button>
											<Link
												href={`/admin/items/${item.itemId}`}
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
