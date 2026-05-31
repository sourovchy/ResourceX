"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
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
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
					{wishlist.map(({ wishlistId, item }) => (
						<div
							key={wishlistId}
							className="group relative flex flex-col overflow-hidden rounded-2xl border border-borderLight bg-surface shadow-sm transition-shadow hover:shadow-md">
							<button
								onClick={() => handleRemove(item.itemId)}
								disabled={removing === item.itemId}
								className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-textSecondary shadow transition hover:bg-error hover:text-white"
								aria-label="Remove from wishlist">
								{removing === item.itemId ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<X className="h-4 w-4" />
								)}
							</button>

							<Link href={`/borrow/item/${item.itemId}`} className="block">
								<div className="relative h-44 w-full bg-surfaceVariant">
									{item.imageUrls?.[0] ? (
										<SafeImage
											src={item.imageUrls[0]}
											alt={item.title}
											fill
											className="object-cover"
										/>
									) : (
										<div className="flex h-full items-center justify-center">
											<Tag className="h-12 w-12 text-textTertiary opacity-30" />
										</div>
									)}
								</div>

								<div className="p-4">
									<p className="text-xs font-semibold uppercase tracking-wider text-primary">
										{item.category ?? "General"}
									</p>
									<h3 className="mt-1 line-clamp-2 font-semibold text-textPrimary">
										{item.title}
									</h3>
									{item.owner?.userId ? (
										<Link
											href={`/profile/${item.owner.userId}`}
											onClick={(e) => e.stopPropagation()}
											className="mt-1 block truncate text-sm text-textSecondary transition-colors hover:text-primary">
											by {item.owner.name ?? "Campus Provider"}
										</Link>
									) : (
										<p className="mt-1 text-sm text-textSecondary">
											by {item.owner?.name ?? "Campus Provider"}
										</p>
									)}

									<div className="mt-3 flex items-center justify-between">
										<p className="font-extrabold text-primary">
											৳{Number(item.dailyRate).toLocaleString()}
											<span className="text-xs font-normal text-textSecondary">
												/day
											</span>
										</p>
										{item.deposit != null && Number(item.deposit) > 0 && (
											<span className="flex items-center gap-1 rounded-full bg-primaryLight px-2 py-0.5 text-xs font-medium text-primary">
												<Shield className="h-3 w-3" />
												৳{Number(item.deposit).toLocaleString()} deposit
											</span>
										)}
									</div>

									<div className="mt-2 flex items-center gap-1 text-xs text-textTertiary">
										<Star className="h-3 w-3 text-warning" />
										<span>
											{item.owner?.studentProfile?.trustScore ?? "—"} trust score
										</span>
									</div>
								</div>
							</Link>
						</div>
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
