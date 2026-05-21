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
			<div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
				<Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
				<p className="text-textSecondary font-medium">
					Discovering campus gear...
				</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-errorLight/20 border border-errorLight p-8 rounded-2xl text-center">
				<p className="text-errorDark font-bold mb-2">
					Oops! Something went wrong.
				</p>
				<p className="text-textSecondary text-sm mb-6">{error}</p>
				<button
					onClick={() => window.location.reload()}
					className="px-6 py-2 bg-primary text-white rounded-xl font-bold shadow-sm hover:translate-y-[-2px] transition-all">
					Try Again
				</button>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto space-y-6">
			{/* Header */}
			<div className="bg-surface border border-borderLight rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary tracking-tight">
						Browse Items to Rent
					</h1>
					<p className="text-sm text-textSecondary mt-1">
						Find the gear you need, from trusted students on campus.
					</p>
				</div>

				<div className="flex items-center gap-3 w-full md:w-auto">
					<div className="relative flex-1 md:w-64">
						<Search className="w-4 h-4 text-textTertiary absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							placeholder="Search items..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-9 pr-4 py-2 bg-surfaceVariant border border-borderLight rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-textPrimary"
						/>
					</div>
				</div>
			</div>

			{/* Categories */}
			<div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
				{categories.map((cat) => (
					<button
						key={cat}
						onClick={() => setActiveCategory(cat)}
						className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
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
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
				<div className="bg-surfaceVariant rounded-2xl p-20 text-center border border-borderLight border-dashed">
					<p className="text-textSecondary font-medium">
						No listings found. Create your first listing.
					</p>
				</div>
			)}
		</div>
	);
}
