"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api, { getFileUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import SafeImage from "@/components/ui/SafeImage";
import { formatShortDate } from "@/lib/dateUtils";
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
	MessageSquare,
	Tag,
} from "lucide-react";

type Item = {
	itemId: number;
	title?: string;
	category?: string | null;
	dailyRate?: number | null;
	status?: string;
	imageUrls?: string[];
};
type Booking = { bookingId: number; status: string };
type Review = {
	reviewId: number;
	rating: number;
	comment?: string;
	createdAt?: string;
	reviewer?: { name?: string };
};

// Some endpoints return Spring `Page<T>` objects (with a `content` array),
// others return a plain list. Normalise both shapes to an array.
function toList<T>(data: any): T[] {
	if (Array.isArray(data)) return data;
	if (Array.isArray(data?.content)) return data.content;
	return [];
}

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
		async function load() {
			try {
				// Resolve the current user — prefer auth context, fall back to /users/me.
				let me: any = user;
				if (!me) {
					try {
						const meRes = await api.get("/users/me");
						if (!active) return;
						me = meRes.data ?? null;
						setFallbackUser(me);
					} catch {
						// auth context may handle redirects
					}
				}

				const uid = me?.userId;
				const [itemsRes, bookingsRes, reviewsRes] = await Promise.all([
					api.get("/items/me"),
					api.get<Booking[]>("/bookings/me"),
					uid
						? api.get<Review[]>(`/reviews/reviewee/${uid}`)
						: Promise.resolve({ data: [] as Review[] }),
				]);
				if (!active) return;
				setItems(toList<Item>(itemsRes.data));
				setBookings(toList<Booking>(bookingsRes.data));
				setReviews(toList<Review>(reviewsRes.data));
			} finally {
				if (active) setLoading(false);
			}
		}

		load();
		return () => {
			active = false;
		};
	}, [user?.userId]);

	if (loading) {
		return (
			<div className="min-h-[60vh] flex items-center justify-center text-textSecondary">
				<Loader2 className="w-5 h-5 animate-spin mr-2" />
				Loading profile...
			</div>
		);
	}

	const safeItems = Array.isArray(items) ? items : [];
	const safeBookings = Array.isArray(bookings) ? bookings : [];
	const safeReviews = Array.isArray(reviews) ? reviews : [];

	const successfulReturns = safeBookings.filter(
		(booking) => booking.status === "COMPLETED",
	).length;
	const activeListings = safeItems.filter(
		(item) => item.status === "AVAILABLE",
	);
	const avgRating = safeReviews.length
		? safeReviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) /
			safeReviews.length
		: 0;

	const studentProfile =
		(user && user.studentProfile) ||
		(fallbackUser && fallbackUser.studentProfile) ||
		null;
	const displayUser = user ?? fallbackUser;
	const trustScore = studentProfile?.trustScore ?? 0;

	return (
		<div className="w-full space-y-6 px-4 pb-20 sm:px-6 lg:px-8">
			<h1 className="text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
				Profile Overview
			</h1>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="space-y-6 lg:col-span-1">
					<div className="flex flex-col items-center rounded-lg border border-borderLight bg-surface p-4 text-center shadow-sm sm:p-6">
						<div className="relative mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primaryLight text-2xl font-extrabold text-primary sm:h-24 sm:w-24 sm:text-3xl">
							{displayUser?.avatarUrl ? (
								<SafeImage
									src={getFileUrl(displayUser.avatarUrl)}
									alt={displayUser.name ?? "Profile"}
									fill
									className="object-cover"
									sizes="96px"
								/>
							) : (
								displayUser?.name?.[0] ?? "U"
							)}
							<span className="absolute bottom-0 right-0 bg-success text-white p-1 rounded-full border-2 border-surface z-10">
								<CheckCircle2 className="w-4 h-4" />
							</span>
						</div>
						<h2 className="break-words text-lg font-bold text-textPrimary sm:text-xl">
							{displayUser?.name}
						</h2>
						<p className="break-all text-sm font-medium text-textSecondary">
							Student ID: {studentProfile?.studentId ?? "N/A"}
						</p>

						{/* Quick stat row */}
						<p className="mt-2 text-xs font-semibold text-textSecondary">
							{activeListings.length} listings · {successfulReturns} rentals
							completed · {avgRating.toFixed(1)} avg rating
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
						<Link
							href="/profile/my-reviews"
							className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-primaryLight bg-primaryLight py-2.5 font-bold text-primary transition-colors hover:bg-primary hover:text-white">
							<MessageSquare className="w-4 h-4" /> My Reviews
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
							value={safeItems.length}
						/>
						<ProfileStat
							icon={<BookOpen className="w-6 h-6" />}
							label="Total Rentals"
							value={safeBookings.length}
						/>
						<ProfileStat
							icon={<CheckCircle2 className="w-6 h-6" />}
							label="Succ. Returns"
							value={successfulReturns}
						/>
						<ProfileStat
							icon={<Star className="w-6 h-6" />}
							label="Avg Rating"
							value={avgRating.toFixed(1)}
						/>
					</div>

					{/* Active listings preview */}
					<div className="space-y-4 rounded-lg border border-borderLight bg-surface p-4 sm:p-6">
						<div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<h2 className="text-lg font-bold text-textPrimary">
								My Active Listings
							</h2>
							<Link
								href="/my-posts"
								className="text-sm font-bold text-primary hover:underline">
								Manage All
							</Link>
						</div>

						{activeListings.length === 0 ? (
							<div className="py-8 text-sm text-textSecondary">
								You have no active listings yet.{" "}
								<Link
									href="/my-posts/add"
									className="font-bold text-primary hover:underline">
									Create one
								</Link>
								.
							</div>
						) : (
							<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
								{activeListings.slice(0, 4).map((item) => (
									<Link
										key={item.itemId}
										href={`/borrow/item/${item.itemId}`}
										className="group flex flex-col gap-2 overflow-hidden rounded-xl border border-borderLight bg-surface p-2 transition-all hover:border-primary/40 hover:shadow-md">
										<div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-surfaceVariant">
											{item.imageUrls?.[0] ? (
												<SafeImage
													src={item.imageUrls[0]}
													alt={item.title ?? "Listing"}
													fill
													className="object-cover transition-transform duration-300 group-hover:scale-105"
													sizes="(max-width: 640px) 45vw, 22vw"
												/>
											) : (
												<div className="flex h-full items-center justify-center">
													<Tag className="h-6 w-6 text-outlineVariant" />
												</div>
											)}
										</div>
										<p className="line-clamp-2 text-xs font-bold leading-tight text-textPrimary group-hover:text-primary">
											{item.title ?? "Untitled"}
										</p>
										{item.dailyRate != null && (
											<p className="text-[11px] font-semibold text-primary">
												৳&thinsp;{Number(item.dailyRate).toLocaleString()}/day
											</p>
										)}
									</Link>
								))}
							</div>
						)}
					</div>

					<div className="space-y-4 rounded-lg border border-borderLight bg-surface p-4 sm:p-6">
						<div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<h2 className="text-lg font-bold text-textPrimary">
								Reviews Received
							</h2>
							<Link
								href="/profile/my-reviews"
								className="text-sm font-bold text-primary hover:underline">
								View All
							</Link>
						</div>

						<div className="divide-y divide-borderLight">
							{safeReviews.length === 0 ? (
								<div className="py-8 text-sm text-textSecondary">
									No reviews received yet.
								</div>
							) : (
								safeReviews.slice(0, 3).map((review) => (
									<div key={review.reviewId} className="py-4">
										<div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
											<div className="break-words text-sm font-bold text-textPrimary">
												{review.reviewer?.name ?? "Reviewer"}
											</div>
											<div className="flex items-center gap-2 text-sm font-bold text-warning sm:justify-end">
												<span>{review.rating}/5</span>
												{review.createdAt && (
													<span className="text-xs font-medium text-textSecondary">
														{formatShortDate(review.createdAt)}
													</span>
												)}
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
	value: number | string;
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
