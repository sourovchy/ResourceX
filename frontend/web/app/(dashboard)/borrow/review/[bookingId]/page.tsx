"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { Star, MessageSquare, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import api from "@/lib/api";
import { extractErrorMessage } from "@/lib/errorUtils";
import { formatDateRange } from "@/lib/dateUtils";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type BookingSummary = {
	bookingId: number;
	itemTitle: string;
	itemImage: string | null;
	ownerName: string;
	startDate: string;
	endDate: string;
};

const RATING_LABELS: Record<number, string> = {
	1: "Poor",
	2: "Fair",
	3: "Good",
	4: "Very Good",
	5: "Excellent",
};

export default function ReviewPage({ params }: { params: { bookingId: string } }) {
	const [booking, setBooking] = useState<BookingSummary | null>(null);
	const [fetchLoading, setFetchLoading] = useState(true);
	const [fetchError, setFetchError] = useState<string | null>(null);

	const [rating, setRating] = useState(0);
	const [hoverRating, setHoverRating] = useState(0);
	const [comment, setComment] = useState("");

	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [submitted, setSubmitted] = useState(false);

	// Fetch the booking to display context
	useEffect(() => {
		let active = true;
		setFetchLoading(true);
		setFetchError(null);

		api.get(`/bookings/${params.bookingId}`)
			.then((res) => {
				if (!active) return;
				const raw = res.data;
				setBooking({
					bookingId: raw.bookingId,
					itemTitle: raw.item?.title ?? "Untitled Item",
					itemImage: raw.item?.imageUrls?.[0] ?? null,
					ownerName: raw.item?.owner?.name ?? "Item Owner",
					startDate: raw.startDate,
					endDate: raw.endDate,
				});
			})
			.catch((err) => {
				if (!active) return;
				setFetchError(extractErrorMessage(err));
			})
			.finally(() => {
				if (active) setFetchLoading(false);
			});

		return () => { active = false; };
	}, [params.bookingId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitError(null);

		if (rating === 0) {
			setSubmitError("Please select a rating.");
			return;
		}
		if (!comment.trim()) {
			setSubmitError("Please write a comment.");
			return;
		}

		setSubmitting(true);
		try {
			await api.post("/reviews", {
				bookingId: Number(params.bookingId),
				rating,
				comment: comment.trim(),
			});
			setSubmitted(true);
		} catch (err) {
			setSubmitError(extractErrorMessage(err));
		} finally {
			setSubmitting(false);
		}
	};

	// ── Loading ──────────────────────────────────────────────────────────────
	if (fetchLoading) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
				<p className="text-sm text-textSecondary">Loading booking details…</p>
			</div>
		);
	}

	if (fetchError) {
		return (
			<div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
				<AlertTriangle className="mb-3 h-10 w-10 text-error" />
				<h1 className="text-xl font-bold text-textPrimary">Booking not found</h1>
				<p className="mt-2 text-sm text-textSecondary">{fetchError}</p>
				<Link
					href="/bookings"
					className="mt-6 inline-flex items-center justify-center rounded-full font-bold italic transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-primary text-onPrimary hover:bg-primaryDark focus-visible:ring-primary/40 shadow-sm px-6 py-3 text-sm gap-2">
					My Bookings
				</Link>
			</div>
		);
	}

	// ── Success ──────────────────────────────────────────────────────────────
	if (submitted) {
		return (
			<div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
				<CheckCircle2 className="mb-4 h-14 w-14 text-success" />
				<h1 className="text-2xl font-bold text-textPrimary">Review Submitted!</h1>
				<p className="mt-2 max-w-md text-sm text-textSecondary">
					Thank you for sharing your experience. Honest reviews help keep the
					ResourceX community safe.
				</p>
				<Link
					href="/bookings"
					className="mt-6 inline-flex items-center justify-center rounded-full font-bold italic transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-primary text-onPrimary hover:bg-primaryDark focus-visible:ring-primary/40 shadow-sm px-6 py-3 text-sm gap-2">
					Back to My Bookings
				</Link>
			</div>
		);
	}

	// ── Form ─────────────────────────────────────────────────────────────────
	return (
		<div className="w-full space-y-6 px-3 pb-20 sm:space-y-8 sm:px-0">
			<div className="mb-2">
				<p className="text-xs font-bold uppercase tracking-[0.2em] text-textTertiary">
				{"// Transaction Feedback"}
			</p>
				<h1 className="mt-1 text-3xl font-normal italic leading-tight text-textPrimary sm:text-4xl">
					Leave a <span className="text-primary italic font-bold">Review.</span>
				</h1>
			</div>

			<div className="text-center sm:text-left">
				<p className="text-sm text-textSecondary font-medium">
					How was your experience renting from{" "}
					<strong className="text-textPrimary">{booking?.ownerName}</strong>?
				</p>
			</div>

			<div className="space-y-6 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6 md:p-8">
				{/* Booking context */}
				<div className="flex items-center gap-4 rounded-xl border border-borderLight bg-surfaceVariant p-4">
					<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-borderLight bg-surface">
						<SafeImage
							src={booking?.itemImage ?? null}
							alt={booking?.itemTitle ?? "Item"}
							fill
							className="object-cover"
							sizes="64px"
						/>
					</div>
					<div className="min-w-0">
						<h3 className="font-bold text-textPrimary">{booking?.itemTitle}</h3>
						{booking?.startDate && booking?.endDate && (
							<p className="mt-0.5 text-xs text-textSecondary font-mono">
								{formatDateRange(booking.startDate, booking.endDate)}
							</p>
						)}
					</div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					{submitError && (
						<div className="flex items-start gap-3 rounded-xl border border-error bg-errorLight/30 p-4 text-sm text-errorDark">
							<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
							<span>{submitError}</span>
						</div>
					)}

					{/* Star rating */}
					<div className="flex flex-col items-center gap-3">
						<label className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
							Rate Your Experience
						</label>
						<div
							className="flex items-center gap-1 sm:gap-2"
							onMouseLeave={() => setHoverRating(0)}>
							{[1, 2, 3, 4, 5].map((star) => (
								<button
									key={star}
									type="button"
									onClick={() => setRating(star)}
									onMouseEnter={() => setHoverRating(star)}
									className="rounded-full p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
									<Star
										className={`h-9 w-9 transition-colors sm:h-10 sm:w-10 ${
											star <= (hoverRating || rating)
												? "fill-warning text-warning"
												: "text-outlineVariant"
										}`}
									/>
								</button>
							))}
						</div>
						<span className="h-4 text-xs font-bold text-textSecondary uppercase tracking-wider">
							{RATING_LABELS[hoverRating || rating] ?? ""}
						</span>
					</div>

					{/* Comment */}
					<div className="space-y-1.5">
						<label
							htmlFor="comment"
							className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
							<MessageSquare className="h-3.5 w-3.5" />
							Comment
						</label>
						<textarea
							id="comment"
							rows={5}
							maxLength={1000}
							placeholder="Share details about the item's condition or the owner's communication…"
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							className="w-full resize-none rounded-xl border border-borderLight bg-card px-4 py-3 text-sm text-textPrimary placeholder-textSecondary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
						/>
						<p className="text-right text-xs text-textSecondary font-mono">
							{comment.length}/1000
						</p>
					</div>

					<Button
						type="submit"
						disabled={rating === 0 || !comment.trim() || submitting}
						loading={submitting}
						variant="primary"
						size="lg"
						fullWidth
					>
						Submit Review
					</Button>
				</form>
			</div>
		</div>
	);
}
