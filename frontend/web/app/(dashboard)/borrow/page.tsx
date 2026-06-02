"use client";

import React, { useEffect, useRef, useState } from "react";
import ItemCard from "@/components/cards/ItemCard";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Search, AlertTriangle, PackageOpen } from "lucide-react";
import { CardGridSkeleton } from "@/components/ui/Skeleton";

export default function BorrowPage() {
	const { user } = useAuth();
	const [items, setItems] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeCategory, setActiveCategory] = useState("All");
	const [searchQuery, setSearchQuery] = useState("");
	const [categories, setCategories] = useState<string[]>(["All"]);

	// Load category list once
	useEffect(() => {
		api.get("/categories").then((res) => {
			const raw: { name?: string; categoryName?: string }[] =
				Array.isArray(res.data) ? res.data : (res.data?.content ?? []);
			const names = raw
				.map((c) => c.name ?? c.categoryName)
				.filter(Boolean) as string[];
			setCategories(["All", ...names]);
		}).catch(() => {});
	}, []);

	// Debounced item fetch
	const debounceRef = useRef<ReturnType<typeof setTimeout>>();
	useEffect(() => {
		clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(async () => {
			setLoading(true);
			setError(null);
			try {
				const params = new URLSearchParams();
				if (activeCategory !== "All") params.append("category", activeCategory);
				if (searchQuery.trim()) params.append("searchQuery", searchQuery.trim());

				const res = await api.get(`/items?${params.toString()}`);
				const page = res.data?.content ?? res.data;
				const all: any[] = Array.isArray(page) ? page : [];

				// Hide the current user's own listings from the marketplace
				const myId = user?.userId;
				const visible = myId
					? all.filter((i) => i.owner?.userId !== myId)
					: all;

				// Hide deleted / blocked items
				setItems(visible.filter((i) => i.status === "AVAILABLE" || i.status === "UNAVAILABLE"));
			} catch {
				setError("Failed to load items. Please try again.");
			} finally {
				setLoading(false);
			}
		}, 300);

		return () => clearTimeout(debounceRef.current);
	}, [activeCategory, searchQuery, user?.userId]);

	return (
		<div className="w-full space-y-5 px-3 pb-20 sm:space-y-6 sm:px-4 lg:px-0">
			{/* Header */}
			<div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
				<div>
					<h1 className="text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
						Browse Items
					</h1>
					<p className="mt-0.5 text-sm text-textSecondary">
						Find gear you need from trusted students on campus.
					</p>
				</div>
			</div>

			{/* Search + Categories */}
			<div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex w-full gap-2 overflow-x-auto pb-1 sm:w-auto sm:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					{categories.map((cat) => (
						<button
							key={cat}
							onClick={() => setActiveCategory(cat)}
							className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-all sm:px-4 ${
								activeCategory === cat
									? "bg-primary text-white shadow-md shadow-primary/20"
									: "border border-borderLight bg-surface text-textSecondary hover:border-primary/40 hover:text-textPrimary"
							}`}>
							{cat}
						</button>
					))}
				</div>

				<div className="relative w-full shrink-0 sm:w-72">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textTertiary" />
					<input
						type="text"
						placeholder="Search items…"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full rounded-xl border border-borderLight bg-surface py-2.5 pl-9 pr-4 text-sm text-textPrimary shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
					/>
				</div>
			</div>

			{/* States */}
			{loading && <CardGridSkeleton count={8} />}

			{!loading && error && (
				<div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-2xl border border-errorLight bg-errorLight/20 px-6 py-12 text-center">
					<AlertTriangle className="h-10 w-10 text-error" />
					<p className="font-semibold text-textPrimary">{error}</p>
					<button
						onClick={() => setSearchQuery("")}
						className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primaryDark">
						Try Again
					</button>
				</div>
			)}

			{!loading && !error && items.length === 0 && (
				<div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-2xl border border-borderLight bg-surface py-16 text-center">
					<PackageOpen className="h-10 w-10 text-outlineVariant" />
					<p className="font-semibold text-textPrimary">No listings found</p>
					<p className="text-sm text-textSecondary">
						{searchQuery || activeCategory !== "All"
							? "Try a different search or category."
							: "No items are currently available."}
					</p>
				</div>
			)}

			{!loading && !error && items.length > 0 && (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 lg:gap-6">
					{items.map((item) => (
						<ItemCard
							key={item.itemId}
							item={{
								id: String(item.itemId),
								title: item.title,
								category: item.category ?? "General",
								condition: item.itemCondition ?? "Good",
								pricePerDay: item.dailyRate,
								owner: item.owner?.name ?? "Campus Provider",
								trustScore: item.owner?.studentProfile?.trustScore ?? 100,
								image: item.imageUrls?.[0],
							}}
						/>
					))}
				</div>
			)}
		</div>
	);
}
