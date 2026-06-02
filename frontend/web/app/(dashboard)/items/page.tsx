"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
	Search,
	Eye,
	Package,
	Loader2,
} from "lucide-react";

import api from "@/lib/api";
import { formatShortDate } from "@/lib/dateUtils";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

type FilterType =
	| "ALL"
	| "AVAILABLE"
	| "UNAVAILABLE"
	| "BLOCKED"
	| "DELETED"
	| "PENDING"
	| "BOOKED";

type ItemStatus =
	| "AVAILABLE"
	| "UNAVAILABLE"
	| "BLOCKED"
	| "DELETED"
	| "PENDING"
	| "BOOKED";

interface Item {
	itemId: string | number;
	title: string;
	category: string;
	dailyRate: number;
	status: ItemStatus;
	createdAt?: string;
	owner?: {
		userId?: string | number;
		name?: string;
		email?: string;
	};
}

interface ItemApiResponse {
	itemId?: string | number;
	id?: string | number;
	title?: string;
	name?: string;
	category?: string;
	categoryName?: string;
	dailyRate?: number | string;
	pricePerDay?: number | string;
	status?: string;
	createdAt?: string;
	owner?: {
		userId?: string | number;
		id?: string | number;
		name?: string;
		email?: string;
	};
	user?: {
		userId?: string | number;
		id?: string | number;
		name?: string;
		email?: string;
	};
}

const FILTERS: FilterType[] = [
	"ALL",
	"AVAILABLE",
	"PENDING",
	"BOOKED",
	"UNAVAILABLE",
	"BLOCKED",
	"DELETED",
];

function normalizeStatus(status?: string): ItemStatus {
	const value = status?.toUpperCase();

	if (
		value === "AVAILABLE" ||
		value === "UNAVAILABLE" ||
		value === "BLOCKED" ||
		value === "DELETED" ||
		value === "PENDING" ||
		value === "BOOKED"
	) {
		return value;
	}

	return "PENDING";
}

function normalizeItem(data: ItemApiResponse): Item {
	const ownerSource = data.owner ?? data.user;

	return {
		itemId: data.itemId ?? data.id ?? "",
		title: data.title ?? data.name ?? "Untitled Item",
		category: data.category ?? data.categoryName ?? "Uncategorized",
		dailyRate: Number(data.dailyRate ?? data.pricePerDay ?? 0),
		status: normalizeStatus(data.status),
		createdAt: data.createdAt,
		owner: ownerSource
			? {
				userId: ownerSource.userId ?? ownerSource.id,
				name: ownerSource.name,
				email: ownerSource.email,
			}
			: undefined,
	};
}

function formatDate(value?: string) {
	if (!value) return "N/A";

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "N/A";
	}

	return formatShortDate(date);
}

function getStatusClass(status: ItemStatus) {
	switch (status) {
		case "AVAILABLE":
			return "bg-successLight text-success";
		case "PENDING":
			return "bg-warningLight text-warning";
		case "BLOCKED":
		case "DELETED":
			return "bg-errorLight text-error";
		case "BOOKED":
			return "bg-primaryLight text-primary";
		default:
			return "bg-surfaceVariant text-textSecondary";
	}
}

export default function AdminItemsPage() {
	const [items, setItems] = useState<Item[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<FilterType>("ALL");

	const fetchItems = async () => {
		try {
			setLoading(true);
			setError("");

			const response = await api.get("/items");
			const raw = response.data;

			const list = Array.isArray(raw)
				? raw
				: Array.isArray(raw?.data)
					? raw.data
					: Array.isArray(raw?.content)
						? raw.content
						: [];

			setItems(list.map(normalizeItem));
		} catch (err) {
			console.error(err);
			setError("Failed to load items.");
			setItems([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void fetchItems();
	}, []);

	// Auto-refresh on tab focus + light polling
	useAutoRefresh(fetchItems, { intervalMs: 45_000 });

	const filtered = useMemo(() => {
		const searchStr = search.trim().toLowerCase();

		return items.filter((item) => {
			const titleStr = item.title.toLowerCase();
			const ownerStr = item.owner?.name?.toLowerCase() ?? "";
			const catStr = item.category.toLowerCase();

			const matchSearch =
				searchStr.length === 0 ||
				titleStr.includes(searchStr) ||
				ownerStr.includes(searchStr) ||
				catStr.includes(searchStr);

			const matchFilter = filter === "ALL" || item.status === filter;

			return matchSearch && matchFilter;
		});
	}, [items, search, filter]);

	if (loading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center gap-3 px-4 text-center text-textSecondary">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
				<span className="text-sm font-medium sm:text-base">Loading items...</span>
			</div>
		);
	}

	return (
		<div className="w-full space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0">
			<div className="flex flex-col gap-4 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6 md:flex-row md:items-center md:justify-between">
				<div className="min-w-0">
					<h1 className="text-xl font-bold text-textPrimary sm:text-2xl">
						Item Moderation
					</h1>
					<p className="mt-1 text-sm text-textSecondary">
						Review and moderate live item listings.
					</p>
				</div>

				<div className="flex w-full items-center gap-2 rounded-xl border border-borderLight bg-surface px-3 py-2 text-sm text-textSecondary shadow-sm sm:w-auto">
					<Package className="h-4 w-4 shrink-0" />
					<span className="font-bold text-textPrimary">{items.length}</span>
					items
				</div>
			</div>

			{error && (
				<div className="rounded-xl border border-error/40 bg-errorLight px-4 py-3 text-sm font-medium text-error">
					{error}
				</div>
			)}

			<div className="flex flex-col gap-3 lg:flex-row lg:items-center">
				<div className="relative min-w-0 flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textTertiary" />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by title, owner, or category..."
						className="w-full rounded-xl border border-outlineVariant bg-surface py-2.5 pl-9 pr-4 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
					/>
				</div>

				<div className="flex flex-wrap gap-2 lg:justify-end">
					{FILTERS.map((f) => (
						<button
							key={f}
							onClick={() => setFilter(f)}
							className={`rounded-xl border px-3 py-2 text-sm font-semibold transition sm:px-4 ${
								filter === f
									? "border-primary bg-primary text-onPrimary shadow"
									: "border-outlineVariant bg-surface text-textSecondary hover:bg-surfaceVariant"
							}`}
						>
							{f}
						</button>
					))}
				</div>

			</div>

			<div className="overflow-hidden rounded-2xl border border-borderLight bg-surface shadow-sm">
				<div className="overflow-x-auto">
					<table className="min-w-[980px] w-full text-sm">
						<thead>
							<tr className="border-b border-borderLight bg-surfaceVariant/60">
								<th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-textTertiary">Item</th>
								<th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-textTertiary">Owner</th>
								<th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-textTertiary">Category</th>
								<th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-textTertiary">Price</th>
								<th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-textTertiary">Status</th>
								<th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-textTertiary">Submitted</th>
								<th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-textTertiary">Actions</th>
							</tr>
						</thead>

						<tbody className="divide-y divide-borderLight">
							{filtered.map((item) => (
								<tr key={item.itemId} className="transition-colors hover:bg-surfaceVariant/40">
									<td className="px-5 py-3.5 align-top">
										<div className="min-w-0 font-semibold text-textPrimary">{item.title}</div>
										<div className="font-mono text-xs text-textTertiary">{item.itemId}</div>
									</td>

									<td className="px-5 py-3.5 align-top text-textSecondary">{item.owner?.name ?? "Unknown"}</td>

									<td className="px-5 py-3.5 align-top">
										<span className="rounded-full bg-primaryLight px-2.5 py-1 text-xs font-semibold text-primary">
											{item.category}
										</span>
									</td>

									<td className="px-5 py-3.5 align-top font-medium text-textSecondary">৳{item.dailyRate}/day</td>

									<td className="px-5 py-3.5 align-top">
										<span className={`rounded-full px-2.5 py-1 text-xs font-bold ${getStatusClass(item.status)}`}>
											{item.status}
										</span>
									</td>

									<td className="px-5 py-3.5 align-top text-xs text-textTertiary">{formatDate(item.createdAt)}</td>

									<td className="px-5 py-3.5 align-top">
										<div className="flex items-center justify-end gap-2">
											<Link
												href={`/items/${item.itemId}`}
												className="inline-flex items-center gap-1 rounded-lg bg-surfaceVariant px-2.5 py-1.5 text-xs font-bold text-textSecondary transition hover:bg-borderLight">
												<Eye className="h-3.5 w-3.5" />
												View
											</Link>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{filtered.length === 0 && (
						<div className="py-16 text-center text-textTertiary">
							<Package className="mx-auto mb-2 h-8 w-8 opacity-40" />
							No items match your filter.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}