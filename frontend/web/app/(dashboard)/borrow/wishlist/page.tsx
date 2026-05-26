"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
	Star,
	Shield,
	CheckCircle2,
	Heart,
	Search,
	ArrowRight,
	Loader2,
	AlertTriangle,
} from "lucide-react";

type WishlistItem = {
	id: string;
	title: string;
	category: string;
	condition: string;
	pricePerDay: number;
	deposit: number;
	rating: number;
	reviews: number;
	owner: string;
	trustScore: number;
	isVerified: boolean;
	image: string;
};

type WishlistApiResponse =
	| {
		wishlist?: unknown;
		items?: unknown;
		data?: unknown;
		content?: unknown;
	}
	| unknown;

const WISHLIST_ENDPOINTS = [
	"/api/wishlist",
	"/api/wishlist/items",
	"/api/users/wishlist",
];

function getAuthHeaders(): Record<string, string> {
	if (typeof window === "undefined") return {};

	const token =
		localStorage.getItem("resourcex_token");

	return token
		? {
			Authorization: `Bearer ${token}`,
		}
		: {};
}

async function fetchJson(url: string) {
	const response = await fetch(url, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...getAuthHeaders(),
		},
	});

	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`);
	}

	return (await response.json()) as WishlistApiResponse;
}

function normalizeWishlistItem(raw: any): WishlistItem {
	const image =
		raw?.image ??
		raw?.imageUrl ??
		raw?.imageUrls?.[0] ??
		raw?.images?.[0] ??
		"https://placehold.co/400x300?text=Item";

	return {
		id: String(raw?.id ?? raw?.itemId ?? crypto.randomUUID()),
		title: raw?.title ?? raw?.name ?? "Untitled Item",
		category: raw?.category ?? "General",
		condition: raw?.condition ?? raw?.itemCondition ?? "Good",
		pricePerDay: Number(
			raw?.pricePerDay ??
				raw?.dailyRate ??
				raw?.rentalPricePerDay ??
				0,
		),
		deposit: Number(raw?.deposit ?? raw?.securityDeposit ?? 0),
		rating: Number(raw?.rating ?? raw?.averageRating ?? 0),
		reviews: Number(raw?.reviews ?? raw?.reviewCount ?? 0),
		owner:
			raw?.owner?.name ??
			raw?.ownerName ??
			raw?.user?.name ??
			"Unknown Owner",
		trustScore: Number(raw?.owner?.trustScore ?? raw?.trustScore ?? 100),
		isVerified: Boolean(raw?.owner?.verified ?? raw?.isVerified ?? true),
		image,
	};
}

function extractWishlist(payload: WishlistApiResponse) {
	const root: any = payload && typeof payload === "object" ? payload : {};

	const source =
		root.wishlist ??
		root.items ??
		root.data ??
		root.content ??
		payload;

	if (!Array.isArray(source)) {
		return [] as WishlistItem[];
	}

	return source.map((item: any) => normalizeWishlistItem(item));
}

export default function WishlistPage() {
	const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		const loadWishlist = async () => {
			setLoading(true);
			setError(null);

			try {
				let loadedWishlist: WishlistItem[] = [];

				for (const endpoint of WISHLIST_ENDPOINTS) {
					try {
						const payload = await fetchJson(endpoint);
						const normalized = extractWishlist(payload);

						if (normalized.length > 0) {
							loadedWishlist = normalized;
							break;
						}
					} catch {
						// try next endpoint
					}
				}

				if (!active) return;

				setWishlist(loadedWishlist);
			} catch (err) {
				if (!active) return;

				setError(
					err instanceof Error
						? err.message
						: "Failed to load wishlist.",
				);
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		};

		void loadWishlist();

		return () => {
			active = false;
		};
	}, []);

	const itemCount = useMemo(() => wishlist.length, [wishlist]);

	const handleRemove = async (e: React.MouseEvent, id: string) => {
		e.preventDefault();
		e.stopPropagation();

		const previous = wishlist;

		setWishlist((prev) => prev.filter((item) => item.id !== id));

		const endpoints = [
			`/api/wishlist/${id}`,
			`/api/wishlist/remove/${id}`,
			`/api/users/wishlist/${id}`,
		];

		let success = false;

		for (const endpoint of endpoints) {
			try {
				const response = await fetch(endpoint, {
					method: "DELETE",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
						...getAuthHeaders(),
					},
				});

				if (response.ok) {
					success = true;
					break;
				}
			} catch {
				// try next endpoint
			}
		}

		if (!success) {
			setWishlist(previous);
			setError("Failed to remove item from wishlist.");
		}
	};

	return (
		<div className="mx-auto max-w-6xl space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0">
			{/* Page Header */}
			<div className="flex flex-col gap-4 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm md:flex-row md:items-center md:justify-between sm:p-6">
				<div>
					<h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
						<Heart className="w-6 h-6 text-error fill-error" /> My Wishlist
					</h1>
					<p className="text-sm text-textSecondary mt-1">
						Items you've saved for later renting.
					</p>
				</div>
				<div className="w-full rounded-xl border border-primary/20 bg-primaryLight px-4 py-2 text-center text-sm font-bold text-primary md:w-auto">
					{itemCount} Items Saved
				</div>
			</div>

			{/* Items Grid */}
			{loading ? (
				<div className="flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-2xl border border-borderLight bg-surface px-4 py-12 text-center text-textSecondary shadow-sm sm:py-16">
					<Loader2 className="w-10 h-10 animate-spin text-primary" />
					<p>Loading wishlist...</p>
				</div>
			) : error ? (
				<div className="flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-2xl border border-error bg-errorLight/20 px-4 py-12 text-center text-errorDark shadow-sm sm:py-16">
					<AlertTriangle className="w-10 h-10" />
					<p className="font-semibold">{error}</p>
				</div>
			) : wishlist.length > 0 ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 lg:gap-6">
					{wishlist.map((item) => (
						<WishlistCard key={item.id} item={item} onRemove={handleRemove} />
					))}
				</div>
			) : (
				<div className="rounded-2xl border border-borderLight bg-surface px-4 py-12 text-center shadow-sm sm:py-16">
					<div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-errorLight">
						<Heart className="w-10 h-10 text-error opacity-50" />
					</div>
					<h3 className="text-xl font-bold text-textPrimary sm:text-2xl">
						Your wishlist is empty
					</h3>
					<p className="mx-auto mb-6 mt-2 max-w-md px-2 text-sm text-textSecondary sm:text-base">
						You haven't saved any items yet. Browse the campus catalog and tap
						the heart icon to save items here for quick access later.
					</p>
					<Link
						href="/borrow"
						className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primaryDark sm:text-base">
						<Search className="w-5 h-5" /> Browse Items
					</Link>
				</div>
			)}
		</div>
	);
}

function WishlistCard({
	item,
	onRemove,
}: {
	item: WishlistItem;
	onRemove: (e: React.MouseEvent, id: string) => void;
}) {
	return (
		<div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-borderLight bg-surface shadow-sm transition-all hover:border-outline hover:shadow-md">
			<Link
				href={`/borrow/item/${item.id}`}
				className="absolute inset-0 z-0"
				aria-label={`Open ${item.title}`}></Link>

			{/* Image Area */}
			<div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-surfaceVariant">
				<img
					src={item.image}
					alt={item.title}
					className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
				/>
				<div className="absolute left-3 top-3 flex gap-2">
					<span className="px-2.5 py-1 bg-surface/90 backdrop-blur-sm shadow-sm rounded-lg text-xs font-bold text-textPrimary">
						{item.category}
					</span>
				</div>
				<div className="absolute right-3 top-3">
					<span className="px-2 py-1 bg-surface/90 backdrop-blur-sm shadow-sm rounded-md text-[10px] font-bold text-textSecondary uppercase tracking-wider">
						{item.condition}
					</span>
				</div>
			</div>

			{/* Content Area */}
			<div className="relative z-10 flex flex-1 flex-col p-4 pointer-events-none sm:p-5">
				<div className="flex items-start justify-between gap-2">
					<h3 className="line-clamp-2 h-[40px] text-base font-bold leading-tight text-textPrimary transition-colors group-hover:text-primary">
						{item.title}
					</h3>
					{/* Remove from wishlist button */}
					<button
						onClick={(e) => onRemove(e, item.id)}
						className="pointer-events-auto -mr-1.5 -mt-1 rounded-full p-1.5 text-error transition-colors hover:bg-errorLight"
						title="Remove from wishlist">
						<Heart className="w-5 h-5 fill-error" />
					</button>
				</div>

				{/* Rating */}
				<div className="mt-2 flex items-center gap-1.5">
					<Star className="w-3.5 h-3.5 text-warning fill-warning" />
					<span className="text-sm font-bold text-textPrimary">
						{item.rating}
					</span>
					<span className="text-xs text-textTertiary">({item.reviews})</span>
				</div>

				<div className="mt-4 flex items-center justify-between border-t border-borderLight pt-4">
					<div>
						<div className="text-xs font-semibold uppercase tracking-wider text-textSecondary">
							Rent
						</div>
						<div className="text-base font-extrabold text-primary sm:text-lg">
							৳ {item.pricePerDay.toLocaleString()}
							<span className="text-xs text-textSecondary font-medium">
								/day
							</span>
						</div>
					</div>
					<div className="text-right">
						<div className="text-xs font-semibold uppercase tracking-wider text-textSecondary">
							Deposit
						</div>
						<div className="text-sm font-bold text-textPrimary">
							৳ {item.deposit.toLocaleString()}
						</div>
					</div>
				</div>

				{/* Actions & Owner Info */}
				<div className="sticky bottom-0 mt-5 flex flex-col gap-4 border-t border-borderLight bg-surface pt-4">
					{/* Owner Info inner row */}
					<div className="flex items-center justify-between gap-3 pointer-events-auto">
						<div className="flex items-center gap-2">
							<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primaryLight text-[10px] font-bold text-primary">
								{item.owner.charAt(0)}
							</div>
							<span className="flex items-center gap-1 text-xs font-semibold text-textPrimary">
								{item.owner}
								{item.isVerified && (
									<CheckCircle2 className="w-3 h-3 text-success inline" />
								)}
							</span>
						</div>
						<div className="flex items-center gap-1 text-xs font-bold text-success">
							<Shield className="w-3.5 h-3.5" /> {item.trustScore}
						</div>
					</div>

					<Link
						href={`/borrow/book/${item.id}`}
						className="pointer-events-auto flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primaryDark">
						Book Now <ArrowRight className="w-4 h-4" />
					</Link>
				</div>
			</div>
		</div>
	);
}
