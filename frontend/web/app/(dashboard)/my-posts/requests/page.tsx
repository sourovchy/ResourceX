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
	Loader2,
	Mail,
	MessageSquare,
	Package,
	Phone,
	Shield,
	User,
	X,
} from "lucide-react";
import api from "@/lib/api";
import { extractErrorMessage } from "@/lib/errorUtils";
import { formatDateRange } from "@/lib/dateUtils";
import SafeImage from "@/components/ui/SafeImage";
import MessageModal from "@/components/misc/MessageModal";

// ── Backend-aligned types ─────────────────────────────────────────────────────

type StudentProfile = {
	studentId: string | null;
	phone: string | null;
	university: string | null;
	department: string | null;
	trustScore: number | null;
};

type RenterProfile = {
	userId: number;
	name: string;
	email: string;
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
	CANCELLED: { label: "Cancelled", classes: "bg-outlineVariant text-textSecondary" },
};

function statusLabel(raw: string) {
	return STATUS_LABELS[raw?.toUpperCase()] ?? { label: raw, classes: "bg-outlineVariant text-textSecondary" };
}

function trustColor(score: number | null): string {
	if (score == null) return "bg-outlineVariant text-textSecondary";
	if (score >= 90) return "bg-successLight text-successDark";
	if (score >= 75) return "bg-primaryLight text-primaryDark";
	if (score >= 60) return "bg-warningLight text-warningDark";
	if (score >= 40) return "bg-errorLight/60 text-errorDark";
	return "bg-errorLight text-error";
}

function trustLabel(score: number | null): string {
	if (score == null) return "No score";
	if (score >= 90) return "Excellent";
	if (score >= 75) return "Good";
	if (score >= 60) return "Fair";
	if (score >= 40) return "Warning";
	return "Suspended";
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
	useEffect(() => {
		let active = true;
		setLoading(true);
		setPageError(null);

		api.get<BookingResponse[]>("/bookings/owner")
			.then((res) => {
				if (!active) return;
				const all = Array.isArray(res.data) ? res.data : [];
				setBookings(all);
			})
			.catch((err) => {
				if (!active) return;
				setPageError(extractErrorMessage(err));
			})
			.finally(() => {
				if (active) setLoading(false);
			});

		return () => { active = false; };
	}, []);

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
		return (
			<div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-3 px-4 py-20 text-center">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
				<p className="text-sm font-medium text-textSecondary">
					Loading booking requests…
				</p>
			</div>
		);
	}

	// ── Page error ──────────────────────────────────────────────────────────
	if (pageError) {
		return (
			<div className="mx-auto max-w-lg px-4 py-20 text-center">
				<AlertTriangle className="mx-auto mb-3 h-10 w-10 text-error" />
				<p className="font-semibold text-textPrimary">Failed to load requests</p>
				<p className="mt-1 text-sm text-textSecondary">{pageError}</p>
			</div>
		);
	}

	// ── Main render ─────────────────────────────────────────────────────────
	return (
		<div className="w-full space-y-5 px-3 pb-20 sm:px-4 lg:px-0">
			{/* Header */}
			<div className="space-y-0.5">
				<h1 className="text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
					Booking Requests
				</h1>
				<p className="text-sm text-textSecondary">
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
			<div className="flex flex-wrap gap-0 border-b border-borderLight">
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
						className={`relative px-4 py-3 text-sm font-semibold transition-colors ${
							filter === key
								? "text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary"
								: "text-textSecondary hover:text-textPrimary"
						}`}>
						{label}
						<span
							className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-bold ${
								filter === key
									? "bg-primary text-white"
									: "bg-surfaceVariant text-textSecondary"
							}`}>
							{counts[key]}
						</span>
					</button>
				))}
			</div>

			{/* Empty state */}
			{filtered.length === 0 && (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-borderLight bg-surface px-6 py-16 text-center">
					<BookOpen className="mb-3 h-10 w-10 text-outlineVariant" />
					<p className="font-semibold text-textPrimary">No {filter === "ALL" ? "" : filter.toLowerCase() + " "}requests</p>
					<p className="mt-1 text-sm text-textSecondary">
						{filter === "PENDING"
							? "No one has requested a booking yet."
							: `There are no ${filter.toLowerCase()} bookings${postId ? " for this item" : ""}.`}
					</p>
				</div>
			)}

			{/* Request cards */}
			<div className="space-y-4">
				{filtered.map((booking) => {
					const isBusy = busyId === booking.bookingId;
					const renter = booking.renter;
					const profile = renter?.studentProfile;
					const trust = profile?.trustScore ?? null;
					const sl = statusLabel(booking.status);
					const isPending = booking.status?.toUpperCase() === "PENDING";
					const isRejected = booking.status?.toUpperCase() === "REJECTED";

					return (
						<div
							key={booking.bookingId}
							className="overflow-hidden rounded-2xl border border-borderLight bg-surface shadow-sm">

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
								<div
									className={`self-start whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-bold ${sl.classes}`}>
									{sl.label}
								</div>
							</div>

							<div className="space-y-4 p-4 sm:p-5">
								{/* ── Renter profile ── */}
								<div className="flex items-start gap-3 sm:gap-4">
									{/* Avatar */}
									<Link
										href={`/profile/${renter?.userId}`}
										className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-borderLight sm:h-14 sm:w-14">
										<SafeImage
											src={renter?.avatarUrl ?? null}
											alt={renter?.name ?? "Renter"}
											fill
											className="object-cover"
											sizes="56px"
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
													{trust} · {trustLabel(trust)}
												</span>
											)}
										</div>

										{/* University / dept */}
										{(profile?.university || profile?.department) && (
											<div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-textSecondary">
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

								{/* ── Private contact details ── */}
								{(profile?.studentId || renter?.email || profile?.phone) && (
									<div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 mt-3 border-t border-borderLight text-xs">
										{profile?.studentId && (
											<span className="flex items-center gap-1.5 text-textSecondary">
												<User className="h-3.5 w-3.5 shrink-0" />
												<span>
													<span className="mr-1 font-semibold text-textPrimary">ID:</span>
													{profile.studentId}
												</span>
											</span>
										)}
										{renter?.email && (
											<span className="flex items-center gap-1.5 text-textSecondary">
												<Mail className="h-3.5 w-3.5 shrink-0" />
												<a
													href={`mailto:${renter.email}`}
													className="truncate hover:text-primary hover:underline">
													{renter.email}
												</a>
											</span>
										)}
										{profile?.phone && (
											<span className="flex items-center gap-1.5 text-textSecondary">
												<Phone className="h-3.5 w-3.5 shrink-0" />
												<a
													href={`tel:${profile.phone}`}
													className="hover:text-primary hover:underline">
													{profile.phone}
												</a>
											</span>
										)}
									</div>
								)}

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
									<div className="flex flex-col gap-2 pt-4 mt-4 border-t border-borderLight sm:flex-row sm:items-center">
										{isPending && (
											<>
												<button
													onClick={() => approve(booking.bookingId)}
													disabled={isBusy}
													className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition-colors hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-60">
													{isBusy ? (
														<Loader2 className="h-4 w-4 animate-spin" />
													) : (
														<Check className="h-4 w-4" />
													)}
													Approve
												</button>
												<button
													onClick={() => openRejectModal(booking.bookingId)}
													disabled={isBusy}
													className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-error bg-surface py-2.5 text-sm font-bold text-error transition-colors hover:bg-errorLight disabled:cursor-not-allowed disabled:opacity-60">
													<X className="h-4 w-4" />
													Reject
												</button>
											</>
										)}
										
										{renter?.userId && (
											<button
												onClick={() =>
													setMessageTarget({ userId: renter.userId, name: renter.name ?? "Renter" })
												}
												className="flex items-center justify-center gap-2 rounded-xl border border-borderLight bg-surface px-4 py-2.5 text-sm font-semibold text-textSecondary transition-colors hover:border-primary hover:bg-primaryLight hover:text-primary sm:w-auto w-full">
												<MessageSquare className="h-4 w-4" />
												Message Renter
											</button>
										)}
									</div>
								)}
							</div>
						</div>
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
			{rejectModalOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
					role="dialog"
					aria-modal="true"
					aria-labelledby="reject-modal-title">
					<div className="w-full max-w-lg space-y-5 rounded-2xl border border-borderLight bg-surface p-5 shadow-xl sm:p-6">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h2
									id="reject-modal-title"
									className="text-lg font-bold text-textPrimary">
									Reject Booking Request
								</h2>
								<p className="mt-1 text-sm text-textSecondary">
									Provide a clear reason so the renter understands why it was
									rejected.
								</p>
							</div>
							<button
								type="button"
								onClick={closeRejectModal}
								aria-label="Close modal"
								className="rounded-lg p-1 text-textSecondary hover:bg-surfaceVariant hover:text-textPrimary">
								<X className="h-5 w-5" />
							</button>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="rejection-reason"
								className="text-sm font-bold text-textPrimary">
								Reason <span className="text-error">*</span>
							</label>
							<textarea
								id="rejection-reason"
								value={rejectionReason}
								onChange={(e) => setRejectionReason(e.target.value)}
								rows={4}
								maxLength={1000}
								placeholder="e.g. The item is already reserved for these dates."
								className="w-full resize-none rounded-xl border border-borderLight bg-surface px-4 py-3 text-sm text-textPrimary placeholder-textSecondary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
							/>
							<p className="text-right text-xs text-textSecondary">
								{rejectionReason.length}/1000
							</p>
						</div>

						<div className="flex gap-3">
							<button
								type="button"
								onClick={closeRejectModal}
								className="flex-1 rounded-xl border border-borderLight py-3 text-sm font-bold text-textPrimary transition-colors hover:bg-surfaceVariant">
								Cancel
							</button>
							<button
								type="button"
								onClick={confirmReject}
								disabled={!rejectionReason.trim() || busyId !== null}
								className="flex-1 rounded-xl py-3 text-sm font-bold text-white transition-colors enabled:bg-error enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:bg-outlineVariant disabled:text-textSecondary">
								{busyId !== null ? (
									<Loader2 className="mx-auto h-4 w-4 animate-spin" />
								) : (
									"Confirm Reject"
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
