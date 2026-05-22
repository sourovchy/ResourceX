"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/cards/StatCard";
import ActionCard from "@/components/cards/ActionCard";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
	ShieldCheck,
	PackageSearch,
	PlusCircle,
	Bookmark,
	PackageOpen,
	Bell,
	Star,
	HeartIcon,
	HistoryIcon,
	Loader2,
} from "lucide-react";

type Item = { itemId: number; title: string; dailyRate: number; status: string };
type Booking = { bookingId: number; status: string; item?: Item };

export default function StudentDashboard() {
	const { user } = useAuth();
	const [items, setItems] = useState<Item[]>([]);
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let active = true;

		async function loadDashboard() {
			try {
				const [itemsRes, bookingsRes] = await Promise.all([
					api.get<Item[]>("/items/me"),
					api.get<Booking[]>("/bookings/me"),
				]);

				if (!active) return;
				setItems(itemsRes.data ?? []);
				setBookings(bookingsRes.data ?? []);
			} catch {
				if (active) setError("Could not load your dashboard data.");
			} finally {
				if (active) setLoading(false);
			}
		}

		loadDashboard();
		return () => {
			active = false;
		};
	}, []);

	const activeRentals = useMemo(
		() => bookings.filter((booking) => ["APPROVED", "ACTIVE"].includes(booking.status)).length,
		[bookings],
	);
	const pendingRequests = useMemo(
		() => bookings.filter((booking) => booking.status === "PENDING").length,
		[bookings],
	);

	if (loading) {
		return (
			<div className="min-h-[60vh] flex items-center justify-center text-textSecondary">
				<Loader2 className="w-5 h-5 animate-spin mr-2" />
				Loading dashboard...
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{error && (
				<div className="bg-errorLight border border-error/50 text-error px-5 py-4 rounded-xl text-sm font-semibold">
					{error}
				</div>
			)}

			<div className="bg-surface border border-borderLight rounded-lg p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary tracking-tight">
						Welcome back, {user?.name ?? "student"}.
					</h1>
					<p className="text-textSecondary mt-1">
						Your dashboard is synced with your authenticated ResourceX account.
					</p>
				</div>
				<div className="flex items-center gap-4 bg-surfaceVariant p-3 rounded-lg border border-borderLight">
					<div className="bg-successLight p-2 rounded-full">
						<ShieldCheck className="w-6 h-6 text-success" />
					</div>
					<div>
						<div className="text-xs font-semibold text-textSecondary uppercase">
							Account Status
						</div>
						<div className="text-sm font-bold text-success mt-0.5">
							{user?.status ?? "ACTIVE"}
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
				<StatCard icon={<PackageOpen className="w-5 h-5 text-dashboardBlue" />} title="Active Rentals" value={String(activeRentals)} tint="bg-dashboardBlueTint" />
				<StatCard icon={<PlusCircle className="w-5 h-5 text-dashboardPurple" />} title="Items Listed" value={String(items.length)} tint="bg-dashboardPurpleTint" />
				<StatCard icon={<Bell className="w-5 h-5 text-dashboardYellow" />} title="Pending Requests" value={String(pendingRequests)} tint="bg-dashboardYellowTint" />
				<StatCard icon={<Star className="w-5 h-5 text-dashboardGreen" />} title="Trust Score" value={String(user?.studentProfile?.trustScore ?? 0)} tint="bg-dashboardGreenTint" />
			</div>

			<div>
				<h2 className="text-lg font-bold text-textPrimary mb-5">Quick Actions</h2>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-5">
					<ActionCard href="/borrow" icon={<PackageSearch className="w-6 h-6 text-primary" />} bgIcon="bg-primaryLight" title="Browse Items" description="Find items to rent" />
					<ActionCard href="/my-posts/add" icon={<PlusCircle className="w-6 h-6 text-accent" />} bgIcon="bg-accentLight" title="List an Item" description="Rent out your gear" />
					<ActionCard href="/my-bookings" icon={<Bookmark className="w-6 h-6 text-dashboardBlue" />} bgIcon="bg-dashboardBlueTint" title="My Bookings" description="Track your rentals" />
					<ActionCard href="/my-posts" icon={<PackageOpen className="w-6 h-6 text-dashboardYellow" />} bgIcon="bg-dashboardYellowTint" title="My Posts" description="Manage listings" />
					<ActionCard href="/borrow/wishlist" icon={<HeartIcon className="w-6 h-6 text-dashboardYellow" />} bgIcon="bg-dashboardYellowTint" title="Wishlist" description="Favorite listings" />
					<ActionCard href="/history" icon={<HistoryIcon className="w-6 h-6 text-dashboardYellow" />} bgIcon="bg-dashboard" title="History" description="History" />
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<EmptyAwarePanel
					title="Your Listings"
					empty="No listings found. Create your first listing."
					action={<Link href="/my-posts/add" className="text-sm font-bold text-primary">Create listing</Link>}>
					{items.slice(0, 4).map((item) => (
						<Row key={item.itemId} title={item.title} meta={`${item.status} · ৳${item.dailyRate}/day`} />
					))}
				</EmptyAwarePanel>

				<EmptyAwarePanel
					title="Your Bookings"
					empty="No bookings available."
					action={<Link href="/borrow" className="text-sm font-bold text-primary">Browse items</Link>}>
					{bookings.slice(0, 4).map((booking) => (
						<Row key={booking.bookingId} title={booking.item?.title ?? `Booking #${booking.bookingId}`} meta={booking.status} />
					))}
				</EmptyAwarePanel>
			</div>
		</div>
	);
}

function EmptyAwarePanel({
	title,
	empty,
	action,
	children,
}: {
	title: string;
	empty: string;
	action: React.ReactNode;
	children: React.ReactNode[];
}) {
	const hasRows = React.Children.count(children) > 0;

	return (
		<section className="bg-surface border border-borderLight rounded-lg shadow-sm overflow-hidden">
			<div className="px-5 py-4 border-b border-borderLight flex items-center justify-between">
				<h2 className="font-bold text-textPrimary">{title}</h2>
				{action}
			</div>
			<div className="divide-y divide-borderLight">
				{hasRows ? children : <div className="p-6 text-sm text-textSecondary">{empty}</div>}
			</div>
		</section>
	);
}

function Row({ title, meta }: { title: string; meta: string }) {
	return (
		<div className="px-5 py-4 flex items-center justify-between gap-4">
			<div className="font-semibold text-textPrimary truncate">{title}</div>
			<div className="text-sm text-textSecondary shrink-0">{meta}</div>
		</div>
	);
}
