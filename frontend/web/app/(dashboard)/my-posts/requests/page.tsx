"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
	AlertCircle,
	AlertTriangle,
	BookOpen,
	Building2,
	CalendarDays,
	Check,
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	Clock,
	GraduationCap,
	MessageSquare,
	Package,
	Shield,
	Star,
	X,
} from "lucide-react";
import api from "@/lib/api";
import { extractErrorMessage } from "@/lib/errorUtils";
import { formatDateRange } from "@/lib/dateUtils";
import Avatar from "@/components/ui/Avatar";
import MessageModal from "@/components/misc/MessageModal";
import Button from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageLoader } from "@/components/ui/PageLoader";
import { PageError } from "@/components/ui/PageError";
import { PageEmpty } from "@/components/ui/PageEmpty";
import { TiltCard } from "@/components/ui/TiltCard";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { trustLevelFor, TRUST_LEVEL_LABEL, trustColor } from "@/types/trust";

// ── Backend-aligned types ─────────────────────────────────────────────────────

type StudentProfile = {
	university: string | null;
	department: string | null;
	trustScore: number | null;
};

type RenterProfile = {
	userId: number;
	name: string;
	avatarUrl: string | null;
	studentProfile: StudentProfile | null;
};

type ItemSummary = {
	itemId: number;
	title: string;
	dailyRate: number | null;
	deposit: number | null;
	imageUrls: string[];
	category: string | null;
	status: string;
};

type BookingResponse = {
	bookingId: number;
	item: ItemSummary;
	renter: RenterProfile;
	startDate: string;
	endDate: string;
	status: string;
	totalPrice: number | null;
	bookingMessage: string | null;
	rejectionReason: string | null;
	createdAt: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

type StatusFilter = "PENDING" | "APPROVED" | "REJECTED" | "ALL";

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
	PENDING:   { label: "Pending",  classes: "bg-warningLight text-warningDark" },
	APPROVED:  { label: "Approved", classes: "bg-successLight text-successDark" },
	COMPLETED: { label: "Completed", classes: "bg-successLight text-successDark" },
	REJECTED:  { label: "Rejected", classes: "bg-errorLight text-error" },
};

function statusLabel(raw: string) {
	return STATUS_LABELS[raw?.toUpperCase()] ?? { label: raw, classes: "bg-outlineVariant text-textSecondary" };
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function RequestsPage() {
	const searchParams = useSearchParams();
	const postId = searchParams.get("postId"); // item ID filter from "my-posts" page

	const [bookings, setBookings] = useState<BookingResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [pageError, setPageError] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const [filter, setFilter] = useState<StatusFilter>("PENDING");

	// Reject modal state
	const [rejectModalOpen, setRejectModalOpen] = useState(false);
	const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
	const [rejectionReason, setRejectionReason] = useState("");
	const [busyId, setBusyId] = useState<number | null>(null);
	const [messageTarget, setMessageTarget] = useState<{ userId: number; name: string } | null>(null);

	// ── Data fetch ──────────────────────────────────────────────────────────
	const load = useCallback(async () => {
		setLoading(true);
		setPageError(null);
		try {
			const res = await api.get<BookingResponse[]>("/bookings/owner");
			setBookings(Array.isArray(res.data) ? res.data : []);
		} catch (err) {
			setPageError(extractErrorMessage(err));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	// ── Derived lists ───────────────────────────────────────────────────────
	const scoped = useMemo(() => {
		if (!postId) return bookings;
		return bookings.filter((b) => String(b.item?.itemId) === postId);
	}, [bookings, postId]);

	const filtered = useMemo(() => {
		if (filter === "ALL") return scoped;
		return scoped.filter((b) => b.status?.toUpperCase() === filter);
	}, [scoped, filter]);

	const counts = useMemo(() => ({
		PENDING:  scoped.filter((b) => b.status?.toUpperCase() === "PENDING").length,
		APPROVED: scoped.filter((b) => b.status?.toUpperCase() === "APPROVED").length,
		REJECTED: scoped.filter((b) => b.status?.toUpperCase() === "REJECTED").length,
		ALL:      scoped.length,
	}), [scoped]);

	// ── Actions ─────────────────────────────────────────────────────────────
	const showSuccess = (msg: string) => {
		setSuccessMessage(msg);
		setTimeout(() => setSuccessMessage(null), 5000);
	};

	const approve = async (bookingId: number) => {
		setBusyId(bookingId);
		setActionError(null);
		try {
			await api.patch(`/bookings/${bookingId}/approve`);
			setBookings((prev) =>
				prev.map((b) =>
					b.bookingId === bookingId
						? { ...b, status: "APPROVED" }
						: b,
				),
			);
			showSuccess("Booking approved. The renter will be notified.");
		} catch (err) {
			setActionError(extractErrorMessage(err));
		} finally {
			setBusyId(null);
		}
	};

	const openRejectModal = (bookingId: number) => {
		setSelectedBookingId(bookingId);
		setRejectionReason("");
		setRejectModalOpen(true);
	};

	const closeRejectModal = () => {
		setRejectModalOpen(false);
		setSelectedBookingId(null);
		setRejectionReason("");
	};

	const confirmReject = async () => {
		if (!selectedBookingId) return;
		const reason = rejectionReason.trim();
		if (!reason) return;

		setBusyId(selectedBookingId);
		setActionError(null);
		try {
			await api.patch(`/bookings/${selectedBookingId}/reject`, { reason });
			setBookings((prev) =>
				prev.map((b) =>
					b.bookingId === selectedBookingId
						? { ...b, status: "REJECTED", rejectionReason: reason }
						: b,
				),
			);
			closeRejectModal();
			showSuccess("Booking rejected. The renter has been notified.");
		} catch (err) {
			setActionError(extractErrorMessage(err));
		} finally {
			setBusyId(null);
		}
	};

	// ── Loading state ───────────────────────────────────────────────────────
	if (loading) {
		return <PageLoader message="Loading booking requests..." />;
	}

	// ── Page error ──────────────────────────────────────────────────────────
	if (pageError) {
		return <PageError message={pageError} onRetry={load} />;
	}

	// ── Main render ─────────────────────────────────────────────────────────
	return (
		<div className="w-full space-y-6 px-4 pb-20 sm:px-6 lg:space-y-8 lg:px-8">
			{/* Header */}
			<div className="space-y-1">
				<h1 className="text-3xl font-normal italic leading-tight text-textPrimary sm:text-4xl">
					Review <span className="text-primary font-bold">requests.</span>
				</h1>
				<p className="text-sm text-textSecondary sm:text-base lg:text-lg">
					{postId
						? "Requests for this listing — approve the right renter or reject with a reason."
						: "All booking requests across your listings."}
				</p>
			</div>

			{/* Action feedback */}
			{actionError && (
				<div className="flex items-start gap-3 rounded-xl border border-error bg-errorLight/30 p-4 text-sm text-errorDark">
					<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
					<span>{actionError}</span>
				</div>
			)}
			{successMessage && (
				<div className="flex items-center gap-2 rounded-xl bg-successLight p-4 text-sm font-semibold text-success">
					<CheckCircle2 className="h-4 w-4 shrink-0" />
					{successMessage}
				</div>
			)}

			{/* Status tabs */}
			<div className="border-b border-borderLight">
				<div className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1">
					{(
						[
							{ key: "PENDING",  label: "Pending" },
							{ key: "APPROVED", label: "Approved" },
							{ key: "REJECTED", label: "Rejected" },
							{ key: "ALL",      label: "All" },
						] as const
					).map(({ key, label }) => (
						<button
							key={key}
							onClick={() => setFilter(key)}
							className={`flex items-center whitespace-nowrap px-4 py-3 text-sm font-semibold transition-all hover:bg-surfaceVariant/50 rounded-t-xl border-b-2 sm:text-base ${
								filter === key
									? "border-primary text-primary bg-primaryLight/10"
									: "border-transparent text-textSecondary hover:text-textPrimary"
							}`}>
							{label}
							<span
								className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold transition-colors ${
									filter === key
										? "bg-primary text-white"
										: "bg-surfaceVariant text-textSecondary"
								}`}>
								{counts[key]}
							</span>
						</button>
					))}
				</div>
			</div>

			{/* Empty state */}
			{filtered.length === 0 && (
				<PageEmpty
					icon={BookOpen}
					title={`No ${filter === "ALL" ? "" : filter.toLowerCase() + " "}requests`}
					description={
						filter === "PENDING"
							? "No one has requested a booking yet."
							: `There are no ${filter.toLowerCase()} bookings${postId ? " for this item" : ""}.`
					}
				/>
			)}

			{/* Request cards */}
			<div className="space-y-5 lg:space-y-6">
				{filtered.map((booking) => {
					const isBusy = busyId === booking.bookingId;
					const renter = booking.renter;
					const profile = renter?.studentProfile;
					const trust = profile?.trustScore ?? null;
					const isPending = booking.status?.toUpperCase() === "PENDING";
					const isRejected = booking.status?.toUpperCase() === "REJECTED";

					return (
						<TiltCard
							key={booking.bookingId}
							maxTilt={4}
							glare={true}
							className="overflow-hidden rounded-2xl border border-borderLight bg-surface shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md"
						>

							{/* ── Card header: item + dates + status ── */}
							<div className="flex flex-col gap-2 border-b border-borderLight bg-surfaceVariant/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
								<div className="min-w-0 flex-1">
									<h3 className="truncate font-bold text-textPrimary">
										{booking.item?.title ?? "Item"}
									</h3>
									<div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-textSecondary">
										<span className="flex items-center gap-1">
											<CalendarDays className="h-3.5 w-3.5" />
											{formatDateRange(booking.startDate, booking.endDate)}
										</span>
										{booking.totalPrice != null && (
											<span className="font-semibold text-textPrimary">
												৳&thinsp;{Number(booking.totalPrice).toFixed(2)} total
											</span>
										)}
									</div>
								</div>
								<div className="self-start">
									<StatusBadge status={booking.status} />
								</div>
							</div>

							<div className="space-y-5 p-5 sm:p-6 lg:p-8">
								{/* ── Renter profile ── */}
								<div className="flex items-start gap-3 sm:gap-4">
									{/* Avatar */}
									<Link
										href={`/profile/${renter?.userId}`}
										className="shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1">
										<Avatar
											src={renter?.avatarUrl}
											name={renter?.name}
											size={56}
											className="!h-12 !w-12 sm:!h-14 sm:!w-14 border-2 border-borderLight"
										/>
									</Link>

									<div className="min-w-0 flex-1">
										{/* Name + trust */}
										<div className="flex flex-wrap items-center gap-2">
											<Link
												href={`/profile/${renter?.userId}`}
												className="font-bold text-textPrimary hover:text-primary">
												{renter?.name ?? "Unknown renter"}
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

								{/* ── Booking message ── */}
								{booking.bookingMessage && (
									<div className="flex items-start gap-2.5 rounded-xl bg-surfaceVariant p-3.5 text-sm mt-4">
										<MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-textSecondary" />
										<div>
											<p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-textSecondary">
												Message from renter
											</p>
											<p className="text-textPrimary">&ldquo;{booking.bookingMessage}&rdquo;</p>
										</div>
									</div>
								)}

								{/* ── Rejection reason ── */}
								{isRejected && booking.rejectionReason && (
									<div className="flex gap-2.5 pt-2 text-sm text-error mt-4 border-t border-borderLight">
										<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
										<div>
											<p className="font-bold">Rejection reason</p>
											<p className="mt-0.5 text-errorDark">{booking.rejectionReason}</p>
										</div>
									</div>
								)}

								{/* ── Actions ── */}
								{(isPending || renter?.userId) && (
									<div className="flex flex-col gap-3 pt-5 mt-5 border-t border-borderLight sm:flex-row sm:items-center">
										{isPending && (
											<>
												<Button
													onClick={() => approve(booking.bookingId)}
													disabled={isBusy}
													loading={isBusy}
													className="flex-1"
												>
													{!isBusy && <Check className="mr-2 h-4 w-4" />} Approve
												</Button>
												<Button
													variant="ghost"
													onClick={() => openRejectModal(booking.bookingId)}
													disabled={isBusy}
													className="flex-1 border-error text-error hover:bg-errorLight hover:text-errorDark"
												>
													<X className="mr-2 h-4 w-4" /> Reject
												</Button>
											</>
										)}
										
										{renter?.userId && (
											<Button
												variant="ghost"
												onClick={() =>
													setMessageTarget({ userId: renter.userId, name: renter.name ?? "Renter" })
												}
												className="w-full sm:w-auto"
											>
												<MessageSquare className="mr-2 h-4 w-4" /> Message Renter
											</Button>
										)}
									</div>
								)}
							</div>
						</TiltCard>
					);
				})}
			</div>

			{/* ── Message modal ── */}
			{messageTarget && (
				<MessageModal
					isOpen={true}
					targetUserId={messageTarget.userId}
					targetName={messageTarget.name}
					onClose={() => setMessageTarget(null)}
				/>
			)}

			{/* ── Reject modal ── */}
			<ConfirmModal
				isOpen={rejectModalOpen}
				title="Reject Booking Request"
				message="Provide a clear reason so the renter understands why it was rejected."
				confirmText="Confirm Reject"
				cancelText="Cancel"
				isDestructive
				requireReason
				reasonLabel="Reason"
				reasonPlaceholder="e.g. The item is already reserved for these dates."
				reasonValue={rejectionReason}
				onReasonChange={setRejectionReason}
				isLoading={busyId !== null}
				onConfirm={confirmReject}
				onCancel={closeRejectModal}
			/>
		</div>
	);
}
