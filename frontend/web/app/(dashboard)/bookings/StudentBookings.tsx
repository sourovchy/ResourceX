"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SafeImage from "@/components/ui/SafeImage";
import { Card } from "@/components/ui/Card";
import { AlertTriangle, ArrowRight, CalendarX, Clock, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/context/ToastContext";
import { formatDateRange } from "@/lib/dateUtils";
import { extractErrorMessage } from "@/lib/errorUtils";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { Skeleton } from "@/components/ui/Skeleton";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageEmpty } from "@/components/ui/PageEmpty";
import BookingCard from "@/components/cards/BookingCard";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/context/AuthContext";
import { reviewService } from "@/lib/services/reviewService";
import { ReviewModal } from "@/components/review/ReviewModal";

const TABS = ["All", "Pending", "Approved", "Completed", "Rejected"] as const;
type Tab = (typeof TABS)[number];

export default function StudentBookings() {
	const { toast } = useToast();
	const { user } = useAuth();
	const [bookings, setBookings] = useState<any[]>([]);
	const [reviewedBookingIds, setReviewedBookingIds] = useState<Set<number>>(new Set());
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<Tab>("All");
	const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");
	const [actionLoading, setActionLoading] = useState<number | null>(null);
	const [cancelTarget, setCancelTarget] = useState<number | null>(null);
	
	const [reviewModalOpen, setReviewModalOpen] = useState(false);
	const [selectedBookingForReview, setSelectedBookingForReview] = useState<any>(null);

	const load = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await api.get("/bookings/me");
			setBookings(Array.isArray(res.data) ? res.data : []);

			if (user) {
				const userReviews = await reviewService.getReviewsByReviewerId(user.userId);
				setReviewedBookingIds(new Set(userReviews.map((r) => r.bookingId)));
			}
		} catch (err) {
			setError(extractErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	// We only want to reload when auto refresh tells us to
	useEffect(() => {
		if (user) {
			load();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	// Reflect owner approvals/rejections when returning to the tab
	useAutoRefresh(load, { intervalMs: 60_000 });

	const filteredAndSorted = useMemo(() => {
		let result = bookings;
		if (activeTab !== "All") {
			const key = activeTab.toUpperCase();
			result = bookings.filter((b) => b.status === key);
		}
		
		return result.sort((a, b) => {
			const dateA = new Date(a.endDate || a.startDate || a.createdAt || 0);
			const dateB = new Date(b.endDate || b.startDate || b.createdAt || 0);
			return sortBy === "recent"
				? dateB.getTime() - dateA.getTime()
				: dateA.getTime() - dateB.getTime();
		});
	}, [bookings, activeTab, sortBy]);

	const stats = useMemo(() => {
		let completed = 0, rejected = 0;
		for (const b of bookings) {
			const s = (b.status || "").toUpperCase();
			if (s === "COMPLETED") completed++;
			if (s === "REJECTED") rejected++;
		}
		return { completed, rejected };
	}, [bookings]);

	const cancelBooking = async (bookingId: number) => {
		setCancelTarget(null);
		setActionLoading(bookingId);
		try {
			await api.patch(`/bookings/${bookingId}/cancel`);
			await load();
			toast("Booking request cancelled.");
		} catch (err) {
			toast(extractErrorMessage(err), "error");
		} finally {
			setActionLoading(null);
		}
	};

	if (loading) {
		return (
			<div className="mx-auto max-w-4xl space-y-5 px-3 pb-6 sm:space-y-6 sm:px-0">
				<Skeleton className="h-7 w-40" />
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-5">
					{Array.from({ length: 8 }).map((_, i) => (
						<Card key={i} padding="none" className="flex flex-col overflow-hidden">
							<Skeleton className="aspect-[4/3] w-full shrink-0" />
							<div className="flex-1 space-y-3 p-3 sm:p-4">
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-3 w-1/2" />
								<Skeleton className="h-3 w-full" />
							</div>
						</Card>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="w-full space-y-6 sm:space-y-8 px-3 pb-6 sm:px-0 sm:pb-0">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div className="min-w-0">
					<h2 className="mt-1 text-3xl font-bold tracking-tighter text-textPrimary sm:text-5xl">
						My <span className="text-gradient-brand italic">Bookings.</span>
					</h2>
					<div className="mt-3 flex flex-wrap gap-4 text-sm text-textSecondary">
						<span>Completed Rentals: <strong className="text-textPrimary">{stats.completed}</strong></span>
						<span>Rejected Requests: <strong className="text-textPrimary">{stats.rejected}</strong></span>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="relative z-50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="w-full sm:w-48 shrink-0">
					<Select
						value={activeTab}
						onChange={(val) => setActiveTab(val as Tab)}
						options={TABS.map((tab) => ({
							value: tab,
							label: tab === "All" ? "All Statuses" : tab,
						}))}
						placeholder="All Statuses"
					/>
				</div>

				<div className="w-full sm:w-48 shrink-0">
					<Select
						value={sortBy}
						onChange={(val) => setSortBy(val as "recent" | "oldest")}
						options={[
							{ value: "recent", label: "Most Recent" },
							{ value: "oldest", label: "Oldest First" },
						]}
					/>
				</div>
			</div>

			{error && (
				<div className="flex items-start gap-3 rounded-xl border border-error bg-errorLight/30 px-4 py-3 text-sm text-errorDark">
					<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
					{error}
				</div>
			)}

			{filteredAndSorted.length === 0 && !error && (
				<PageEmpty
					icon={CalendarX}
					title={activeTab === "All" ? "No bookings yet" : `No ${activeTab.toLowerCase()} bookings`}
					description={
						activeTab === "All"
							? "Your booking requests will appear here once you reserve an item."
							: "Try a different status filter to see your other bookings."
					}
				/>
			)}

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-5 pb-2 stagger-children">
				{filteredAndSorted.map((booking) => (
					<BookingCard
						key={booking.bookingId}
						booking={booking}
						isProcessing={actionLoading === booking.bookingId}
						reviewed={reviewedBookingIds.has(booking.bookingId)}
						onCancel={setCancelTarget}
						onLeaveReview={(b) => {
							setSelectedBookingForReview(b);
							setReviewModalOpen(true);
						}}
					/>
				))}
			</div>

			<ConfirmModal
				isOpen={cancelTarget !== null}
				title="Cancel Booking Request"
				message="Are you sure you want to cancel this booking request? This action cannot be undone."
				confirmText="Yes, Cancel"
				cancelText="Keep Booking"
				isDestructive
				onConfirm={() => cancelTarget !== null && cancelBooking(cancelTarget)}
				onCancel={() => setCancelTarget(null)}
			/>

			{selectedBookingForReview && (
				<ReviewModal
					isOpen={reviewModalOpen}
					onClose={() => {
						setReviewModalOpen(false);
						setTimeout(() => setSelectedBookingForReview(null), 300);
					}}
					bookingId={selectedBookingForReview.bookingId}
					itemTitle={selectedBookingForReview.item?.title ?? "Unknown Item"}
					itemImageUrl={selectedBookingForReview.item?.imageUrls?.[0] ?? null}
					onSuccess={() => {
						setReviewedBookingIds(prev => new Set(prev).add(selectedBookingForReview.bookingId));
					}}
				/>
			)}
		</div>
	);
}
