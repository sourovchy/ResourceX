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
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 xl:gap-8">
					{posts.map((post) => {
						const requestCount = pendingRequestsByItem[post.itemId] ?? 0;
						return (
							<div
								key={post.itemId}
								className="group flex flex-col overflow-hidden rounded-2xl border border-borderLight bg-surface shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
								<div className="relative h-44 w-full bg-surfaceVariant sm:h-48 md:h-52">
									<SafeImage
										src={post.imageUrls?.[0]}
										alt={post.title}
										fill
										className="object-cover"
										sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
									/>
									<div className="absolute left-3 top-3">
										<span
											className={`rounded-lg px-2 py-1 text-[10px] font-bold shadow-sm backdrop-blur-md sm:px-2.5 sm:text-xs ${
												STATUS_COLOR[post.status] ??
												"border border-borderLight bg-surfaceVariant text-textSecondary"
											}`}>
											{post.status}
										</span>
									</div>
								</div>

								<div className="flex flex-1 flex-col p-5 sm:p-6">
									<h3 className="mb-4 line-clamp-1 text-lg font-bold text-textPrimary transition-colors group-hover:text-primary sm:text-xl">
										{post.title}
									</h3>
									<div className="mb-5 rounded-xl bg-surfaceVariant/50 p-4 transition-colors group-hover:bg-surfaceVariant">
										<div className="mb-1 text-xs font-semibold tracking-wider text-textSecondary uppercase">
											Price
										</div>
										<div className="font-extrabold text-primary">
											৳ {post.dailyRate}
											<span className="text-[10px] text-textSecondary sm:text-xs">/d</span>
										</div>
									</div>

									{requestCount > 0 && (
										<Link
											href={`/my-posts/requests?postId=${post.itemId}`}
											className="mb-4 flex items-center justify-between rounded-xl bg-warningLight px-4 py-2.5 text-sm font-bold text-warningDark transition hover:opacity-80">
											<span>{requestCount} pending requests</span>
											<span>View</span>
										</Link>
									)}

									<div className="mt-auto flex gap-3 border-t border-borderLight pt-5">
										<Link
											href={`/my-posts/edit/${post.itemId}`}
											className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primaryLight px-3 py-2.5 text-sm font-bold text-primary transition-all hover:bg-primaryLight/80 active:scale-[0.98]">
											<Edit className="h-4 w-4" /> Edit
										</Link>
										<button
											onClick={() => setDeleteTarget(post)}
											className="flex items-center justify-center rounded-xl bg-errorLight px-4 py-2.5 text-sm font-bold text-error transition-all hover:bg-errorLight/80 active:scale-[0.98]">
											<Trash2 className="h-4 w-4" />
										</button>
									</div>
								</div>
							</div>
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
