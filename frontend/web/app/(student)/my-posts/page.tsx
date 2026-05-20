"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
	PlusCircle,
	Edit,
	Trash2,
	Power,
	AlertTriangle,
	TrendingUp,
	Eye,
} from "lucide-react";

const INITIAL_POSTS = [
	{
		id: "p1",
		title: "Sony Alpha A7III DSLR Camera",
		status: "Available",
		statusColor: "bg-successLight text-successDark",
		price: 500,
		earnings: 7500,
		requests: 2,
		image:
			"https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400&h=300",
	},
	{
		id: "p2",
		title: "Arduino Mega 2560 Kit",
		status: "Rented Out",
		statusColor: "bg-warningLight text-warningDark",
		price: 50,
		earnings: 1200,
		requests: 0,
		image:
			"https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=400&h=300",
	},
	{
		id: "p4",
		title: "Camping Tent",
		status: "Inactive",
		statusColor:
			"bg-surfaceVariant text-textSecondary border border-borderLight",
		price: 200,
		earnings: 0,
		requests: 0,
		image:
			"https://images.unsplash.com/photo-1504280502846-5f562ed22501?auto=format&fit=crop&q=80&w=400&h=300",
	},
];

export default function MyPostsPage() {
	const [posts, setPosts] = useState(INITIAL_POSTS);

	const toggleAvailability = (id: string) => {
		setPosts(
			posts.map((post) => {
				if (post.id === id) {
					const newStatus =
						post.status === "Available" ? "Inactive" : "Available";

					const newColor =
						newStatus === "Available"
							? "bg-successLight text-successDark"
							: "bg-surfaceVariant text-textSecondary border border-borderLight";

					return { ...post, status: newStatus, statusColor: newColor };
				}
				return post;
			}),
		);
	};

	return (
		<div className="max-w-6xl mx-auto space-y-6 pb-20">
			{/* HEADER */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary tracking-tight">
						My Posts
					</h1>
					<p className="text-sm text-textSecondary mt-1">
						Manage the items you are renting out.
					</p>
				</div>

				<div className="flex gap-2">
					<Link
						href="/my-posts/active-rentals"
						className="flex items-center gap-2 px-4 py-2 bg-surfaceVariant text-textSecondary rounded-xl text-sm font-semibold hover:bg-borderLight transition">
						<Eye className="w-4 h-4" /> Active Rentals
					</Link>

					<Link
						href="/my-posts/earnings"
						className="flex items-center gap-2 px-4 py-2 bg-successLight text-successDark rounded-xl text-sm font-semibold hover:opacity-80 transition">
						<TrendingUp className="w-4 h-4" /> Earnings
					</Link>

					<Link
						href="/my-posts/add"
						className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-sm hover:bg-primaryDark transition-colors">
						<PlusCircle className="w-4 h-4" /> Add New Item
					</Link>
				</div>
			</div>

			{/* EMPTY STATE */}
			{posts.length === 0 && (
				<div className="text-center py-20 border border-borderLight rounded-2xl bg-surface">
					<p className="text-textSecondary text-sm">
						You haven't added any posts yet.
					</p>
					<Link
						href="/my-posts/add"
						className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold">
						Add Your First Item
					</Link>
				</div>
			)}

			{/* GRID */}
			{posts.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{posts.map((post) => (
						<div
							key={post.id}
							className="bg-surface border border-borderLight rounded-2xl overflow-hidden shadow-sm flex flex-col">
							<div className="relative h-48 w-full bg-surfaceVariant">
								<img
									src={post.image}
									alt={post.title}
									className="w-full h-full object-cover"
								/>

								<div className="absolute top-3 left-3">
									<span
										className={`px-2.5 py-1 backdrop-blur-md shadow-sm rounded-lg text-xs font-bold ${post.statusColor}`}>
										{post.status}
									</span>
								</div>
							</div>

							<div className="p-5 flex flex-col flex-1">
								<h3 className="text-lg font-bold text-textPrimary mb-3 line-clamp-1">
									{post.title}
								</h3>

								<div className="grid grid-cols-2 gap-4 mb-4">
									<div className="bg-surfaceVariant rounded-xl p-3">
										<div className="text-xs text-textSecondary font-semibold mb-1">
											Price
										</div>
										<div className="font-extrabold text-primary">
											৳ {post.price}
											<span className="text-xs text-textSecondary">/d</span>
										</div>
									</div>

									<div className="bg-surfaceVariant rounded-xl p-3">
										<div className="text-xs text-textSecondary font-semibold mb-1">
											Earnings
										</div>
										<div className="font-extrabold text-success">
											৳ {post.earnings}
										</div>
									</div>
								</div>

								{/* REQUESTS FIXED */}
								{post.requests > 0 && (
									<Link
										href={`/my-posts/requests?postId=${post.id}`}
										className="flex items-center justify-between bg-warningLight text-warningDark px-4 py-2.5 rounded-xl text-sm font-bold mb-4 hover:opacity-80 transition">
										<span className="flex items-center gap-2">
											<AlertTriangle className="w-4 h-4" />
											{post.requests} requests
										</span>
										<span>View →</span>
									</Link>
								)}

								<div className="mt-auto pt-4 border-t border-borderLight flex gap-2 overflow-x-auto">
									<Link
										href={`/my-posts/edit/${post.id}`}
										className="px-3 py-2 bg-primaryLight text-primary rounded-lg text-xs font-bold">
										<Edit className="w-3.5 h-3.5 inline" /> Edit
									</Link>

									<button
										onClick={() => toggleAvailability(post.id)}
										disabled={post.status === "Rented Out"}
										className="px-3 py-2 bg-surfaceVariant text-textSecondary rounded-lg text-xs font-bold disabled:opacity-50">
										<Power className="w-3.5 h-3.5 inline" /> Toggle
									</button>

									<button className="ml-auto px-3 py-2 bg-errorLight text-error rounded-lg text-xs font-bold">
										<Trash2 className="w-3.5 h-3.5 inline" />
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
