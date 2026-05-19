"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star, MessageSquare } from "lucide-react";

const RECEIVED_REVIEWS = [
	{
		id: "r1",
		item: "Sony Alpha A7III",
		role: "Received as Owner",
		reviewer: "Nusrat J.",
		rating: 5,
		date: "May 2, 2024",
		comment:
			"Excellent camera, handled perfectly. Arif was very helpful in explaining the menu settings!",
	},
	{
		id: "r2",
		item: "DJI Mavic Air 2 Drone",
		role: "Received as Renter",
		reviewer: "Tanvir A.",
		rating: 4,
		date: "April 15, 2024",
		comment: "Returned on time and in good condition.",
	},
];

const GIVEN_REVIEWS = [
	{
		id: "g1",
		item: "Calculus Textbook Vol 2",
		role: "Given to Owner",
		reviewee: "Sam I.",
		rating: 5,
		date: "March 10, 2024",
		comment: "Saved my life mid-terms! Great guy, fast replies.",
	},
];

export default function MyReviewsPage() {
	const [tab, setTab] = useState("received");

	const reviews = tab === "received" ? RECEIVED_REVIEWS : GIVEN_REVIEWS;

	return (
		<div className="max-w-4xl mx-auto space-y-6 pb-20">
			<Link
				href="/profile"
				className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary hover:text-primary transition-colors">
				<ArrowLeft className="w-4 h-4" /> Back to Profile
			</Link>

			<h1 className="text-2xl font-bold text-textPrimary tracking-tight">
				My Reviews
			</h1>

			<div className="flex border-b border-borderLight h-12">
				<button
					onClick={() => setTab("received")}
					className={`px-4 sm:px-8 text-sm font-bold transition-colors ${tab === "received" ? "border-b-2 border-primary text-primary" : "text-textSecondary hover:text-textPrimary"}`}>
					Received ({RECEIVED_REVIEWS.length})
				</button>
				<button
					onClick={() => setTab("given")}
					className={`px-4 sm:px-8 text-sm font-bold transition-colors ${tab === "given" ? "border-b-2 border-primary text-primary" : "text-textSecondary hover:text-textPrimary"}`}>
					Given ({GIVEN_REVIEWS.length})
				</button>
			</div>

			<div className="space-y-4 pt-2">
				{reviews.map((r) => (
					<div
						key={r.id}
						className="bg-surface border border-borderLight rounded-2xl p-6 shadow-sm">
						<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-borderLight pb-4 mb-4">
							<div>
								<h3 className="font-bold text-textPrimary">{r.item}</h3>
								<div className="text-xs font-semibold text-textSecondary mt-1">
									{r.role} • {r.date}
								</div>
							</div>
							<div className="flex items-center gap-1">
								{Array.from({ length: 5 }).map((_, i) => (
									<Star
										key={i}
										className={`w-4 h-4 ${i < r.rating ? "text-warning fill-warning" : "text-outlineVariant"}`}
									/>
								))}
							</div>
						</div>

						<div className="flex items-start gap-3">
							<div className="w-8 h-8 rounded-full bg-primaryLight text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
								{tab === "received"
									? (r as any).reviewer.charAt(0)
									: (r as any).reviewee.charAt(0)}
							</div>
							<div>
								<div className="text-sm font-bold text-textPrimary mb-1">
									{tab === "received"
										? (r as any).reviewer
										: (r as any).reviewee}
								</div>
								<p className="text-sm text-textSecondary flex items-start gap-2">
									<MessageSquare className="w-4 h-4 shrink-0 mt-0.5 opacity-50" />
									{r.comment}
								</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
