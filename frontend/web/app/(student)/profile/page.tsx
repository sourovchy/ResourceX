"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
	Mail,
	CalendarDays,
	Shield,
	Star,
	Edit3,
	Package,
	BookOpen,
	CheckCircle2,
	Loader2,
} from "lucide-react";

type Item = { itemId: number };
type Booking = { bookingId: number; status: string };
type Review = { reviewId: number; rating: number; comment?: string; reviewer?: { name?: string } };

export default function ProfilePage() {
	const { user } = useAuth();
	const [items, setItems] = useState<Item[]>([]);
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let active = true;
		async function loadProfileStats() {
			try {
				const [itemsRes, bookingsRes, reviewsRes] = await Promise.all([
					api.get<Item[]>("/items/me"),
					api.get<Booking[]>("/bookings/me"),
					api.get<Review[]>("/reviews"),
				]);
				if (!active) return;
				setItems(itemsRes.data ?? []);
				setBookings(bookingsRes.data ?? []);
				setReviews(reviewsRes.data ?? []);
			} finally {
				if (active) setLoading(false);
			}
		}
		loadProfileStats();
		return () => {
			active = false;
		};
	}, []);

	if (loading) {
		return (
			<div className="min-h-[60vh] flex items-center justify-center text-textSecondary">
				<Loader2 className="w-5 h-5 animate-spin mr-2" />
				Loading profile...
			</div>
		);
	}

	const successfulReturns = bookings.filter((booking) => booking.status === "COMPLETED").length;
	const trustScore = user?.trustScore ?? 0;

	return (
		<div className="max-w-4xl mx-auto space-y-6 pb-20">
			<h1 className="text-2xl font-bold text-textPrimary tracking-tight">Profile Overview</h1>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="md:col-span-1 space-y-6">
					<div className="bg-surface border border-borderLight rounded-lg p-6 shadow-sm flex flex-col items-center text-center">
						<div className="w-24 h-24 bg-primaryLight text-primary rounded-full flex items-center justify-center font-extrabold text-3xl mb-4 relative">
							{user?.name?.[0] ?? "U"}
							<span className="absolute bottom-0 right-0 bg-success text-white p-1 rounded-full border-2 border-surface">
								<CheckCircle2 className="w-4 h-4" />
							</span>
						</div>
						<h2 className="text-xl font-bold text-textPrimary">{user?.name}</h2>
						<p className="text-sm text-textSecondary font-medium">Student ID: {user?.studentId}</p>

						<div className="w-full border-t border-borderLight my-4" />

						<div className="flex flex-col gap-3 w-full text-sm text-textSecondary justify-start text-left">
							<span className="flex items-center gap-2">
								<Mail className="w-4 h-4" /> {user?.email}
							</span>
							<span className="flex items-center gap-2">
								<CalendarDays className="w-4 h-4" /> {user?.department || "Department not set"}
							</span>
						</div>

						<Link href="/profile/edit" className="w-full mt-6 py-2.5 bg-surfaceVariant text-textPrimary border border-borderLight rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-borderLight transition-colors">
							<Edit3 className="w-4 h-4" /> Edit Profile
						</Link>
					</div>

					<div className="bg-gradient-to-br from-primaryDark to-primary p-6 rounded-lg shadow-sm text-white flex flex-col items-center text-center relative overflow-hidden">
						<Shield className="absolute -right-4 -top-4 w-24 h-24 opacity-10" />
						<div className="text-sm font-bold uppercase tracking-wider mb-2 opacity-90">Trust Score</div>
						<div className="text-5xl font-extrabold leading-none mb-1">{trustScore}</div>
						<div className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm mt-3">
							{user?.status ?? "ACTIVE"}
						</div>
					</div>
				</div>

				<div className="md:col-span-2 space-y-6">
					<h2 className="text-lg font-bold text-textPrimary">Stats Summary</h2>
					<div className="grid grid-cols-2 gap-4">
						<ProfileStat icon={<Package className="w-6 h-6" />} label="Items Listed" value={items.length} />
						<ProfileStat icon={<BookOpen className="w-6 h-6" />} label="Total Rentals" value={bookings.length} />
						<ProfileStat icon={<CheckCircle2 className="w-6 h-6" />} label="Succ. Returns" value={successfulReturns} />
						<ProfileStat icon={<Star className="w-6 h-6" />} label="Reviews Rcvd" value={reviews.length} />
					</div>

					<div className="bg-surface border border-borderLight rounded-lg p-6 space-y-4">
						<div className="flex justify-between items-center mb-2">
							<h2 className="text-lg font-bold text-textPrimary">Recent Reviews</h2>
							<Link href="/profile/my-reviews" className="text-sm font-bold text-primary hover:underline">View All</Link>
						</div>

						<div className="divide-y divide-borderLight">
							{reviews.length === 0 ? (
								<div className="py-8 text-sm text-textSecondary">No reviews available.</div>
							) : (
								reviews.slice(0, 3).map((review) => (
									<div key={review.reviewId} className="py-4">
										<div className="flex items-center justify-between mb-2">
											<div className="font-bold text-textPrimary text-sm">{review.reviewer?.name ?? "Reviewer"}</div>
											<div className="text-sm font-bold text-warning">{review.rating}/5</div>
										</div>
										<p className="text-sm text-textSecondary">{review.comment || "No comment provided."}</p>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function ProfileStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
	return (
		<div className="bg-surface border border-borderLight p-5 rounded-lg flex items-center gap-4">
			<div className="w-12 h-12 bg-primaryLight text-primary rounded-xl flex items-center justify-center shrink-0">{icon}</div>
			<div>
				<div className="text-2xl font-extrabold text-textPrimary">{value}</div>
				<div className="text-xs font-bold text-textSecondary uppercase tracking-wider">{label}</div>
			</div>
		</div>
	);
}
