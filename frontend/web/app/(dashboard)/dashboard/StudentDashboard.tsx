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
					api.get<Item[]>('/items/me'),
					api.get<Booking[]>('/bookings/me'),
				]);

				if (!active) return;
				setItems(itemsRes.data ?? []);
				setBookings(bookingsRes.data ?? []);
			} catch {
				if (active) setError('Could not load your dashboard data.');
			} finally {
				if (active) setLoading(false);
			}
		}

		void loadDashboard();
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
			<div className="flex min-h-[60vh] items-center justify-center gap-3 px-4 text-center text-textSecondary">
				<Loader2 className="h-5 w-5 animate-spin" />
				<span className="text-sm font-medium sm:text-base">Loading dashboard...</span>
			</div>
		);
	}

	return (
		<div className="space-y-5 px-3 pb-20 sm:space-y-8 sm:px-0 sm:pb-0">
			{error && (
				<div className="rounded-xl border border-error/50 bg-errorLight px-5 py-4 text-sm font-semibold text-error">
					{error}
				</div>
			)}

			<div className="flex flex-col gap-4 rounded-lg border border-borderLight bg-surface p-4 shadow-sm sm:p-6 md:flex-row md:items-center md:justify-between md:gap-6">
				<div className="min-w-0">
					<h1 className="break-words text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
						Welcome back, {user?.name ?? "student"}.
					</h1>
					<p className="mt-1 text-sm text-textSecondary sm:text-base">
						Your dashboard is synced with your authenticated ResourceX account.
					</p>
				</div>

				<div className="flex w-full items-center gap-3 rounded-lg border border-borderLight bg-surfaceVariant p-3 sm:w-auto">
					<div className="shrink-0 rounded-full bg-successLight p-2">
						<ShieldCheck className="h-6 w-6 text-success" />
					</div>

					<div className="min-w-0">
						<div className="text-xs font-semibold uppercase text-textSecondary">
							Account Status
						</div>
						<div className="mt-0.5 text-sm font-bold text-success">
							{user?.status ?? "ACTIVE"}
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 sm:gap-5">
				<StatCard icon={<PackageOpen className="h-5 w-5 text-dashboardBlue" />} title="Active Rentals" value={String(activeRentals)} tint="bg-dashboardBlueTint" />
				<StatCard icon={<PlusCircle className="h-5 w-5 text-dashboardPurple" />} title="Items Listed" value={String(items.length)} tint="bg-dashboardPurpleTint" />
				<StatCard icon={<Bell className="h-5 w-5 text-dashboardYellow" />} title="Pending Requests" value={String(pendingRequests)} tint="bg-dashboardYellowTint" />
				<StatCard icon={<Star className="h-5 w-5 text-dashboardGreen" />} title="Trust Score" value={String(user?.studentProfile?.trustScore ?? 0)} tint="bg-dashboardGreenTint" />
			</div>

			<div>
				<h2 className="mb-4 text-lg font-bold text-textPrimary sm:mb-5">Quick Actions</h2>
				<div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
					<ActionCard href="/borrow" icon={<PackageSearch className="h-6 w-6 text-primary" />} bgIcon="bg-primaryLight" title="Browse Items" description="Find items to rent" />
					<ActionCard href="/my-posts/add" icon={<PlusCircle className="h-6 w-6 text-accent" />} bgIcon="bg-accentLight" title="List an Item" description="Rent out your gear" />
					<ActionCard href="/bookings" icon={<Bookmark className="h-6 w-6 text-dashboardBlue" />} bgIcon="bg-dashboardBlueTint" title="My Bookings" description="Track your rentals" />
					<ActionCard href="/my-posts" icon={<PackageOpen className="h-6 w-6 text-dashboardYellow" />} bgIcon="bg-dashboardYellowTint" title="My Posts" description="Manage listings" />
					<ActionCard href="/borrow/wishlist" icon={<HeartIcon className="h-6 w-6 text-dashboardYellow" />} bgIcon="bg-dashboardYellowTint" title="Wishlist" description="Favorite listings" />
					<ActionCard href="/history" icon={<HistoryIcon className="h-6 w-6 text-dashboardYellow" />} bgIcon="bg-dashboard" title="History" description="History" />
				</div>
			</div>

			<div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
				<EmptyAwarePanel
					title="Your Listings"
					empty="No listings found. Create your first listing."
					action={<Link href="/my-posts/add" className="text-sm font-bold text-primary hover:underline">Create listing</Link>}>
					{items.slice(0, 4).map((item) => (
						<Row key={item.itemId} title={item.title} meta={`${item.status} · ৳${item.dailyRate}/day`} />
					))}
				</EmptyAwarePanel>

				<EmptyAwarePanel
					title="Your Bookings"
					empty="No bookings available."
					action={<Link href="/borrow" className="text-sm font-bold text-primary hover:underline">Browse items</Link>}>
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
		<section className="min-w-0 overflow-hidden rounded-lg border border-borderLight bg-surface shadow-sm">
			<div className="flex flex-col gap-2 border-b border-borderLight px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
				<h2 className="font-bold text-textPrimary">{title}</h2>
				{action}
			</div>
			<div className="divide-y divide-borderLight">
				{hasRows ? children : <div className="px-4 py-6 text-sm text-textSecondary sm:px-5">{empty}</div>}
			</div>
		</section>
	);
}

function Row({ title, meta }: { title: string; meta: string }) {
	return (
		<div className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
			<div className="min-w-0 break-words font-semibold text-textPrimary">{title}</div>
			<div className="shrink-0 text-sm text-textSecondary">{meta}</div>
		</div>
	);
}