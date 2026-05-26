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
type Review = {
	reviewId: number;
	rating: number;
	comment?: string;
	reviewer?: { name?: string };
};

export default function ProfilePage() {
	const { user } = useAuth();

	// Fallback user data loaded directly when auth context isn't ready
	const [fallbackUser, setFallbackUser] = useState<any | null>(null);
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

		// If auth context did not populate user or studentProfile, try to fetch current user directly
		async function loadFallbackUser() {
			try {
				const res = await api.get("/users/me");
				if (!active) return;
				setFallbackUser(res.data ?? null);
			} catch (e) {
				// ignore — auth context may handle redirects
			}
		}
		loadProfileStats();
		loadFallbackUser();
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

	const successfulReturns = bookings.filter(
		(booking) => booking.status === "COMPLETED",
	).length;
	const studentProfile =
		(user && user.studentProfile) ||
		(fallbackUser && fallbackUser.studentProfile) ||
		null;
	const displayUser = user ?? fallbackUser;
	const trustScore = studentProfile?.trustScore ?? 0;

	return (
		<div className="mx-auto max-w-4xl space-y-6 px-4 pb-20 sm:px-6 lg:px-8">
			<h1 className="text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
				Profile Overview
			</h1>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="space-y-6 lg:col-span-1">
					<div className="flex flex-col items-center rounded-lg border border-borderLight bg-surface p-4 text-center shadow-sm sm:p-6">
						<div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primaryLight text-2xl font-extrabold text-primary sm:h-24 sm:w-24 sm:text-3xl">
							{displayUser?.name?.[0] ?? "U"}
							<span className="absolute bottom-0 right-0 bg-success text-white p-1 rounded-full border-2 border-surface">
								<CheckCircle2 className="w-4 h-4" />
							</span>
						</div>
						<h2 className="break-words text-lg font-bold text-textPrimary sm:text-xl">
							{displayUser?.name}
						</h2>
						<p className="break-all text-sm font-medium text-textSecondary">
							Student ID: {studentProfile?.studentId ?? "N/A"}
						</p>

						<div className="w-full border-t border-borderLight my-4" />

						<div className="flex w-full flex-col gap-3 break-words text-left text-sm text-textSecondary">
							<span className="flex items-center gap-2">
								<Mail className="w-4 h-4" /> {displayUser?.email}
							</span>
							<span className="flex items-center gap-2">
								<CalendarDays className="w-4 h-4" />{" "}
								{studentProfile?.department || "Department not set"}
							</span>
						</div>

						<Link
							href="/profile/edit"
							className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-borderLight bg-surfaceVariant py-2.5 font-bold text-textPrimary transition-colors hover:bg-borderLight">
							<Edit3 className="w-4 h-4" /> Edit Profile
						</Link>
					</div>

					<div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primaryDark to-primary p-4 text-center text-white shadow-sm sm:p-6">
						<Shield className="absolute -right-4 -top-4 w-24 h-24 opacity-10" />
						<div className="mb-2 text-xs font-bold uppercase tracking-wider opacity-90 sm:text-sm">
							Trust Score
						</div>
						<div className="mb-1 text-4xl font-extrabold leading-none sm:text-5xl">
							{trustScore}
						</div>
						<div className="mt-3 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm sm:text-sm">
							{user?.status ?? "ACTIVE"}
						</div>
					</div>
				</div>

				<div className="space-y-6 lg:col-span-2">
					<h2 className="text-lg font-bold text-textPrimary">Stats Summary</h2>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<ProfileStat
							icon={<Package className="w-6 h-6" />}
							label="Items Listed"
							value={items.length}
						/>
						<ProfileStat
							icon={<BookOpen className="w-6 h-6" />}
							label="Total Rentals"
							value={bookings.length}
						/>
						<ProfileStat
							icon={<CheckCircle2 className="w-6 h-6" />}
							label="Succ. Returns"
							value={successfulReturns}
						/>
						<ProfileStat
							icon={<Star className="w-6 h-6" />}
							label="Reviews Rcvd"
							value={reviews.length}
						/>
					</div>

					<div className="space-y-4 rounded-lg border border-borderLight bg-surface p-4 sm:p-6">
						<div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<h2 className="text-lg font-bold text-textPrimary">
								Recent Reviews
							</h2>
							<Link
								href="/profile/my-reviews"
								className="text-sm font-bold text-primary hover:underline">
								View All
							</Link>
						</div>

						<div className="divide-y divide-borderLight">
							{reviews.length === 0 ? (
								<div className="py-8 text-sm text-textSecondary">
									No reviews available.
								</div>
							) : (
								reviews.slice(0, 3).map((review) => (
									<div key={review.reviewId} className="py-4">
										<div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
											<div className="break-words text-sm font-bold text-textPrimary">
												{review.reviewer?.name ?? "Reviewer"}
											</div>
											<div className="text-sm font-bold text-warning sm:text-right">
												{review.rating}/5
											</div>
										</div>
										<p className="break-words text-sm text-textSecondary">
											{review.comment || "No comment provided."}
										</p>
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

function ProfileStat({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: number;
}) {
	return (
		<div className="flex items-center gap-4 rounded-lg border border-borderLight bg-surface p-4 sm:p-5">
			<div className="w-12 h-12 bg-primaryLight text-primary rounded-xl flex items-center justify-center shrink-0">
				{icon}
			</div>
			<div>
				<div className="text-xl font-extrabold text-textPrimary sm:text-2xl">{value}</div>
				<div className="text-xs font-bold text-textSecondary uppercase tracking-wider">
					{label}
				</div>
			</div>
		</div>
	);
}
