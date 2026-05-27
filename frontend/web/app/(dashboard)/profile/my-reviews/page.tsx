"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Star } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { ReviewResponse } from "@/types/review";

type ReviewTab = "received" | "given";

export default function MyReviewsPage() {
	const { user } = useAuth();
	const [tab, setTab] = useState<ReviewTab>("received");
	const [receivedReviews, setReceivedReviews] = useState<ReviewResponse[]>([]);
	const [givenReviews, setGivenReviews] = useState<ReviewResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!user) return;

		let active = true;

		const fetchReviews = async () => {
			setLoading(true);
			setError(null);

			try {
				const [receivedRes, givenRes] = await Promise.all([
					api.get<ReviewResponse[]>(`/reviews/reviewee/${user.userId}`),
					api.get<ReviewResponse[]>(`/reviews/reviewer/${user.userId}`),
				]);

				if (!active) return;
				setReceivedReviews(receivedRes.data);
				setGivenReviews(givenRes.data);
			} catch (err) {
				if (!active) return;
				setError(err instanceof Error ? err.message : "Failed to load reviews.");
			} finally {
				if (active) setLoading(false);
			}
		};

		void fetchReviews();

		return () => {
			active = false;
		};
	}, [user]);

	const reviews = useMemo(
		() => (tab === "received" ? receivedReviews : givenReviews),
		[tab, receivedReviews, givenReviews],
	);

	return (
		<div className="mx-auto max-w-4xl space-y-6 px-4 pb-20 sm:px-6 lg:px-8">
			<Link
				href="/profile"
				className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary hover:text-primary transition-colors">
				<ArrowLeft className="w-4 h-4" /> Back to Profile
			</Link>

			<h1 className="text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
				My Reviews
			</h1>

			<div className="flex h-12 overflow-x-auto border-b border-borderLight">
				<button
					onClick={() => setTab("received")}
					className={`whitespace-nowrap px-4 py-0 text-sm font-bold transition-colors sm:px-8 ${tab === "received" ? "border-b-2 border-primary text-primary" : "text-textSecondary hover:text-textPrimary"}`}>
					Received ({receivedReviews.length})
				</button>
				<button
					onClick={() => setTab("given")}
					className={`whitespace-nowrap px-4 py-0 text-sm font-bold transition-colors sm:px-8 ${tab === "given" ? "border-b-2 border-primary text-primary" : "text-textSecondary hover:text-textPrimary"}`}>
					Given ({givenReviews.length})
				</button>
			</div>

			{loading ? (
				<div className="rounded-2xl border border-borderLight bg-surface p-4 text-center text-sm text-textSecondary shadow-sm sm:p-8">
					Loading reviews...
				</div>
			) : error ? (
				<div className="rounded-2xl border border-errorLight bg-errorLight/40 p-6 text-sm font-medium text-errorDark">
					{error}
				</div>
			) : reviews.length === 0 ? (
				<div className="rounded-2xl border border-borderLight bg-surface p-4 text-center shadow-sm sm:p-8">
					<p className="text-sm font-semibold text-textPrimary">No reviews yet</p>
					<p className="mt-2 text-sm text-textSecondary">
						{tab === "received"
							? "Reviews from other users will appear here once submitted."
							: "Reviews you have written will appear here."}
					</p>
				</div>
			) : (
				<div className="space-y-4 pt-2">
					{reviews.map((r) => {
						const otherParty = tab === "received" ? r.reviewer : r.reviewee;
						return (
							<div
								key={r.reviewId}
								className="rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6">
								<div className="mb-4 flex flex-col gap-4 border-b border-borderLight pb-4 sm:flex-row sm:items-center sm:justify-between">
									<div>
										<h3 className="break-words text-base font-bold text-textPrimary sm:text-lg">
											Booking #{r.bookingId}
										</h3>
										<div className="mt-1 text-xs font-semibold text-textSecondary">
											{tab === "received" ? "Received" : "Given"} •{" "}
											{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
										</div>
									</div>
									<div className="flex items-center gap-1">
										{Array.from({ length: 5 }).map((_, i) => (
											<Star
												key={i}
												className={`h-4 w-4 shrink-0 ${i < r.rating ? "text-warning fill-warning" : "text-outlineVariant"}`}
											/>
										))}
									</div>
								</div>

								<div className="flex items-start gap-3">
									<div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primaryLight text-xs font-bold text-primary">
										{(otherParty?.name ?? "U").charAt(0)}
									</div>
									<div>
										<div className="mb-1 break-words text-sm font-bold text-textPrimary">
											{otherParty?.name ?? "Unknown user"}
										</div>
										<p className="flex items-start gap-2 break-words text-sm text-textSecondary">
											<MessageSquare className="mt-0.5 h-4 w-4 shrink-0 opacity-50" />
											{r.comment}
										</p>
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
