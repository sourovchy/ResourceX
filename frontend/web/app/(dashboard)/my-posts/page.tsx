"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
			setPosts(
				Array.isArray(itemsData) ? itemsData : (itemsData as { content: Item[] }).content ?? [],
			);
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
			if (deleteTarget.imageUrls?.length) {
				await Promise.allSettled(
					deleteTarget.imageUrls.map((url) => {
						const storedName = url.split("/").pop();
						return storedName ? api.delete(`/files/${storedName}`) : Promise.resolve();
					}),
				);
			}
			await api.delete(`/items/${deleteTarget.itemId}`);
			setDeleteTarget(null);
			toast("Listing deleted successfully.");
			await fetchPosts();
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
		<div className="mx-auto max-w-6xl space-y-5 px-3 pb-16 sm:px-4 sm:pb-20 lg:px-0">
			<div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
				<div>
					<h1 className="text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">My Posts</h1>
					<p className="mt-1 text-sm text-textSecondary sm:text-base">
						Manage the items you are renting out.
					</p>
				</div>
				<Link
					href="/my-posts/add"
					className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primaryDark sm:w-auto">
					<PlusCircle className="h-4 w-4" /> Add New Item
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
				<div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
					{posts.map((post) => {
						const requestCount = pendingRequestsByItem[post.itemId] ?? 0;
						return (
							<div
								key={post.itemId}
								className="flex flex-col overflow-hidden rounded-lg border border-borderLight bg-surface shadow-sm">
								<div className="relative h-40 w-full bg-surfaceVariant sm:h-44 md:h-48">
									{post.imageUrls?.[0] ? (
										<Image
											src={post.imageUrls[0]}
											alt={post.title}
											fill
											className="object-cover"
											sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center text-textTertiary">
											<ImageIcon className="h-8 w-8 sm:h-10 sm:w-10" />
										</div>
									)}
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

								<div className="flex flex-1 flex-col p-4 sm:p-5">
									<h3 className="mb-3 line-clamp-1 text-base font-bold text-textPrimary sm:text-lg">
										{post.title}
									</h3>
									<div className="mb-4 rounded-xl bg-surfaceVariant p-3">
										<div className="mb-1 text-[10px] font-semibold text-textSecondary sm:text-xs">
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

									<div className="mt-auto flex gap-2 border-t border-borderLight pt-4">
										<Link
											href={`/my-posts/edit/${post.itemId}`}
											className="rounded-lg bg-primaryLight px-3 py-2 text-xs font-bold text-primary">
											<Edit className="inline h-3.5 w-3.5" /> Edit
										</Link>
										<button
											onClick={() => setDeleteTarget(post)}
											className="ml-auto rounded-lg bg-errorLight px-3 py-2 text-xs font-bold text-error">
											<Trash2 className="inline h-3.5 w-3.5" />
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
