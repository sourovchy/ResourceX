"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
	Star,
	MapPin,
	CalendarDays,
	Shield,
	CheckCircle2,
	AlertTriangle,
	ArrowLeft,
	Heart,
	MessageSquare,
	Loader2,
} from "lucide-react";

type ItemOwner = {
	userId?: string | number;
	name?: string;
	verified?: boolean;
	trustScore?: number;
};

type ItemResponse = {
	id?: string | number;
	itemId?: string | number;
	title?: string;
	name?: string;
	description?: string;
	category?: string;
	itemCondition?: string;
	condition?: string;
	dailyRate?: number;
	pricePerDay?: number;
	rentalPricePerDay?: number;
	deposit?: number;
	securityDeposit?: number;
	imageUrls?: string[];
	images?: string[];
	owner?: ItemOwner;
	ownerName?: string;
	ownerId?: string | number;
};

function normalizeItem(raw: any) {
	const imageList =
		raw?.imageUrls ?? raw?.images ?? raw?.imageUrl ?? [];

	return {
		itemId: String(raw?.itemId ?? raw?.id ?? ""),
		title: raw?.title ?? raw?.name ?? "Untitled Item",
		description:
			raw?.description ?? "No description provided for this item.",
		category: raw?.category ?? "General",
		itemCondition:
			raw?.itemCondition ?? raw?.condition ?? "Good",
		dailyRate: Number(
			raw?.dailyRate ??
				raw?.pricePerDay ??
				raw?.rentalPricePerDay ??
				0,
		),
		deposit: Number(raw?.deposit ?? raw?.securityDeposit ?? 0),
		imageUrls: Array.isArray(imageList)
			? imageList
			: imageList
				? [imageList]
				: [],
		owner: {
			userId:
				raw?.owner?.userId ?? raw?.ownerId ?? raw?.user?.userId,
			name:
				raw?.owner?.name ??
				raw?.ownerName ??
				raw?.user?.name ??
				"Unknown Owner",
			verified: Boolean(raw?.owner?.verified ?? true),
			trustScore: Number(raw?.owner?.trustScore ?? 100),
		},
	};
}

export default function ItemDetailPage({ params }: { params: { id: string } }) {
	const [item, setItem] = useState<ItemResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		const fetchItem = async () => {
			setLoading(true);
			setError(null);

			const endpoints = [
				`/items/${params.id}`,
				`/item/${params.id}`,
				`/borrow/items/${params.id}`,
			];

			try {
				for (const endpoint of endpoints) {
					try {
						const response = await api.get(endpoint);
						const normalized = normalizeItem(response.data);

						if (!active) return;

						setItem(normalized);
						setLoading(false);
						return;
					} catch {
						// Try next endpoint.
					}
				}

				throw new Error("Failed to load item details.");
			} catch (err) {
				console.error("Error fetching item details:", err);

				if (!active) return;

				setError(
					err instanceof Error
						? err.message
						: "Failed to load item details.",
				);
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		};

		void fetchItem();

		return () => {
			active = false;
		};
	}, [params.id]);

	if (loading) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
				<p className="text-sm font-medium text-textSecondary sm:text-base">
					Fetching gear details...
				</p>
			</div>
		);
	}

	if (error || !item) {
		return (
			<div className="mx-auto max-w-2xl rounded-2xl border border-errorLight bg-errorLight/20 p-5 text-center sm:p-8">
				<p className="mb-2 font-bold text-errorDark">Item not found</p>
				<p className="mb-6 text-sm text-textSecondary">
					{error || "The item you are looking for does not exist."}
				</p>
				<Link
					href="/borrow"
					className="inline-block px-6 py-2 bg-primary text-white rounded-xl font-bold shadow-sm">
					Back to Browse
				</Link>
			</div>
		);
	}

	const itemImage =
		item.imageUrls?.[0] ||
		"https://placehold.co/800x500?text=No+Image";
	const allImages = (item.imageUrls?.length ?? 0) > 0 ? item.imageUrls ?? [] : [itemImage];

	const ownerTrustScore = useMemo(() => {
		return Number(item.owner?.trustScore ?? 100);
	}, [item.owner?.trustScore]);

	return (
		<div className="mx-auto max-w-4xl space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0">
			{/* Back button */}
			<Link
				href="/borrow"
				className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary transition-colors hover:text-primary">
				<ArrowLeft className="w-4 h-4" /> Back to Browse
			</Link>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
				{/* Images Area */}
				<div className="space-y-3 sm:space-y-4">
					<div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-borderLight bg-surfaceVariant shadow-sm">
						<img
							src={itemImage}
							alt={item.title}
							className="h-full w-full object-cover"
						/>
						<button className="absolute right-3 top-3 rounded-full bg-surface/80 p-2 text-textSecondary backdrop-blur-sm transition-all hover:bg-errorLight hover:text-error sm:right-4 sm:top-4">
							<Heart className="w-5 h-5" />
						</button>
					</div>
					<div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none sm:gap-4">
						{allImages.map((img: string, i: number) => (
							<div
								key={i}
								className={`h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all sm:h-20 sm:w-20 ${i === 0 ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`}>
								<img src={img} alt="" className="w-full h-full object-cover" />
							</div>
						))}
					</div>
				</div>

				{/* Details Area */}
				<div className="space-y-5 sm:space-y-6">
					<div>
						<div className="mb-2 flex flex-wrap items-center gap-2">
							<span className="px-2.5 py-1 bg-primaryLight text-primary rounded-md text-[10px] font-bold uppercase tracking-wider">
								{item.category || "General"}
							</span>
							<span className="px-2.5 py-1 bg-surfaceVariant text-textSecondary rounded-md text-[10px] font-bold uppercase tracking-wider">
								Condition: {item.itemCondition || "Good"}
							</span>
						</div>
						<h1 className="mb-2 text-xl font-bold leading-tight text-textPrimary sm:text-2xl">
							{item.title}
						</h1>
						<div className="flex flex-wrap items-center gap-3 text-sm text-textSecondary sm:gap-4">
							<span className="flex items-center gap-1">
								<Star className="w-4 h-4 text-warning fill-warning" />
								<span className="font-bold text-textPrimary">
									{ownerTrustScore >= 90 ? "4.9" : ownerTrustScore >= 75 ? "4.5" : "4.0"}
								</span>
								(owner reputation)
							</span>
						</div>
					</div>

					<div className="space-y-4 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-5">
						<div className="flex flex-col gap-4 border-b border-borderLight pb-4 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<div className="text-sm font-semibold text-textSecondary mb-1">
									Rental Price
								</div>
								<div className="text-2xl font-extrabold text-primary sm:text-3xl">
									৳ {item.dailyRate?.toLocaleString() || 0}
									<span className="text-sm text-textSecondary font-medium">
										{" "}
										/ day
									</span>
								</div>
							</div>
							<div className="text-right">
								<div className="text-sm font-semibold text-textSecondary mb-1">
									Deposit
								</div>
								<div className="text-xl font-bold text-textPrimary">
									৳ {item.deposit?.toLocaleString() || 0}
								</div>
							</div>
						</div>
						<Link
							href={`/borrow/book/${item.itemId || params.id}`}
							className="block w-full rounded-xl bg-primary py-3.5 text-center font-bold text-white shadow-sm transition-colors hover:bg-primaryDark">
							Book This Item
						</Link>
						<div className="flex items-start gap-2 rounded-xl bg-warningLight/50 p-3 text-xs font-medium text-warningDark">
							<AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
							Deposit is fully refundable provided the item is returned in the
							same condition.
						</div>
					</div>

					{/* Owner Card */}
					<div>
						<h2 className="mb-3 text-base font-bold text-textPrimary">
							Item Owner
						</h2>
						<Link
							href={`/profile/${item.owner?.userId}`}
							className="block rounded-xl border border-borderLight bg-surface p-4 shadow-sm transition hover:shadow-md">
							<div className="flex items-center gap-3 min-w-0">
								<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primaryLight text-lg font-extrabold text-primary">
									{item.owner?.name?.charAt(0) || "U"}
								</div>
								<div>
									<div className="flex min-w-0 items-center gap-1.5 font-bold text-textPrimary">
										{item.owner?.name || "Unknown Owner"}
										{item.owner?.verified && (
											<CheckCircle2 className="w-4 h-4 text-success" />
										)}
									</div>
									<div className="mt-0.5 text-xs text-textSecondary">
										{item.owner?.verified
											? "Verified Campus Student"
											: "Campus Member"}
									</div>
								</div>
							</div>
							<div className="flex flex-col items-end text-right">
								<div className="mb-1 flex items-center gap-1.5 rounded-md bg-successLight px-2 py-1 text-xs font-bold leading-none text-success">
									<Shield className="w-3.5 h-3.5" />{" "}
									{ownerTrustScore} Trust
								</div>
							</div>
						</Link>
					</div>

					<div className="space-y-2">
						<h3 className="text-base font-bold text-textPrimary">
							Description
						</h3>
						<p className="whitespace-pre-line text-sm leading-relaxed text-textSecondary">
							{item.description || "No description provided for this item."}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
