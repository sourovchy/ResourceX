"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
	PlusCircle,
	Edit,
	Trash2,
	TrendingUp,
	Eye,
	Loader2,
	ImageIcon,
} from "lucide-react";

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
	const [posts, setPosts] = useState<Item[]>([]);
	const [requests, setRequests] = useState<Booking[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const fetchPosts = async () => {
		try {
			setLoading(true);
			const [itemsRes, requestRes] = await Promise.all([
				api.get<Item[]>("/items/me"),
				api.get<Booking[]>("/bookings/owner"),
			]);
			setPosts(itemsRes.data ?? []);
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

	const deletePost = async (itemId: number) => {
		try {
			await api.delete(`/items/${itemId}`);
			await fetchPosts();
		} catch {
			alert("Could not delete this listing. It may have active bookings.");
		}
	};

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
				<p className="text-textSecondary font-medium">Loading your listings...</p>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto space-y-6 pb-20">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary tracking-tight">My Posts</h1>
					<p className="text-sm text-textSecondary mt-1">
						Manage the items you are renting out.
					</p>
				</div>

				<div className="flex gap-2">
					<Link href="/my-posts/active-rentals" className="flex items-center gap-2 px-4 py-2 bg-surfaceVariant text-textSecondary rounded-xl text-sm font-semibold hover:bg-borderLight transition">
						<Eye className="w-4 h-4" /> Active Rentals
					</Link>
					<Link href="/my-posts/earnings" className="flex items-center gap-2 px-4 py-2 bg-successLight text-successDark rounded-xl text-sm font-semibold hover:opacity-80 transition">
						<TrendingUp className="w-4 h-4" /> Earnings
					</Link>
					<Link href="/my-posts/add" className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-sm hover:bg-primaryDark transition-colors">
						<PlusCircle className="w-4 h-4" /> Add New Item
					</Link>
				</div>
			</div>

			{error && (
				<div className="bg-errorLight text-error px-4 py-3 rounded-xl text-sm font-semibold">
					{error}
				</div>
			)}

			{posts.length === 0 ? (
				<div className="text-center py-20 border border-borderLight rounded-lg bg-surface">
					<p className="text-textSecondary text-sm">No listings found. Create your first listing.</p>
					<Link href="/my-posts/add" className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold">
						Create listing
					</Link>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{posts.map((post) => {
						const requestCount = pendingRequestsByItem[post.itemId] ?? 0;
						return (
							<div key={post.itemId} className="bg-surface border border-borderLight rounded-lg overflow-hidden shadow-sm flex flex-col">
								<div className="relative h-48 w-full bg-surfaceVariant">
									{post.imageUrls?.[0] ? (
										<img src={post.imageUrls[0]} alt={post.title} className="w-full h-full object-cover" />
									) : (
										<div className="w-full h-full flex items-center justify-center text-textTertiary">
											<ImageIcon className="w-10 h-10" />
										</div>
									)}
									<div className="absolute top-3 left-3">
										<span className={`px-2.5 py-1 backdrop-blur-md shadow-sm rounded-lg text-xs font-bold ${STATUS_COLOR[post.status] ?? "bg-surfaceVariant text-textSecondary border border-borderLight"}`}>
											{post.status}
										</span>
									</div>
								</div>

								<div className="p-5 flex flex-col flex-1">
									<h3 className="text-lg font-bold text-textPrimary mb-3 line-clamp-1">{post.title}</h3>
									<div className="bg-surfaceVariant rounded-xl p-3 mb-4">
										<div className="text-xs text-textSecondary font-semibold mb-1">Price</div>
										<div className="font-extrabold text-primary">
											৳ {post.dailyRate}
											<span className="text-xs text-textSecondary">/d</span>
										</div>
									</div>

									{requestCount > 0 && (
										<Link href={`/my-posts/requests?postId=${post.itemId}`} className="flex items-center justify-between bg-warningLight text-warningDark px-4 py-2.5 rounded-xl text-sm font-bold mb-4 hover:opacity-80 transition">
											<span>{requestCount} pending requests</span>
											<span>View</span>
										</Link>
									)}

									<div className="mt-auto pt-4 border-t border-borderLight flex gap-2">
										<Link href={`/my-posts/edit/${post.itemId}`} className="px-3 py-2 bg-primaryLight text-primary rounded-lg text-xs font-bold">
											<Edit className="w-3.5 h-3.5 inline" /> Edit
										</Link>
										<button onClick={() => deletePost(post.itemId)} className="ml-auto px-3 py-2 bg-errorLight text-error rounded-lg text-xs font-bold">
											<Trash2 className="w-3.5 h-3.5 inline" />
										</button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
