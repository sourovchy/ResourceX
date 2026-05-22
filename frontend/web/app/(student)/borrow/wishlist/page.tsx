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
		<div className="max-w-6xl mx-auto space-y-6 pb-20">
			{/* Page Header */}
			<div className="bg-surface border border-borderLight rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary tracking-tight flex items-center gap-2">
						<Heart className="w-6 h-6 text-error fill-error" /> My Wishlist
					</h1>
					<p className="text-sm text-textSecondary mt-1">
						Items you've saved for later renting.
					</p>
				</div>
				<div className="text-sm font-bold text-primary bg-primaryLight px-4 py-2 rounded-xl border border-primary/20">
					{itemCount} Items Saved
				</div>
			</div>

			{/* Items Grid */}
			{loading ? (
				<div className="bg-surface border border-borderLight rounded-2xl p-16 text-center shadow-sm text-textSecondary flex flex-col items-center gap-4">
					<Loader2 className="w-10 h-10 animate-spin text-primary" />
					<p>Loading wishlist...</p>
				</div>
			) : error ? (
				<div className="bg-errorLight/20 border border-error rounded-2xl p-8 text-center shadow-sm text-errorDark flex flex-col items-center gap-4">
					<AlertTriangle className="w-10 h-10" />
					<p className="font-semibold">{error}</p>
				</div>
			) : wishlist.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{wishlist.map((item) => (
						<WishlistCard key={item.id} item={item} onRemove={handleRemove} />
					))}
				</div>
			) : (
				<div className="bg-surface border border-borderLight rounded-2xl p-16 text-center shadow-sm">
					<div className="w-20 h-20 bg-errorLight rounded-full flex items-center justify-center mx-auto mb-5">
						<Heart className="w-10 h-10 text-error opacity-50" />
					</div>
					<h3 className="text-xl font-bold text-textPrimary">
						Your wishlist is empty
					</h3>
					<p className="text-textSecondary mt-2 mb-6 max-w-md mx-auto">
						You haven't saved any items yet. Browse the campus catalog and tap
						the heart icon to save items here for quick access later.
					</p>
					<Link
						href="/borrow"
						className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-primaryDark transition-colors">
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
		<div className="group bg-surface border border-borderLight rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-outline transition-all flex flex-col relative h-full">
			<Link
				href={`/borrow/item/${item.id}`}
				className="absolute inset-0 z-0"></Link>

			{/* Image Area */}
			<div className="relative h-48 w-full overflow-hidden bg-surfaceVariant shrink-0">
				<img
					src={item.image}
					alt={item.title}
					className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
				/>
				<div className="absolute top-3 left-3 flex gap-2">
					<span className="px-2.5 py-1 bg-surface/90 backdrop-blur-sm shadow-sm rounded-lg text-xs font-bold text-textPrimary">
						{item.category}
					</span>
				</div>
				<div className="absolute top-3 right-3">
					<span className="px-2 py-1 bg-surface/90 backdrop-blur-sm shadow-sm rounded-md text-[10px] font-bold text-textSecondary uppercase tracking-wider">
						{item.condition}
					</span>
				</div>
			</div>

			{/* Content Area */}
			<div className="p-5 flex flex-col flex-1 z-10 pointer-events-none">
				<div className="flex justify-between items-start gap-2">
					<h3 className="text-base font-bold text-textPrimary leading-tight line-clamp-2 h-[40px] group-hover:text-primary transition-colors">
						{item.title}
					</h3>
					{/* Remove from wishlist button */}
					<button
						onClick={(e) => onRemove(e, item.id)}
						className="pointer-events-auto p-1.5 -mr-1.5 -mt-1 rounded-full text-error hover:bg-errorLight transition-colors"
						title="Remove from wishlist">
						<Heart className="w-5 h-5 fill-error" />
					</button>
				</div>

				{/* Rating */}
				<div className="flex items-center gap-1.5 mt-2">
					<Star className="w-3.5 h-3.5 text-warning fill-warning" />
					<span className="text-sm font-bold text-textPrimary">
						{item.rating}
					</span>
					<span className="text-xs text-textTertiary">({item.reviews})</span>
				</div>

				<div className="mt-4 pt-4 border-t border-borderLight flex items-center justify-between">
					<div>
						<div className="text-xs text-textSecondary uppercase tracking-wider font-semibold">
							Rent
						</div>
						<div className="text-lg font-extrabold text-primary border-transparent">
							৳ {item.pricePerDay.toLocaleString()}
							<span className="text-xs text-textSecondary font-medium">
								/day
							</span>
						</div>
					</div>
					<div className="text-right">
						<div className="text-xs text-textSecondary uppercase tracking-wider font-semibold">
							Deposit
						</div>
						<div className="text-sm font-bold text-textPrimary">
							৳ {item.deposit.toLocaleString()}
						</div>
					</div>
				</div>

				{/* Actions & Owner Info */}
				<div className="mt-5 pt-4 border-t border-borderLight flex flex-col gap-4 sticky bottom-0">
					{/* Owner Info inner row */}
					<div className="flex items-center justify-between pointer-events-auto">
						<div className="flex items-center gap-2">
							<div className="w-6 h-6 rounded-full bg-primaryLight flex items-center justify-center text-[10px] font-bold text-primary">
								{item.owner.charAt(0)}
							</div>
							<span className="text-xs font-semibold text-textPrimary flex items-center gap-1">
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
						className="pointer-events-auto w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primaryDark transition-colors flex items-center justify-center gap-2 shadow-sm text-sm">
						Book Now <ArrowRight className="w-4 h-4" />
					</Link>
				</div>
			</div>
		</div>
	);
}
