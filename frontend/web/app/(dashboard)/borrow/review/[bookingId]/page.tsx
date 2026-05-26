"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star, MessageSquare, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";


type BookingSummary = {
	bookingId: string;
	item: string;
	owner: string;
	dates: string;
	image: string;
};

type BookingApiResponse =
	| {
		booking?: unknown;
		data?: unknown;
		content?: unknown;
	}
	| unknown;

type ReviewPayload = {
	bookingId: string;
	rating: number;
	comment: string;
};

const BOOKING_ENDPOINTS = [
	"/api/bookings",
	"/api/bookings/",
	"/api/booking",
	"/api/borrow/bookings",
];

const REVIEW_ENDPOINTS = [
	"/api/reviews",
	"/api/reviews/create",
	"/api/bookings/reviews",
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

	return (await response.json()) as BookingApiResponse;
}

function normalizeBooking(raw: any, fallbackId: string): BookingSummary {
	const itemName =
		raw?.item?.title ??
		raw?.itemTitle ??
		raw?.itemName ??
		raw?.title ??
		"Untitled Item";

	const ownerName =
		raw?.owner?.name ??
		raw?.ownerName ??
		raw?.sellerName ??
		"Unknown Owner";

	const startDate = raw?.startDate ?? raw?.bookingStartDate ?? raw?.fromDate;
	const endDate = raw?.endDate ?? raw?.bookingEndDate ?? raw?.toDate;
	const dates = startDate && endDate ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}` : "—";

	return {
		bookingId: String(raw?.bookingId ?? raw?.id ?? fallbackId),
		item: itemName,
		owner: ownerName,
		dates,
		image:
			raw?.item?.imageUrls?.[0] ??
			raw?.item?.images?.[0] ??
			raw?.image ??
			"https://placehold.co/200x150?text=Item",
	};
}

function extractBooking(payload: BookingApiResponse, fallbackId: string) {
	const root: any = payload && typeof payload === "object" ? payload : {};
	const source = root.booking ?? root.data ?? root.content ?? payload;

	if (Array.isArray(source)) {
		const match = source.find((entry: any) => String(entry?.bookingId ?? entry?.id) === fallbackId);
		return match ? normalizeBooking(match, fallbackId) : null;
	}

	if (source && typeof source === "object") {
		return normalizeBooking(source, fallbackId);
	}

	return null;
}

async function loadBooking(bookingId: string) {
	const endpoints = [
		`/api/bookings/${bookingId}`,
		`/api/booking/${bookingId}`,
		`/api/borrow/bookings/${bookingId}`,
	];

	for (const endpoint of endpoints) {
		try {
			const payload = await fetchJson(endpoint);
			const booking = extractBooking(payload, bookingId);
			if (booking) return booking;
		} catch {
			// try next endpoint
		}
	}

	throw new Error("Unable to load booking details.");
}

export default function ReviewPage({
	params,
}: {
	params: { bookingId: string };
}) {
	const [rating, setRating] = useState(0);
	const [hoverRating, setHoverRating] = useState(0);
	const [comment, setComment] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [booking, setBooking] = useState<BookingSummary | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		const fetchBooking = async () => {
			setLoading(true);
			setError(null);

			try {
				const loadedBooking = await loadBooking(params.bookingId);
				if (!active) return;

				setBooking(loadedBooking);
			} catch (err) {
				if (!active) return;

				setError(
					err instanceof Error ? err.message : "Failed to load booking details.",
				);
			} finally {
				if (active) setLoading(false);
			}
		};

		void fetchBooking();

		return () => {
			active = false;
		};
	}, [params.bookingId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (rating === 0 || !comment.trim()) {
			setError("Please select a rating and enter a comment.");
			return;
		}

		try {
			setSubmitting(true);

			const payload: ReviewPayload = {
				bookingId: params.bookingId,
				rating,
				comment: comment.trim(),
			};

			let success = false;

			for (const endpoint of REVIEW_ENDPOINTS) {
				try {
					const response = await fetch(endpoint, {
						method: "POST",
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
							...getAuthHeaders(),
						},
						body: JSON.stringify(payload),
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
				throw new Error("Review submission failed.");
			}

			setSubmitted(true);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to submit review.",
			);
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-3 px-4 text-center">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
				<p className="text-sm text-textSecondary sm:text-base">Loading booking details...</p>
			</div>
		);
	}

	if (error && !booking) {
		return (
			<div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
				<div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-errorLight text-error">
					<AlertTriangle className="h-10 w-10" />
				</div>
				<h1 className="text-2xl font-extrabold text-textPrimary sm:text-3xl">
					Booking Not Found
				</h1>
				<p className="mt-3 max-w-md text-sm text-textSecondary sm:text-base">{error}</p>
				<Link
					href="/my-bookings"
					className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primaryDark sm:text-base">
					Return to My Bookings
				</Link>
			</div>
		);
	}

	if (submitted) {
		return (
			<div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
				<div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-successLight text-success">
					<CheckCircle2 className="h-10 w-10" />
				</div>
				<h1 className="text-2xl font-extrabold text-textPrimary sm:text-3xl">
					Review Submitted!
				</h1>
				<p className="mt-3 max-w-lg text-sm text-textSecondary sm:text-base">
					Thank you for sharing your experience. Honest reviews help keep the ResourceX community trustworthy and safe.
				</p>
				<Link
					href="/my-bookings"
					className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primaryDark sm:text-base">
					Return to My Bookings
				</Link>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-2xl space-y-6 px-3 pb-20 sm:space-y-8 sm:px-0">
			<Link
				href="/my-bookings"
				className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary transition-colors hover:text-primary">
				<ArrowLeft className="w-4 h-4" /> Back to My Bookings
			</Link>

			<div className="text-center">
				<h1 className="text-xl font-extrabold tracking-tight text-textPrimary sm:text-2xl">
					Leave a Review
				</h1>
				<p className="mt-2 text-sm text-textSecondary sm:text-base">
					How was your experience renting from {booking?.owner ?? "this owner"}?
				</p>
			</div>

			<div className="space-y-6 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6 md:p-8">
				{error && (
					<div className="flex items-start gap-3 rounded-xl border border-error bg-errorLight/30 p-4 text-sm text-errorDark">
						<AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
						<span>{error}</span>
					</div>
				)}

				{/* Booking Info Card */}
				<div className="flex flex-col gap-4 rounded-xl border border-borderLight bg-surfaceVariant p-4 sm:flex-row sm:items-center">
					<img
						src={booking?.image ?? "https://placehold.co/200x150?text=Item"}
						alt={booking?.item ?? "Booking item"}
						className="h-20 w-full rounded-lg border border-borderLight object-cover sm:h-16 sm:w-16"
					/>
					<div className="min-w-0">
						<h3 className="break-words font-bold text-textPrimary">{booking?.item ?? "Untitled Item"}</h3>
						<p className="mt-0.5 text-xs text-textSecondary">
							Rented on: {booking?.dates ?? "—"}
						</p>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
					{/* Rating Section */}
					<div className="flex flex-col items-center space-y-3">
						<label className="block text-sm font-bold uppercase tracking-wider text-textSecondary">
							Rate Your Experience
						</label>
						<div
							className="flex flex-wrap items-center justify-center gap-1 sm:gap-2"
							onMouseLeave={() => setHoverRating(0)}>
							{[1, 2, 3, 4, 5].map((star) => (
								<button
									key={star}
									type="button"
									onClick={() => setRating(star)}
									onMouseEnter={() => setHoverRating(star)}
									className="rounded-full p-1 transition-transform hover:scale-110 focus:outline-none">
									<Star
										className={`h-9 w-9 sm:h-10 sm:w-10 ${
											star <= (hoverRating || rating)
												? "text-warning fill-warning"
												: "text-outlineVariant"
										} transition-colors`}
									/>
								</button>
							))}
						</div>
						<div className="h-4 text-xs font-bold text-textSecondary">
							{rating === 1 && "Poor"}
							{rating === 2 && "Fair"}
							{rating === 3 && "Good"}
							{rating === 4 && "Very Good"}
							{rating === 5 && "Excellent"}
						</div>
					</div>

					{/* Written Comment Section */}
					<div className="space-y-2">
						<label
							htmlFor="comment"
							className="flex items-center gap-2 text-sm font-bold text-textPrimary">
							<MessageSquare className="w-4 h-4 text-textSecondary" />
							Written Comment
						</label>
						<textarea
							id="comment"
							rows={5}
							placeholder="Share any details about the item's condition or the owner's communication..."
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							className="w-full resize-none rounded-xl border border-borderLight bg-surfaceVariant px-4 py-3 text-sm text-textPrimary transition-all placeholder:text-textTertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
							required></textarea>
						<p className="text-right text-xs text-textTertiary">
							{comment.length} / 500 characters
						</p>
					</div>

					{/* Submit Button */}
					<button
						type="submit"
						disabled={rating === 0 || !comment.trim() || submitting}
						className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 font-bold text-white shadow-sm transition-colors hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg">
						{submitting ? (
							<>
								<Loader2 className="w-5 h-5 animate-spin" />
								Submitting...
							</>
						) : (
							"Submit Review"
						)}
					</button>
				</form>
			</div>
		</div>
	);
}
