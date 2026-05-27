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
				const pageData = res.data?.content ?? res.data;
				const itemsArray = Array.isArray(pageData) ? pageData : [];
				const cats = Array.from(
					new Set(itemsArray.map((i: any) => i.category ?? i.categoryName).filter(Boolean)),
				) as string[];
				setCategories(["All", ...cats]);
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
				const pageData = response.data?.content ?? response.data;
				const itemsArray = Array.isArray(pageData) ? pageData : [];
				setItems(itemsArray);
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
		<div className="mx-auto max-w-6xl space-y-5 px-3 pb-20 sm:space-y-6 sm:px-4 lg:px-0">
			{/* Header */}
			<div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
				<div className="min-w-0">
					<h1 className="text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
						Browse Items
					</h1>
					<p className="mt-1 text-sm text-textSecondary sm:text-base">
						Find the gear you need, from trusted students on campus.
					</p>
				</div>
			</div>

			{/* Search and Filters Row */}
			<div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
				{/* Categories */}
				<div className="flex w-full gap-2 overflow-x-auto pb-1 sm:w-auto sm:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					{categories.map((cat) => (
						<button
							key={cat}
							onClick={() => setActiveCategory(cat)}
							className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-all sm:px-4 ${
								activeCategory === cat
									? "bg-primary text-white shadow-md shadow-primary/20"
									: "bg-surface border border-borderLight text-textSecondary hover:border-primary/40 hover:text-textPrimary"
							}`}>
							{cat}
						</button>
					))}
				</div>

				{/* Search */}
				<div className="relative w-full shrink-0 sm:w-72">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textTertiary" />
					<input
						type="text"
						placeholder="Search items..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full rounded-xl border border-borderLight bg-surface py-2.5 pl-9 pr-4 text-sm text-textPrimary shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
					/>
				</div>
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
				<div className="rounded-2xl border border-borderLight bg-surface py-16 text-center shadow-sm sm:py-20">
					<p className="text-sm font-medium text-textSecondary sm:text-base">
						No listings found for your search.
					</p>
				</div>
			)}
		</div>
	);
}
