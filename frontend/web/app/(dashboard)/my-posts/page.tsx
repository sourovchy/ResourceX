"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import api from "@/lib/api";
import {
	PlusCircle,
	Edit,
	Trash2,
	Loader2,
	ImageIcon,
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/context/ToastContext";
import ItemCard from "@/components/cards/ItemCard";

type Item = {
	itemId: number;
	title: string;
	status: string;
	dailyRate: number;
	imageUrls?: string[];
};

type Booking = {
	bookingId: number;
	status: string;
	item?: { itemId: number };
};

const STATUS_COLOR: Record<string, string> = {
	AVAILABLE: "bg-successLight text-successDark",
	UNAVAILABLE: "bg-warningLight text-warningDark",
	BLOCKED: "bg-errorLight text-error",
};

export default function MyPostsPage() {
	const { toast } = useToast();
	const [posts, setPosts] = useState<Item[]>([]);
	const [requests, setRequests] = useState<Booking[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
	const [deleting, setDeleting] = useState(false);

	const fetchPosts = async () => {
		try {
			setLoading(true);
			const [itemsRes, requestRes] = await Promise.all([
				api.get<{ content: Item[] } | Item[]>("/items/me"),
				api.get<Booking[]>("/bookings/owner"),
			]);
			const itemsData = itemsRes.data;
			const allItems = Array.isArray(itemsData)
				? itemsData
				: (itemsData as { content: Item[] }).content ?? [];
			// Never show DELETED items in the owner's view
			setPosts(allItems.filter((i) => i.status !== "DELETED"));
			setRequests(requestRes.data ?? []);
			setError("");
		} catch {
			setError("Could not load your listings.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPosts();
	}, []);

	const pendingRequestsByItem = useMemo(() => {
		return requests.reduce<Record<number, number>>((acc, request) => {
			if (request.status === "PENDING" && request.item?.itemId) {
				acc[request.item.itemId] = (acc[request.item.itemId] ?? 0) + 1;
			}
			return acc;
		}, {});
	}, [requests]);

	const confirmDelete = async () => {
		if (!deleteTarget) return;
		setDeleting(true);
		try {
			await api.delete(`/items/${deleteTarget.itemId}`);
			// Remove immediately from local state — no re-fetch needed
			setPosts((prev) => prev.filter((p) => p.itemId !== deleteTarget.itemId));
			setDeleteTarget(null);
			toast("Listing deleted successfully.");
		} catch {
			toast("Could not delete this listing. It may have active bookings.", "error");
			setDeleteTarget(null);
		} finally {
			setDeleting(false);
		}
	};

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center py-16 sm:py-20">
				<Loader2 className="mb-4 h-8 w-8 animate-spin text-primary sm:h-10 sm:w-10" />
				<p className="text-sm font-medium text-textSecondary sm:text-base">Loading your listings...</p>
			</div>
		);
	}

	return (
		<div className="w-full space-y-6 px-4 pb-16 sm:px-6 sm:pb-20 lg:space-y-8 lg:px-8">
			<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl lg:text-4xl">My Posts</h1>
					<p className="mt-2 text-sm text-textSecondary sm:text-base lg:text-lg">
						Manage the items you are renting out.
					</p>
				</div>
				<Link
					href="/my-posts/add"
					className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primaryDark active:scale-[0.98] sm:w-auto sm:py-3.5 sm:text-base">
					<PlusCircle className="h-5 w-5" /> Add New Item
				</Link>
			</div>

			{error && (
				<div className="rounded-xl bg-errorLight px-4 py-3 text-sm font-semibold text-error">
					{error}
				</div>
			)}

			{posts.length === 0 ? (
				<div className="rounded-lg border border-borderLight bg-surface py-16 text-center sm:py-20">
					<p className="text-sm text-textSecondary sm:text-base">
						No listings found. Create your first listing.
					</p>
					<Link
						href="/my-posts/add"
						className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
						Create listing
					</Link>
				</div>
			) : (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-5">
					{posts.map((post) => {
						const requestCount = pendingRequestsByItem[post.itemId] ?? 0;
						return (
							<ItemCard
								key={post.itemId}
								item={{
									id: String(post.itemId),
									title: post.title,
									status: post.status,
									pricePerDay: post.dailyRate,
									image: post.imageUrls?.[0],
								}}
								href={`/borrow/item/${post.itemId}`}
								actionsSlot={
									<div className="flex flex-col gap-2">
										{requestCount > 0 && (
											<Link
												href={`/my-posts/requests?postId=${post.itemId}`}
												className="flex items-center justify-between rounded-lg bg-warningLight px-2 py-1 text-[10px] font-bold text-warningDark transition hover:opacity-80"
											>
												<span>{requestCount} requests</span>
												<span>View</span>
											</Link>
										)}
										<div className="flex items-center gap-2">
											<Link
												href={`/my-posts/edit/${post.itemId}`}
												className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primaryLight py-1.5 text-xs font-bold text-primary transition-all hover:bg-primaryLight/80"
											>
												<Edit className="h-3 w-3" /> Edit
											</Link>
											<button
												onClick={(e) => {
													e.preventDefault();
													setDeleteTarget(post);
												}}
												className="flex items-center justify-center rounded-lg bg-errorLight px-3 py-1.5 text-xs font-bold text-error transition-all hover:bg-errorLight/80"
											>
												<Trash2 className="h-3 w-3" />
											</button>
										</div>
									</div>
								}
							/>
						);
					})}
				</div>
			)}

			<ConfirmModal
				isOpen={deleteTarget !== null}
				title="Delete Listing"
				message={`Are you sure you want to delete "${deleteTarget?.title}"? This will permanently remove the listing and its images.`}
				confirmText="Delete"
				cancelText="Cancel"
				isDestructive
				isLoading={deleting}
				onConfirm={confirmDelete}
				onCancel={() => setDeleteTarget(null)}
			/>
		</div>
	);
}
