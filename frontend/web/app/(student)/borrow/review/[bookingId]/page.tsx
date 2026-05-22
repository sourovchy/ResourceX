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
			<div className="max-w-2xl mx-auto py-20 text-center space-y-4">
				<Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
				<p className="text-textSecondary">Loading booking details...</p>
			</div>
		);
	}

	if (error && !booking) {
		return (
			<div className="max-w-2xl mx-auto py-20 text-center space-y-6">
				<div className="w-20 h-20 bg-errorLight text-error rounded-full flex items-center justify-center mx-auto mb-4">
					<AlertTriangle className="w-10 h-10" />
				</div>
				<h1 className="text-3xl font-extrabold text-textPrimary">
					Booking Not Found
				</h1>
				<p className="text-textSecondary">{error}</p>
				<Link
					href="/my-bookings"
					className="inline-block mt-4 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-primaryDark transition-colors">
					Return to My Bookings
				</Link>
			</div>
		);
	}

	if (submitted) {
		return (
			<div className="max-w-2xl mx-auto py-20 text-center space-y-6">
				<div className="w-20 h-20 bg-successLight text-success rounded-full flex items-center justify-center mx-auto mb-4">
					<CheckCircle2 className="w-10 h-10" />
				</div>
				<h1 className="text-3xl font-extrabold text-textPrimary">
					Review Submitted!
				</h1>
				<p className="text-textSecondary">
					Thank you for sharing your experience. Honest reviews help keep the
					ResourceX community trustworthy and safe.
				</p>
				<Link
					href="/my-bookings"
					className="inline-block mt-4 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-primaryDark transition-colors">
					Return to My Bookings
				</Link>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto space-y-8 pb-20">
			<Link
				href="/my-bookings"
				className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary hover:text-primary transition-colors">
				<ArrowLeft className="w-4 h-4" /> Back to My Bookings
			</Link>

			<div className="text-center">
				<h1 className="text-2xl font-extrabold text-textPrimary tracking-tight">
					Leave a Review
				</h1>
				<p className="text-textSecondary mt-2">
					How was your experience renting from {booking?.owner ?? "this owner"}?
				</p>
			</div>

			<div className="bg-surface border border-borderLight rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
				{error && (
					<div className="flex items-start gap-3 rounded-xl border border-error bg-errorLight/30 p-4 text-sm text-errorDark">
						<AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
						<span>{error}</span>
					</div>
				)}

				{/* Booking Info Card */}
				<div className="flex items-center gap-4 bg-surfaceVariant p-4 rounded-xl border border-borderLight">
					<img
						src={booking?.image ?? "https://placehold.co/200x150?text=Item"}
						alt={booking?.item ?? "Booking item"}
						className="w-16 h-16 rounded-lg object-cover border border-borderLight"
					/>
					<div>
						<h3 className="font-bold text-textPrimary">{booking?.item ?? "Untitled Item"}</h3>
						<p className="text-xs text-textSecondary mt-0.5">
							Rented on: {booking?.dates ?? "—"}
						</p>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Rating Section */}
					<div className="space-y-3 flex flex-col items-center">
						<label className="text-sm font-bold text-textSecondary uppercase tracking-wider block">
							Rate Your Experience
						</label>
						<div
							className="flex items-center gap-2"
							onMouseLeave={() => setHoverRating(0)}>
							{[1, 2, 3, 4, 5].map((star) => (
								<button
									key={star}
									type="button"
									onClick={() => setRating(star)}
									onMouseEnter={() => setHoverRating(star)}
									className="p-1 focus:outline-none transition-transform hover:scale-110">
									<Star
										className={`w-10 h-10 ${
											star <= (hoverRating || rating)
												? "text-warning fill-warning"
												: "text-outlineVariant"
										} transition-colors`}
									/>
								</button>
							))}
						</div>
						<div className="text-xs font-bold text-textSecondary h-4">
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
							className="text-sm font-bold text-textPrimary flex items-center gap-2">
							<MessageSquare className="w-4 h-4 text-textSecondary" />
							Written Comment
						</label>
						<textarea
							id="comment"
							rows={5}
							placeholder="Share any details about the item's condition or the owner's communication..."
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							className="w-full px-4 py-3 bg-surfaceVariant border border-borderLight rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none text-textPrimary placeholder:text-textTertiary"
							required></textarea>
						<p className="text-xs text-textTertiary text-right">
							{comment.length} / 500 characters
						</p>
					</div>

					{/* Submit Button */}
					<button
						type="submit"
						disabled={rating === 0 || !comment.trim() || submitting}
						className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primaryDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2">
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
