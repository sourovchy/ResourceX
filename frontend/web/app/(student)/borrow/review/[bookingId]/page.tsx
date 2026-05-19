"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star, MessageSquare, CheckCircle2 } from "lucide-react";

export default function ReviewPage({
	params,
}: {
	params: { bookingId: string };
}) {
	const [rating, setRating] = useState(0);
	const [hoverRating, setHoverRating] = useState(0);
	const [comment, setComment] = useState("");
	const [submitted, setSubmitted] = useState(false);

	// Mock booking details
	const BOOKINGS = {
		"b1": {
			item: "Sony Alpha A7III",
			owner: "Arif Hossain",
			dates: "May 10 - May 12",
			image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=200&h=150",
		},
		"b2": {
			item: "Arduino Mega 2560 Kit",
			owner: "Nusrat J.",
			dates: "May 15 - May 20",
			image: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=200&h=150",
		},
		"b3": {
			item: "Calculus Textbook Vol 2",
			owner: "Sam I.",
			dates: "Apr 1 - Apr 30",
			image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200&h=150",
		},
	};

	const booking = BOOKINGS[params.bookingId as keyof typeof BOOKINGS];

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// In a real app, send POST request to /api/reviews
		setSubmitted(true);
	};

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
					CampusVault community trustworthy and safe.
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
					How was your experience renting from {booking.owner}?
				</p>
			</div>

			<div className="bg-surface border border-borderLight rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
				{/* Booking Info Card */}
				<div className="flex items-center gap-4 bg-surfaceVariant p-4 rounded-xl border border-borderLight">
					<img
						src={booking.image}
						alt={booking.item}
						className="w-16 h-16 rounded-lg object-cover border border-borderLight"
					/>
					<div>
						<h3 className="font-bold text-textPrimary">{booking.item}</h3>
						<p className="text-xs text-textSecondary mt-0.5">
							Rented on: {booking.dates}
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
						disabled={rating === 0 || !comment.trim()}
						className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primaryDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
						Submit Review
					</button>
				</form>
			</div>
		</div>
	);
}
