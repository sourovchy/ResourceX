"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Star } from "lucide-react";

type ReviewTab = "received" | "given";

type ReviewItem = {
	id: string;
	item: string;
	role: string;
	reviewer?: string;
	reviewee?: string;
	rating: number;
	date: string;
	comment: string;
};

type ReviewsApiResponse =
	| {
		receivedReviews?: unknown;
		givenReviews?: unknown;
		reviews?: unknown;
		data?: unknown;
		content?: unknown;
	}
	| unknown;

const REVIEW_ENDPOINT_CANDIDATES = [
	"/api/reviews/me",
	"/api/reviews/my-reviews",
	"/api/reviews",
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

	return (await response.json()) as ReviewsApiResponse;
}

function toReviewItem(raw: any, fallbackRole: ReviewTab): ReviewItem {
	const id =
		String(raw?.id ?? raw?.reviewId ?? raw?.review_id ?? crypto.randomUUID());
	const item =
		raw?.item ??
		raw?.itemName ??
		raw?.itemTitle ??
		raw?.title ??
		raw?.bookingItemName ??
		"Untitled item";
	const role =
		raw?.role ??
		raw?.reviewType ??
		raw?.direction ??
		fallbackRole === "received"
			? "Received"
			: "Given";
	const reviewer =
		raw?.reviewer ??
		raw?.reviewerName ??
		raw?.fromUserName ??
		raw?.authorName;
	const reviewee =
		raw?.reviewee ??
		raw?.revieweeName ??
		raw?.toUserName ??
		raw?.targetUserName;
	const ratingValue = Number(raw?.rating ?? raw?.stars ?? raw?.score ?? 0);
	const createdAt = raw?.date ?? raw?.createdAt ?? raw?.reviewDate ?? raw?.updatedAt;
	const comment = raw?.comment ?? raw?.message ?? raw?.review ?? raw?.body ?? "";

	return {
		id,
		item,
		role,
		reviewer,
		reviewee,
		rating: Number.isFinite(ratingValue) ? ratingValue : 0,
		date: createdAt ? new Date(createdAt).toLocaleDateString() : "—",
		comment,
	};
}

function extractReviewArray(payload: ReviewsApiResponse, fallbackRole: ReviewTab) {
	const root: any = payload && typeof payload === "object" ? payload : {};
	const source =
		root.receivedReviews ??
		root.givenReviews ??
		root.reviews ??
		root.content ??
		root.data ??
		payload;

	if (!Array.isArray(source)) return [] as ReviewItem[];
	return source.map((entry: any) => toReviewItem(entry, fallbackRole));
}

function splitReviewsByRole(allReviews: ReviewItem[]) {
	const received = allReviews.filter((review) => {
		const role = review.role.toLowerCase();
		return role.includes("received") || role.includes("as owner");
	});

	const given = allReviews.filter((review) => {
		const role = review.role.toLowerCase();
		return role.includes("given") || role.includes("as renter");
	});

	return { received, given };
}

async function loadReviewsForTab(tab: ReviewTab) {
	const tabSpecificCandidates =
		tab === "received"
			? ["/api/reviews/me/received", "/api/reviews/received", "/api/reviews?type=received"]
			: ["/api/reviews/me/given", "/api/reviews/given", "/api/reviews?type=given"];

	for (const url of [...REVIEW_ENDPOINT_CANDIDATES, ...tabSpecificCandidates]) {
		try {
			const payload = await fetchJson(url);
			const received = extractReviewArray(payload, "received");
			const given = extractReviewArray(payload, "given");

			if (received.length || given.length) {
				return { received, given };
			}
		} catch {
			// Keep trying fallbacks.
		}
	}

	throw new Error("Unable to load reviews from the API.");
}

export default function MyReviewsPage() {
	const [tab, setTab] = useState<ReviewTab>("received");
	const [receivedReviews, setReceivedReviews] = useState<ReviewItem[]>([]);
	const [givenReviews, setGivenReviews] = useState<ReviewItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		const fetchReviews = async () => {
			setLoading(true);
			setError(null);

			try {
				const payload = await loadReviewsForTab(tab);
				if (!active) return;

				const split =
					payload.received.length || payload.given.length
						? payload
						: splitReviewsByRole([...payload.received, ...payload.given]);

				setReceivedReviews(split.received);
				setGivenReviews(split.given);
			} catch (err) {
				if (!active) return;
				setError(
					err instanceof Error ? err.message : "Failed to load reviews.",
				);
			} finally {
				if (active) setLoading(false);
			}
		};

		void fetchReviews();

		return () => {
			active = false;
		};
	}, [tab]);

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
						Reviews will appear here once they are submitted through the backend.
					</p>
				</div>
			) : (
				<div className="space-y-4 pt-2">
					{reviews.map((r) => (
						<div
							key={r.id}
							className="rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6">
							<div className="mb-4 flex flex-col gap-4 border-b border-borderLight pb-4 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<h3 className="break-words text-base font-bold text-textPrimary sm:text-lg">{r.item}</h3>
									<div className="mt-1 text-xs font-semibold text-textSecondary">
										{r.role} • {r.date}
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
									{tab === "received"
										? (r.reviewer ?? "U").charAt(0)
										: (r.reviewee ?? "U").charAt(0)}
								</div>
								<div>
									<div className="mb-1 break-words text-sm font-bold text-textPrimary">
										{tab === "received" ? r.reviewer ?? "Unknown reviewer" : r.reviewee ?? "Unknown reviewee"}
									</div>
									<p className="flex items-start gap-2 break-words text-sm text-textSecondary">
										<MessageSquare className="mt-0.5 h-4 w-4 shrink-0 opacity-50" />
										{r.comment}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
