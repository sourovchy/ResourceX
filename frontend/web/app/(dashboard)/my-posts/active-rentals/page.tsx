"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
	Building2,
	CalendarDays,
	CheckCircle,
	GraduationCap,
	Loader2,
	MessageSquare,
	Shield,
} from "lucide-react";
import api from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { formatDateRange, formatShortDate } from "@/lib/dateUtils";
import { extractErrorMessage } from "@/lib/errorUtils";
import MessageModal from "@/components/misc/MessageModal";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import Button from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/PageLoader";
import { PageError } from "@/components/ui/PageError";
import SafeImage from "@/components/ui/SafeImage";
import { TiltCard } from "@/components/ui/TiltCard";
import { trustLevelFor, TRUST_LEVEL_LABEL, trustColor } from "@/types/trust";

type ActiveBooking = {
	bookingId: number;
	startDate: string;
	endDate: string;
	status: string;
	totalPrice: number;
	item: {
		itemId: number;
		title: string;
		dailyRate: number;
	};
	renter: {
		userId: number;
		name: string;
		email: string;
		avatarUrl?: string | null;
		studentProfile?: {
			trustScore?: number | null;
			department?: string | null;
			university?: string | null;
		} | null;
	};
};

export default function ActiveRentalsPage() {
	const { toast } = useToast();
	const [bookings, setBookings] = useState<ActiveBooking[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [completeTarget, setCompleteTarget] = useState<number | null>(null);
	const [completing, setCompleting] = useState(false);
	const [activatingId, setActivatingId] = useState<number | null>(null);
	const [messageTarget, setMessageTarget] = useState<{ userId: number; name: string } | null>(null);

	const load = async () => {
		try {
			setLoading(true);
			setError("");
			const res = await api.get("/bookings/owner");
			const all: ActiveBooking[] = Array.isArray(res.data) ? res.data : [];
			// APPROVED (awaiting handover) and ACTIVE (in progress) are the live rentals
			setBookings(all.filter((b) => b.status === "APPROVED" || b.status === "ACTIVE"));
		} catch (err) {
			setError(extractErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { load(); }, []);

	// Keep rental status fresh when returning to the tab
	useAutoRefresh(load, { intervalMs: 60_000 });

	const markCompleted = async () => {
		if (!completeTarget) return;
		setCompleting(true);
		try {
			await api.patch(`/bookings/${completeTarget}/complete`);
			toast("Rental marked as completed.");
			setCompleteTarget(null);
			await load();
		} catch (err) {
			toast(extractErrorMessage(err), "error");
		} finally {
			setCompleting(false);
		}
	};

	// Confirm the physical handover: APPROVED → ACTIVE
	const confirmHandover = async (bookingId: number) => {
		setActivatingId(bookingId);
		try {
			await api.patch(`/bookings/${bookingId}/activate`);
			toast("Handover confirmed — the rental is now active.");
			await load();
		} catch (err) {
			toast(extractErrorMessage(err), "error");
		} finally {
			setActivatingId(null);
		}
	};

	const today = new Date().toISOString().split("T")[0];

	return (
		<div className="w-full space-y-6 px-4 pb-16 sm:px-6 sm:pb-20 lg:space-y-8 lg:px-8">
			<div className="space-y-1">
				<h1 className="text-3xl font-normal italic leading-tight text-textPrimary sm:text-4xl">
					Manage <span className="text-primary font-bold">rentals.</span>
				</h1>
				<p className="text-sm text-textSecondary sm:text-base lg:text-lg">
					Items you have approved and are currently rented out.
				</p>
			</div>

			{loading && <PageLoader message="Loading rentals..." />}

			{!loading && error && <PageError message={error} onRetry={load} />}

			{!loading && !error && bookings.length === 0 && (
				<Card padding="none" className="py-16 text-center">
					<p className="text-sm text-textSecondary">
						No active rentals right now.
					</p>
					<Link
						href="/my-posts/requests"
						className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
						View pending requests →
					</Link>
				</Card>
			)}

			{!loading && !error && bookings.length > 0 && (
				<div className="space-y-5 lg:space-y-6">
					{bookings.map((booking) => {
						const isActive = booking.status === "ACTIVE";
						const overdue = isActive && booking.endDate < today;
						const phase = !isActive
							? "Awaiting Handover"
							: overdue
							? "Overdue"
							: "In Progress";
						const phaseClass = !isActive
							? "bg-warningLight text-warningDark"
							: overdue
							? "bg-errorLight text-errorDark"
							: "bg-successLight text-successDark";

						const profile = booking.renter?.studentProfile;
						const trust = profile?.trustScore ?? null;

						return (
						<TiltCard
							key={booking.bookingId}
							maxTilt={1}
							className="space-y-5 rounded-2xl border border-borderLight bg-surface p-5 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md sm:p-6 lg:p-8"
						>
								{/* Header */}
								<div className="flex flex-col gap-2 border-b border-borderLight pb-4 sm:flex-row sm:items-center sm:justify-between">
									<div className="min-w-0">
										<h3 className="font-bold text-textPrimary">
											{booking.item?.title}
										</h3>
										<div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-textSecondary">
											<span className="flex items-center gap-1">
												<CalendarDays className="h-3.5 w-3.5" />
												{formatDateRange(booking.startDate, booking.endDate)}
											</span>
											<span className="font-semibold text-textPrimary">
												৳&thinsp;{Number(booking.totalPrice).toLocaleString()}
											</span>
										</div>
									</div>
									<span className={`self-start whitespace-nowrap rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] sm:text-xs ${phaseClass}`}>
										{phase}
									</span>
								</div>

								{/* ── Renter profile ── */}
								<div className="flex items-start gap-3 sm:gap-4 rounded-xl bg-surfaceVariant/60 p-4 sm:p-5 mt-4">
									{/* Avatar */}
									<Link
										href={`/profile/${booking.renter?.userId}`}
										className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-borderLight sm:h-14 sm:w-14">
										<SafeImage
											src={booking.renter?.avatarUrl ?? null}
											alt={booking.renter?.name ?? "Renter"}
											fill
											className="object-cover"
											sizes="56px"
										/>
									</Link>

									<div className="min-w-0 flex-1">
										{/* Name + trust */}
										<div className="flex flex-wrap items-center gap-2">
											<Link
												href={`/profile/${booking.renter?.userId}`}
												className="font-bold text-textPrimary hover:text-primary">
												{booking.renter?.name ?? "Unknown renter"}
											</Link>
											{trust != null && (
												<span
													className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${trustColor(trust)}`}>
													<Shield className="h-3 w-3" />
													{trust} · {TRUST_LEVEL_LABEL[trustLevelFor(trust)]}
												</span>
											)}
										</div>

										{/* University / dept */}
										{(profile?.university || profile?.department) && (
											<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-textSecondary">
												{profile.university && (
													<span className="flex items-center gap-1">
														<Building2 className="h-3.5 w-3.5" />
														{profile.university}
													</span>
												)}
												{profile.department && (
													<span className="flex items-center gap-1">
														<GraduationCap className="h-3.5 w-3.5" />
														{profile.department}
													</span>
												)}
											</div>
										)}
									</div>
								</div>

								{/* Actions */}
								<div className="flex flex-col gap-3 border-t border-borderLight pt-5 sm:flex-row">
									{isActive ? (
										<Button
											onClick={() => setCompleteTarget(booking.bookingId)}
											className="flex-1"
										>
											<CheckCircle className="mr-2 h-4 w-4" />
											Mark as Returned
										</Button>
									) : (
										<Button
											onClick={() => confirmHandover(booking.bookingId)}
											loading={activatingId === booking.bookingId}
											className="flex-1"
										>
											<CheckCircle className="mr-2 h-4 w-4" />
											Confirm Handover
										</Button>
									)}

									{booking.renter?.userId && (
										<Button
											variant="ghost"
											onClick={() =>
												setMessageTarget({
													userId: booking.renter.userId,
													name: booking.renter.name ?? "Renter",
												})
											}
											className="flex-1"
										>
											<MessageSquare className="mr-2 h-4 w-4" />
											Message Renter
										</Button>
									)}
								</div>
							</TiltCard>
					);
				})}
				</div>
			)}

			<ConfirmModal
				isOpen={completeTarget !== null}
				title="Mark Rental as Completed"
				message="Confirm the item has been returned in good condition. This sets the booking to COMPLETED, makes the item available again, and lets the renter leave a review. This cannot be undone."
				confirmText="Confirm Return"
				cancelText="Cancel"
				isLoading={completing}
				onConfirm={markCompleted}
				onCancel={() => setCompleteTarget(null)}
			/>

			{messageTarget && (
				<MessageModal
					isOpen={true}
					targetUserId={messageTarget.userId}
					targetName={messageTarget.name}
					onClose={() => setMessageTarget(null)}
				/>
			)}
		</div>
	);
}
