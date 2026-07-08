"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
	Search,
	Eye,
	Package,
	Filter,
} from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";

import api from "@/lib/api";
import { formatShortDate } from "@/lib/dateUtils";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { buttonClasses } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/PageLoader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageEmpty } from "@/components/ui/PageEmpty";
import { PageError } from "@/components/ui/PageError";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_SIZE = 10;

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

export default function AdminItemsPage() {
	const [items, setItems] = useState<Item[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<FilterType>("ALL");
	const [pageIndex, setPageIndex] = useState(0);

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

	// Reset to first page whenever the result set changes.
	useEffect(() => {
		setPageIndex(0);
	}, [search, filter]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(pageIndex, totalPages - 1);
	const paged = useMemo(
		() => filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
		[filtered, safePage],
	);

	if (loading) {
		return <PageLoader message="Loading items..." />;
	}

	if (error) {
		return <PageError message={error} onRetry={fetchItems} />;
	}

	return (
		<div className="w-full space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0 graph-grid page-enter">
			<div className="glass-surface relative overflow-hidden rounded-2xl p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="mt-1 text-3xl font-bold tracking-tight text-textPrimary sm:text-4xl">
						Resource <span className="text-gradient-brand italic">Moderation.</span>
					</h1>
					<p className="mt-2 text-sm text-textSecondary font-medium">
						Review and moderate live item listings.
					</p>
				</div>

				<div className="flex items-center gap-2 rounded-xl border border-borderLight bg-surface px-3 py-2 text-sm text-textSecondary shadow-sm sm:w-auto self-start sm:self-auto">
					<Package className="h-4 w-4 shrink-0 text-textSecondary" />
					<span className="font-bold text-textPrimary">{items.length}</span>
					<span>items</span>
				</div>
			</div>

			{/* Desktop View: search and filter buttons */}
			<div className="hidden md:flex md:flex-row md:items-center gap-3">
				<div className="relative min-w-0 flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textTertiary" />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by title, owner, or category..."
						className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-textPrimary shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-textTertiary"
					/>
				</div>

				<div className="flex flex-wrap gap-2 lg:justify-end">
					{FILTERS.map((f) => (
						<button
							key={f}
							onClick={() => setFilter(f)}
							className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-all sm:px-4 ${
								filter === f
									? "bg-primary text-onPrimary shadow-sm"
									: "border border-border bg-card text-textSecondary hover:border-primary/40 hover:text-textPrimary"
							}`}
						>
							{f}
						</button>
					))}
				</div>
			</div>

			{/* Mobile View: Search input and select filter directly in a single row (always visible) */}
			<div className="flex flex-row items-center gap-2 md:hidden">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textTertiary" />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search..."
						className="w-full rounded-full border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-textPrimary shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-textTertiary"
					/>
				</div>

				<div className="shrink-0">
					<Select
						value={filter}
						onChange={(val) => setFilter(val as FilterType)}
						options={FILTERS.map((f) => ({ value: f, label: f }))}
						variant="pill"
					/>
				</div>
			</div>

			<Card padding="none" className="overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-[980px] w-full text-sm">
						<thead>
							<tr className="border-b border-borderLight bg-surfaceVariant/60">
								<th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-textTertiary">Item</th>
								<th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-textTertiary">Owner</th>
								<th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-textTertiary">Category</th>
								<th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-textTertiary">Price</th>
								<th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-textTertiary">Status</th>
								<th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-textTertiary">Submitted</th>
								<th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-textTertiary">Actions</th>
							</tr>
						</thead>

						<tbody className="divide-y divide-borderLight">
							{paged.map((item) => (
								<tr key={item.itemId} className="transition-colors hover:bg-surfaceVariant/40">
									<td className="px-5 py-4 align-top">
										<div className="min-w-0 font-bold text-textPrimary italic">{item.title}</div>
										<div className="font-mono text-xs text-textTertiary">{item.itemId}</div>
									</td>

									<td className="px-5 py-4 align-top text-textSecondary font-medium">{item.owner?.name ?? "Unknown"}</td>

									<td className="px-5 py-4 align-top">
										<span className="rounded-full bg-primaryLight border border-primary/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
											{item.category}
										</span>
									</td>

									<td className="px-5 py-4 align-top font-medium text-textSecondary">৳{item.dailyRate}/day</td>

									<td className="px-5 py-4 align-top">
										<StatusBadge status={item.status} />
									</td>

									<td className="px-5 py-4 align-top text-xs text-textTertiary font-mono">{formatDate(item.createdAt)}</td>

									<td className="px-5 py-4 align-top">
										<div className="flex items-center justify-end gap-2">
											<Link
												href={`/items/${item.itemId}`}
												className={buttonClasses("subtle", "sm")}
											>
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
						<div className="p-6">
							<PageEmpty
								icon={Package}
								title="No items found"
								description="No items match your current filter or search criteria."
							/>
						</div>
					)}
				</div>

					{filtered.length > 0 && (
						<Pagination pageIndex={safePage} totalPages={totalPages} onPageChange={setPageIndex} />
					)}
			</Card>
		</div>
	);
}