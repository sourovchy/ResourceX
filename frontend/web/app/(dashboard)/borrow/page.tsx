"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ItemCard from "@/components/cards/ItemCard";
import api from "@/lib/api";
import {
	Search,
	Loader2,
} from "lucide-react";

export default function BorrowPage() {
	const [items, setItems] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeCategory, setActiveCategory] = useState("All");
	const [searchQuery, setSearchQuery] = useState("");
	const [categories, setCategories] = useState<string[]>(["All"]);

	useEffect(() => {
		api
			.get("/items")
			.then((res) => {
				if (res.data && Array.isArray(res.data)) {
					const cats = Array.from(
						new Set(res.data.map((i: any) => i.category).filter(Boolean)),
					) as string[];
					setCategories(["All", ...cats]);
				}
			})
			.catch(console.error);
	}, []);

	useEffect(() => {
		const fetchItems = async () => {
			try {
				setLoading(true);
				const params = new URLSearchParams();
				if (activeCategory !== "All") params.append("category", activeCategory);
				if (searchQuery) params.append("searchQuery", searchQuery);

				const response = await api.get(`/items?${params.toString()}`);
				setItems(response.data);
				setError(null);
			} catch (err) {
				console.error("Error fetching items:", err);
				setError("Failed to load items. Please try again later.");
			} finally {
				setLoading(false);
			}
		};

		const timeout = setTimeout(() => {
			fetchItems();
		}, 300); // debounce API calls

		return () => clearTimeout(timeout);
	}, [activeCategory, searchQuery]);

	const filteredItems = items;

if (loading) {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center animate-in fade-in duration-700">
			<Loader2 className="h-10 w-10 animate-spin text-primary" />
			<p className="text-sm font-medium text-textSecondary sm:text-base">
				Discovering campus gear...
			</p>
		</div>
	);
}

if (error) {
	return (
		<div className="mx-auto flex min-h-[220px] max-w-2xl flex-col items-center justify-center gap-4 rounded-2xl border border-errorLight bg-errorLight/20 px-4 py-12 text-center shadow-sm sm:py-16">
			<p className="text-lg font-bold text-errorDark sm:text-xl">
				Oops! Something went wrong.
			</p>
			<p className="max-w-md text-sm text-textSecondary sm:text-base">{error}</p>
			<button
				onClick={() => window.location.reload()}
				className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:translate-y-[-2px] sm:text-base">
				Try Again
			</button>
		</div>
	);
}

	return (
		<div className="mx-auto max-w-6xl space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0">
			{/* Header */}
			<div className="flex flex-col gap-4 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm md:flex-row md:items-center md:justify-between sm:p-6">
				<div className="min-w-0">
					<h1 className="text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
						Browse Items to Rent
					</h1>
					<p className="mt-1 text-sm text-textSecondary">
						Find the gear you need, from trusted students on campus.
					</p>
				</div>

				<div className="flex w-full items-center gap-3 md:w-auto">
					<div className="relative min-w-0 flex-1 md:w-64">
						<Search className="w-4 h-4 text-textTertiary absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							placeholder="Search items..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full rounded-xl border border-borderLight bg-surfaceVariant py-2 pl-9 pr-4 text-sm text-textPrimary outline-none focus:border-primary focus:ring-1 focus:ring-primary"
						/>
					</div>
				</div>
			</div>

			{/* Categories */}
			<div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{categories.map((cat) => (
					<button
						key={cat}
						onClick={() => setActiveCategory(cat)}
						className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-all sm:px-4 ${
							activeCategory === cat
								? "bg-primary text-white shadow-md shadow-primary/20"
								: "bg-surface border border-borderLight text-textSecondary hover:border-primary/40"
						}`}>
						{cat}
					</button>
				))}
			</div>

			{/* Grid */}
			{filteredItems.length > 0 ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 lg:gap-6">
					{filteredItems.map((item) => (
						<ItemCard
							key={item.itemId}
							item={{
								id: item.itemId.toString(),
								title: item.title,
								category: item.category || "General",
								condition: item.itemCondition || "Good",
								pricePerDay: item.dailyRate,
								owner: item.owner?.name || "Campus Provider",
								trustScore: item.owner?.trustScore || 100,
								image: item.imageUrls?.[0],
							}}
						/>
					))}
				</div>
			) : (
				<div className="rounded-2xl border border-dashed border-borderLight bg-surfaceVariant px-4 py-14 text-center sm:py-20">
					<p className="text-sm font-medium text-textSecondary sm:text-base">
						No listings found. Create your first listing.
					</p>
				</div>
			)}
		</div>
	);
}
