"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ProfileHeaderCard } from "@/components/profile/ProfileHeaderCard";
import TrustBadge from "@/components/TrustBadge";
import { PageLoader } from "@/components/ui/PageLoader";
import TrustSummaryCard from "@/components/TrustSummaryCard";
import { TiltCard } from "@/components/ui/TiltCard";
import { formatShortDate } from "@/lib/dateUtils";
import {
	Mail,
	CalendarDays,
	Star,
	Edit3,
	Package,
	BookOpen,
	CheckCircle2,
	MessageSquare,
	AlertTriangle,
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
		// Refetch only when the signed-in user identity changes, not on every
		// auth-context object refresh.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.userId]);

	if (loading) {
		return <PageLoader message="Loading profile..." />;
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

	return (
		<div className="w-full space-y-6 px-4 pb-20 sm:px-6 lg:px-8">
			<div>
				<h2 className="mt-1 text-3xl font-bold tracking-tighter text-textPrimary sm:text-5xl">
					My <span className="text-gradient-brand italic">Profile.</span>
				</h2>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="space-y-6 lg:col-span-3">
					<ProfileHeaderCard
						avatarUrl={displayUser?.avatarUrl}
						initials={displayUser?.name?.[0] ?? "U"}
						avatarBadge={<CheckCircle2 className="w-5 h-5" />}
						avatarBgClass="bg-primaryLight text-primary [&>span]:bg-success [&>span]:text-white"
						name={displayUser?.name ?? "Student"}
						infoRows={[
							{ text: `Student ID: ${studentProfile?.studentId ?? "N/A"}` },
							{ icon: <Mail className="w-4 h-4" />, text: displayUser?.email },
							{ icon: <CalendarDays className="w-4 h-4" />, text: studentProfile?.department || "Department not set" }
						]}
						actions={
							<Link
								href="/profile/edit"
								className="inline-flex items-center justify-center gap-2 rounded-full bg-surfaceVariant px-6 py-2.5 font-bold text-textPrimary shadow-sm transition-all hover:-translate-y-0.5 hover:bg-borderLight hover:shadow-md"
							>
								<Edit3 className="w-4 h-4" /> Edit Profile
							</Link>
						}
					/>

					<TrustSummaryCard />
				</div>

				<div className="space-y-6 lg:col-span-3">
					<TiltCard
						maxTilt={3}
						glare={true}
						className="rounded-2xl border border-borderLight bg-surface p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md"
					>
						<div className="mb-5 flex items-center justify-between">
							<h2 className="flex items-center gap-2 text-base font-bold tracking-tight text-textPrimary">
								<Package className="h-5 w-5 text-primary" />
								<span>Marketplace Activity &amp; Statistics</span>
							</h2>
						</div>

						<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
							<ProfileStat
								label="Items Listed"
								value={safeItems.length}
								icon={<Package className="h-4 w-4" />}
							/>
							<ProfileStat
								label="Active Listings"
								value={activeListings.length}
								valueClass="text-primary"
								icon={<BookOpen className="h-4 w-4" />}
							/>
							<ProfileStat
								label="Completed Rentals"
								value={successfulReturns}
								icon={<CheckCircle2 className="h-4 w-4" />}
							/>
							<ProfileStat
								label="Reviews Received"
								value={safeReviews.length}
								icon={<MessageSquare className="h-4 w-4" />}
							/>
							<ProfileStat
								label="Average Rating"
								value={safeReviews.length > 0 ? avgRating.toFixed(1) : "N/A"}
								valueClass="text-amber-500"
								icon={<Star className="h-4 w-4" />}
							/>
							<ProfileStat
								label="Member Since"
								value={
									displayUser?.createdAt
										? formatShortDate(displayUser.createdAt)
										: "N/A"
								}
								valueSize="text-xl"
								icon={<CalendarDays className="h-4 w-4" />}
							/>
						</div>
					</TiltCard>
				</div>
			</div>
		</div>
	);
}

function ProfileStat({
	label,
	value,
	icon,
	valueClass = "text-textPrimary",
	valueSize = "text-2xl",
}: {
	label: string;
	value: number | string;
	icon?: React.ReactNode;
	valueClass?: string;
	valueSize?: string;
}) {
	return (
		<TiltCard
			maxTilt={5}
			glare={true}
			className="group rounded-2xl border border-borderLight bg-surfaceVariant p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-md"
		>
			<div className="flex items-center justify-between">
				<span className="block text-[10px] font-bold uppercase tracking-wider text-textSecondary">
					{label}
				</span>

				{icon && (
					<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
						{icon}
					</div>
				)}
			</div>

			<div
				className={`mt-3 ${valueSize} font-extrabold tracking-tight ${valueClass}`}>
				{value}
			</div>
		</TiltCard>
	);
}
