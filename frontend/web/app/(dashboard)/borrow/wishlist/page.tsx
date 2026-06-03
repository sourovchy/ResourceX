"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import ItemCard from "@/components/cards/ItemCard";
import {
	Heart,
	Search,
	Loader2,
	AlertTriangle,
	X,
	Tag,
	Star,
	Shield,
} from "lucide-react";
import api from "@/lib/api";
import type { ItemResponse } from "@/types/item";

interface WishlistEntry {
	wishlistId: number;
	item: ItemResponse;
	createdAt: string;
}

export default function WishlistPage() {
	const [wishlist, setWishlist] = useState<WishlistEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [removing, setRemoving] = useState<number | null>(null);

	const fetchWishlist = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await api.get<WishlistEntry[]>("/wishlist");
			setWishlist(Array.isArray(res.data) ? res.data : []);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to load wishlist.",
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchWishlist();
	}, [fetchWishlist]);

	const handleRemove = async (itemId: number) => {
		setRemoving(itemId);
		try {
			await api.delete(`/wishlist/${itemId}`);
			setWishlist((prev) => prev.filter((w) => w.item.itemId !== itemId));
		} catch {
			// Item may have already been removed
		} finally {
			setRemoving(null);
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center gap-3 px-4 text-center text-textSecondary">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
				<span className="text-sm font-medium sm:text-base">Loading wishlist...</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
				<div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-errorLight text-error">
					<AlertTriangle className="h-10 w-10" />
				</div>
				<h1 className="text-2xl font-bold text-textPrimary sm:text-3xl">
					Unable to Load Wishlist
				</h1>
				<p className="mt-2 text-sm text-textSecondary sm:text-base">{error}</p>
			</div>
		);
	}

	return (
		<div className="w-full space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0">
			<div className="flex flex-col gap-4 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm md:flex-row md:items-center md:justify-between sm:p-6">
				<div>
					<h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
						<Heart className="h-6 w-6 fill-error text-error" /> My Wishlist
					</h1>
					<p className="mt-1 text-sm text-textSecondary">
						Items you&apos;ve saved for later renting.
					</p>
				</div>
				<div className="w-full rounded-xl border border-primary/20 bg-primaryLight px-4 py-2 text-center text-sm font-bold text-primary md:w-auto">
					{wishlist.length} Item{wishlist.length !== 1 ? "s" : ""} Saved
				</div>
			</div>

			{wishlist.length > 0 ? (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-5">
					{wishlist.map(({ wishlistId, item }) => (
						<ItemCard
							key={wishlistId}
							item={{
								id: String(item.itemId),
								title: item.title,
								category: item.category ?? "General",
								pricePerDay: item.dailyRate ?? 0,
								deposit: item.deposit ?? undefined,
								owner: item.owner?.name ?? "Campus Provider",
								trustScore: item.owner?.studentProfile?.trustScore ?? 0,
								image: item.imageUrls?.[0],
							}}
							topRightSlot={
								<button
									onClick={(e) => {
										e.preventDefault();
										handleRemove(item.itemId);
									}}
									disabled={removing === item.itemId}
									className="flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 text-textSecondary shadow transition hover:bg-error hover:text-white"
									aria-label="Remove from wishlist"
								>
									{removing === item.itemId ? (
										<Loader2 className="h-3 w-3 animate-spin" />
									) : (
										<X className="h-3 w-3" />
									)}
								</button>
							}
						/>
					))}
				</div>
			) : (
				<div className="rounded-2xl border border-borderLight bg-surface px-4 py-12 text-center shadow-sm sm:py-16">
					<div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-errorLight">
						<Heart className="h-10 w-10 text-error opacity-50" />
					</div>
					<h3 className="text-xl font-bold text-textPrimary sm:text-2xl">
						Your wishlist is empty
					</h3>
					<p className="mx-auto mb-6 mt-2 max-w-md px-2 text-sm text-textSecondary sm:text-base">
						Browse the catalog and save items you&apos;d like to rent later. Look
						for the ♡ button on item pages.
					</p>
					<Link
						href="/borrow"
						className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primaryDark sm:text-base">
						<Search className="h-5 w-5" /> Browse Items
					</Link>
				</div>
			)}
		</div>
	);
}
