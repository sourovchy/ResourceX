"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
	Star,
	Shield,
	Bookmark,
	Package,
	ShieldAlert,
	Edit2,
	TrendingDown,
	TrendingUp,
	Calendar,
	Clock3,
	User,
	Phone,
	Mail,
	AlertTriangle,
	ChevronLeft,
} from "lucide-react";
import api from "@/lib/api";
import { formatShortDate } from "@/lib/dateUtils";
import { extractErrorMessage } from "@/lib/errorUtils";
import { useToast } from "@/context/ToastContext";

// ─── Types ───────────────────────────────────────────────────────────────────

type UserStatus = "VERIFIED" | "PENDING" | "SUSPENDED";
type SuspensionType = "ONE_DAY" | "SEVEN_DAYS" | "THIRTY_DAYS" | "PERMANENT";

const SUSPENSION_OPTIONS: { value: SuspensionType; label: string; description: string }[] = [
	{ value: "ONE_DAY",     label: "1 Day",    description: "24-hour cooldown" },
	{ value: "SEVEN_DAYS",  label: "7 Days",   description: "1-week suspension" },
	{ value: "THIRTY_DAYS", label: "30 Days",  description: "Extended suspension" },
	{ value: "PERMANENT",   label: "Permanent", description: "Scheduled deletion after 15 days" },
];

type TrustLogItem = {
	change: number;
	reason: string;
	date: string;
};

type BookingItem = {
	id: string;
	item: string;
	status: string;
	date: string;
};

type ListedItem = {
	id: string;
	title: string;
	status: string;
	price: string;
};

type DisputeItem = {
	id: string;
	booking: string;
	reason: string;
	status: string;
	date: string;
};

type AdminUserDetail = {
	id: string;
	name: string;
	email: string;
	studentId: string;
	phone: string;
	department: string;
	university: string;
	idCardDataUrl?: string;
	status: UserStatus;
	trustScore: number;
	registered: string;
	lastActive: string;
	warnings: number;
	verificationSubmitted: string;
	verificationDocs: string[];
	bookings: BookingItem[];
	items: ListedItem[];
	disputes: DisputeItem[];
	trustLog: TrustLogItem[];
	// Suspension info
	suspensionType?: SuspensionType | null;
	suspensionReason?: string | null;
	suspendedAt?: string | null;
	suspendedUntil?: string | null;
	scheduledDeletionAt?: string | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<UserStatus, string> = {
	VERIFIED: "bg-successLight text-success",
	PENDING: "bg-warningLight text-warning",
	SUSPENDED: "bg-errorLight text-error",
};

function mapUserStatus(raw?: string): UserStatus {
	if (raw === "ACTIVE") return "VERIFIED";
	if (raw === "SUSPENDED") return "SUSPENDED";
	return "PENDING";
}

function getTrustColor(score: number) {
	if (score >= 90) return "text-success";
	if (score >= 50) return "text-primary";
	if (score > 0) return "text-warning";
	return "text-error";
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminUserDetailPage() {
	const params = useParams<{ id?: string | string[] }>();
	const userId = Array.isArray(params.id) ? params.id[0] : params.id;
	const searchParams = useSearchParams();
	const isPendingType = searchParams.get("type") === "pending";
	const { toast } = useToast();

	const [user, setUser] = useState<AdminUserDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [userStatus, setUserStatus] = useState<UserStatus>("PENDING");
	const [trustScore, setTrustScore] = useState(0);
	const [adjusting, setAdjusting] = useState(false);
	const [adjustment, setAdjustment] = useState({ value: "", reason: "" });
	const [adminFeedback, setAdminFeedback] = useState("");
	const [actionDone, setActionDone] = useState<string | null>(null);
	const [secondaryLoading, setSecondaryLoading] = useState(false);
	const [suspendModalOpen, setSuspendModalOpen] = useState(false);
	const [suspensionType, setSuspensionType] = useState<SuspensionType>("ONE_DAY");
	const [suspensionReason, setSuspensionReason] = useState("");

	const statusColor = useMemo(() => STATUS_COLORS[userStatus], [userStatus]);
	const trustColor = useMemo(() => getTrustColor(trustScore), [trustScore]);

	const [idCardBlobUrl, setIdCardBlobUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!user?.idCardDataUrl) {
			setIdCardBlobUrl(null);
			return;
		}

		const url = user.idCardDataUrl;
		if (url.startsWith("data:")) {
			setIdCardBlobUrl(url);
			return;
		}

		let fetchUrl = url;
		if (!url.startsWith("http") && !url.startsWith("/api/") && !url.startsWith("/")) {
			fetchUrl = `/files/${url}`;
		}

		const controller = new AbortController();
		let objectUrl: string | null = null;

		api.get(fetchUrl, { responseType: "blob", signal: controller.signal })
			.then((res) => {
				objectUrl = URL.createObjectURL(res.data);
				setIdCardBlobUrl(objectUrl);
			})
			.catch((err) => {
				if (!controller.signal.aborted) {
					console.error("Failed to fetch ID card image", err);
					setIdCardBlobUrl(null);
				}
			});

		return () => {
			controller.abort();
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [user?.idCardDataUrl]);

	// Fetch trust log + disputes in parallel after the primary user load
	const loadSecondaryData = useCallback(
		async (uid: string) => {
			setSecondaryLoading(true);
			try {
				const [trustResult, disputesResult] = await Promise.allSettled([
					api.get(`/trust/events/user/${uid}`),
					api.get(`/disputes/user/${uid}`),
				]);

				setUser((prev) => {
					if (!prev) return prev;
					const updated = { ...prev };

					if (trustResult.status === "fulfilled") {
						const events: any[] = Array.isArray(trustResult.value.data)
							? trustResult.value.data
							: [];
						updated.trustLog = events.map((e) => ({
							change: e.points ?? 0,
							reason: e.reason ?? "—",
							date: formatShortDate(e.createdAt),
						}));
					}

					if (disputesResult.status === "fulfilled") {
						const disputes: any[] = Array.isArray(disputesResult.value.data)
							? disputesResult.value.data
							: [];
						updated.disputes = disputes.map((d) => ({
							id: String(d.disputeId ?? ""),
							booking: String(d.bookingId ?? "—"),
							reason: d.reason ?? "—",
							status: d.status ?? "—",
							date: formatShortDate(d.createdAt),
						}));
					}

					return updated;
				});
			} finally {
				setSecondaryLoading(false);
			}
		},
		[],
	);

	useEffect(() => {
		if (!userId) {
			setError("Missing user ID.");
			setLoading(false);
			return;
		}

		const controller = new AbortController();

		async function fetchUser() {
			try {
				setLoading(true);
				setError(null);

				// Primary endpoint based on type query param; fall back to the other on 404
				const primaryEndpoint = isPendingType
					? `/admin/pending-users/${encodeURIComponent(userId!)}`
					: `/users/${encodeURIComponent(userId!)}`;
				const fallbackEndpoint = isPendingType
					? `/users/${encodeURIComponent(userId!)}`
					: `/admin/pending-users/${encodeURIComponent(userId!)}`;

				let payload: any;
				let resolvedAsPending = isPendingType;

				try {
					const res = await api.get(primaryEndpoint, { signal: controller.signal });
					payload = res.data;
				} catch (primaryErr: any) {
					if (controller.signal.aborted) return;
					if (primaryErr?.response?.status === 404) {
						const res = await api.get(fallbackEndpoint, { signal: controller.signal });
						payload = res.data;
						resolvedAsPending = !isPendingType;
					} else {
						throw primaryErr;
					}
				}

				let nextUser: AdminUserDetail;

				if (resolvedAsPending) {
					nextUser = {
						id: String(payload.id ?? ""),
						name: payload.name ?? "",
						email: payload.email ?? "",
						studentId: payload.studentId ?? "—",
						phone: payload.phone ?? "—",
						department: payload.department ?? "—",
						university: payload.university ?? "—",
						status: "PENDING",
						trustScore: 0,
						registered: formatShortDate(payload.createdAt),
						lastActive: "—",
						warnings: 0,
						verificationSubmitted: formatShortDate(payload.createdAt),
						verificationDocs: payload.idCardDataUrl ? ["ID Card"] : [],
						idCardDataUrl: payload.idCardDataUrl ?? undefined,
						bookings: [],
						items: [],
						disputes: [],
						trustLog: [],
					};
				} else {
					nextUser = {
						id: String(payload.userId ?? payload.id ?? ""),
						name: payload.name ?? "",
						email: payload.email ?? "",
						studentId: payload.studentProfile?.studentId ?? "—",
						phone: payload.studentProfile?.phone ?? "—",
						department: payload.studentProfile?.department ?? "—",
						university: payload.studentProfile?.university ?? "—",
						status: mapUserStatus(payload.status),
						trustScore: payload.studentProfile?.trustScore ?? 0,
						registered: formatShortDate(payload.createdAt),
						lastActive: "—",
						warnings: 0,
						verificationSubmitted: formatShortDate(payload.createdAt),
						verificationDocs: payload.studentProfile?.idCardDataUrl ? ["ID Card"] : [],
						idCardDataUrl: payload.studentProfile?.idCardDataUrl ?? undefined,
						bookings: [],
						items: [],
						disputes: [],
						trustLog: [],
						suspensionType: payload.suspensionType ?? null,
						suspensionReason: payload.suspensionReason ?? null,
						suspendedAt: payload.suspendedAt ?? null,
						suspendedUntil: payload.suspendedUntil ?? null,
						scheduledDeletionAt: payload.scheduledDeletionAt ?? null,
					};
				}

				if (!nextUser.id) throw new Error("User data was empty.");

				setUser(nextUser);
				setUserStatus(nextUser.status);
				setTrustScore(nextUser.trustScore);
				setAdminFeedback("");

				// Load trust history and disputes in the background for non-pending users
				if (!resolvedAsPending) {
					void loadSecondaryData(userId!);
				}
			} catch (err) {
				if (controller.signal.aborted) return;
				setError(err instanceof Error ? err.message : "Failed to load user details.");
			} finally {
				if (!controller.signal.aborted) setLoading(false);
			}
		}

		void fetchUser();
		return () => controller.abort();
	}, [userId, isPendingType, loadSecondaryData]);

	const handleVerify = async () => {
		try {
			await api.post(`/admin/approve/${userId}`);
			setUserStatus("VERIFIED");
			setUser((prev) => (prev ? { ...prev, status: "VERIFIED" } : prev));
			setActionDone("User approved successfully.");
			toast("User approved successfully.");
		} catch (err) {
			toast(extractErrorMessage(err), "error");
		}
	};

	const handleReject = async () => {
		try {
			await api.post(`/admin/reject/${userId}`, {
				reason: adminFeedback || "Rejected by admin",
			});
			setActionDone("User registration rejected.");
			toast("User rejected.");
		} catch (err) {
			toast(extractErrorMessage(err), "error");
		}
	};

	const handleSuspend = async () => {
		if (!suspensionReason.trim()) {
			toast("Suspension reason is required.", "error");
			return;
		}
		if (suspensionType === "PERMANENT") {
			const confirmed = window.confirm(
				`⚠️ Permanently suspending ${user?.name} will schedule their account for deletion after 15 days. This cannot be undone. Continue?`
			);
			if (!confirmed) return;
		}
		try {
			await api.post(`/admin/block/${userId}`, {
				suspensionType,
				reason: suspensionReason.trim(),
			});
			setUserStatus("SUSPENDED");
			setUser((prev) => prev ? {
				...prev,
				status: "SUSPENDED",
				suspensionType,
				suspensionReason: suspensionReason.trim(),
			} : prev);
			setSuspendModalOpen(false);
			setSuspensionReason("");
			setSuspensionType("ONE_DAY");
			toast("User suspended.");
		} catch (err) {
			toast(extractErrorMessage(err), "error");
		}
	};

	const handleReactivate = async () => {
		try {
			await api.post(`/admin/unblock/${userId}`);
			setUserStatus("VERIFIED");
			setUser((prev) => (prev ? { ...prev, status: "VERIFIED" } : prev));
			toast("User account reactivated.");
		} catch (err) {
			toast(extractErrorMessage(err), "error");
		}
	};

	const handleTrustAdjustment = async () => {
		const value = Number(adjustment.value);
		if (Number.isNaN(value) || value === 0) return;

		try {
			// Correct endpoint: PATCH /trust/admin/{userId}/adjust with { change, reason }
			await api.patch(`/trust/admin/${userId}/adjust`, {
				change: value,
				reason: adjustment.reason,
			});
			setTrustScore((prev) => prev + value);
			setAdjustment({ value: "", reason: "" });
			setAdjusting(false);
			toast(`Trust score adjusted by ${value > 0 ? "+" : ""}${value}.`);
			void loadSecondaryData(userId!);
		} catch (err) {
			toast(extractErrorMessage(err), "error");
		}
	};

	// ─── Loading skeleton ─────────────────────────────────────────────────────

	if (loading) {
		return (
			<div className="mx-auto max-w-5xl space-y-5 px-4 sm:space-y-6 sm:px-6 lg:px-0">
				<div className="h-6 w-40 animate-pulse rounded bg-surfaceVariant" />
				<div className="h-40 animate-pulse rounded-2xl border border-borderLight bg-surface" />
				<div className="grid gap-6 lg:grid-cols-2">
					<div className="h-64 animate-pulse rounded-2xl border border-borderLight bg-surface" />
					<div className="h-64 animate-pulse rounded-2xl border border-borderLight bg-surface" />
				</div>
			</div>
		);
	}

	// ─── Error state ──────────────────────────────────────────────────────────

	if (error || !user) {
		return (
			<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-0">
				<Link
					href="/users"
					className="mb-4 inline-flex items-center gap-1 text-sm text-textSecondary transition hover:text-textPrimary">
					<ChevronLeft className="h-4 w-4" /> Back to Users
				</Link>
				<div className="mt-4 rounded-2xl border border-borderLight bg-surface p-6 shadow-sm">
					<h1 className="text-xl font-bold text-textPrimary">User details unavailable</h1>
					<p className="mt-2 text-sm text-textSecondary">
						{error ?? "We could not load this user right now."}
					</p>
				</div>
			</div>
		);
	}

	// ─── Main render ──────────────────────────────────────────────────────────

	return (
		<div className="mx-auto max-w-5xl space-y-5 px-4 sm:space-y-6 sm:px-6 lg:px-0">
			{/* Back navigation breadcrumb */}
			<div className="flex items-center gap-2 text-sm">
				<Link
					href="/users"
					className="inline-flex items-center gap-1 text-textSecondary transition hover:text-textPrimary">
					<ChevronLeft className="h-4 w-4" /> Users
				</Link>
				<span className="text-textTertiary">/</span>
				<span className="truncate text-textTertiary">{user.name}</span>
			</div>

			{/* Profile Card */}
			<div className="flex flex-col items-start gap-5 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-5 lg:flex-row lg:gap-6 lg:p-6">
				<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primaryLight text-xl font-extrabold text-primary sm:h-16 sm:w-16 sm:text-2xl">
					{user.name?.[0]?.toUpperCase() ?? "?"}
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
						<h1 className="text-xl font-extrabold text-textPrimary">{user.name}</h1>
						<span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusColor}`}>
							{userStatus}
						</span>
					</div>

					<div className="mt-1 flex flex-col gap-2 text-sm text-textSecondary sm:flex-row sm:flex-wrap sm:gap-3">
						<div className="flex items-center gap-1">
							<Mail className="h-3.5 w-3.5" /> {user.email}
						</div>
						<div className="flex items-center gap-1">
							<User className="h-3.5 w-3.5" /> {user.studentId}
						</div>
					</div>

					<div className="mt-2 text-sm text-textTertiary">
						{[user.department, user.university].filter((v) => v && v !== "—").join(" · ") || "—"}
					</div>

					<div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
						<div className="flex items-center gap-1 text-xs text-textTertiary">
							<Phone className="h-3.5 w-3.5" /> {user.phone}
						</div>
						<div className="flex items-center gap-1 text-xs text-textTertiary">
							<Calendar className="h-3.5 w-3.5" /> Joined {user.registered}
						</div>
						<div className="flex items-center gap-1 text-xs text-textTertiary">
							<Clock3 className="h-3.5 w-3.5" /> Last active {user.lastActive}
						</div>
					</div>

					<div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
						<div className="rounded-xl bg-surfaceVariant px-3 py-2 text-sm">
							Warnings:{" "}
							<span className="font-bold text-warning">{user.warnings}</span>
						</div>
						<div className="rounded-xl bg-surfaceVariant px-3 py-2 text-sm">
							Trust Score:{" "}
							<span className={`font-bold ${trustColor}`}>{trustScore}</span>
						</div>
					</div>
				</div>
			</div>

			{/* Verification Details */}
			<div className="rounded-2xl border border-borderLight bg-surface p-5 shadow-sm">
				<div className="mb-4 flex items-center gap-2">
					<Shield className="h-4 w-4 text-primary" />
					<h2 className="font-bold text-textPrimary">Verification Details</h2>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div className="rounded-xl bg-surfaceVariant/50 p-4">
						<div className="text-xs font-bold uppercase text-textTertiary">Submitted</div>
						<div className="mt-1 text-sm font-semibold text-textPrimary">
							{user.verificationSubmitted}
						</div>
					</div>
					<div className="rounded-xl bg-surfaceVariant/50 p-4">
						<div className="text-xs font-bold uppercase text-textTertiary">
							Provided Documents
						</div>
						<div className="mt-2 flex flex-wrap gap-2">
							{user.verificationDocs.length > 0 ? (
								user.verificationDocs.map((doc) => (
									<div
										key={doc}
										className="rounded-lg bg-primaryLight px-3 py-1.5 text-xs font-semibold text-primary">
										{doc}
									</div>
								))
							) : (
								<div className="text-sm font-medium text-textTertiary">None provided</div>
							)}
						</div>
					</div>
				</div>

				<div className="mt-6 border-t border-borderLight pt-5">
					<p className="mb-3 text-xs font-bold uppercase text-textTertiary">
						Student ID Card Image
					</p>
					{user.idCardDataUrl ? (
						<div className="max-w-sm overflow-hidden rounded-xl border border-borderLight">
							{idCardBlobUrl ? (
								<img
									src={idCardBlobUrl}
									alt="Student ID Card"
									className="max-h-[300px] w-full bg-surfaceVariant/30 object-contain"
								/>
							) : (
								<div className="flex h-32 w-full items-center justify-center bg-surfaceVariant/30 text-sm text-textTertiary">
									Loading image...
								</div>
							)}
						</div>
					) : (
						<div className="flex max-w-sm flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-borderLight bg-surfaceVariant/50 px-4 py-8 text-center">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
								<Shield className="h-5 w-5 text-textTertiary" />
							</div>
							<div className="mt-1 text-sm font-semibold text-textSecondary">
								No ID Card Uploaded
							</div>
							<div className="text-xs text-textTertiary">
								This user did not provide an ID card during registration.
							</div>
						</div>
					)}
				</div>

				<div className="mt-6 border-t border-borderLight pt-5">
					<label className="mb-2 block text-xs font-bold uppercase text-textTertiary">
						Admin Feedback
					</label>
					<textarea
						value={adminFeedback}
						onChange={(e) => setAdminFeedback(e.target.value)}
						placeholder="Write verification note or suspension reason..."
						className="w-full min-h-[100px] resize-none rounded-xl border border-outlineVariant bg-surface px-4 py-3 text-sm text-textPrimary outline-none focus:border-primary focus:ring-2 focus:ring-primary"
					/>

					{actionDone ? (
						<div className="mt-4 rounded-xl bg-successLight px-4 py-3 text-sm font-semibold text-success">
							{actionDone}
						</div>
					) : isPendingType ? (
						<div className="mt-4 flex items-center gap-3">
							<button
								onClick={handleVerify}
								className="rounded-xl bg-success px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90">
								Approve User
							</button>
							<button
								onClick={handleReject}
								className="rounded-xl bg-error px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90">
								Reject User
							</button>
						</div>
					) : (
						<div className="mt-4 flex items-center gap-3">
							{userStatus === "SUSPENDED" ? (
								<button
									onClick={handleReactivate}
									className="rounded-xl bg-success px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90">
									Reactivate User
								</button>
							) : (
								<button
									onClick={() => setSuspendModalOpen(true)}
									className="rounded-xl bg-error px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90">
									Suspend User
								</button>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Non-pending sections: trust score, activity, disputes */}
			{!isPendingType && (
				<>
					{/* Trust Score */}
					<div className="rounded-2xl border border-borderLight bg-surface p-5 shadow-sm">
						<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<h2 className="flex items-center gap-2 font-bold text-textPrimary">
								<Star className="h-4 w-4 text-success" /> Trust Score
							</h2>
							<button
								onClick={() => setAdjusting(!adjusting)}
								className="flex items-center gap-1.5 rounded-xl bg-primaryLight px-3 py-1.5 text-xs font-bold text-primary transition hover:opacity-90">
								<Edit2 className="h-3.5 w-3.5" /> Adjust Score
							</button>
						</div>

						<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
							<div className={`text-4xl font-extrabold ${trustColor}`}>{trustScore}</div>
							<div className="text-sm text-textSecondary">
								User reputation based on rental history, disputes, reviews, and platform
								activity.
							</div>
						</div>

						{adjusting && (
							<div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
								<input
									type="number"
									value={adjustment.value}
									onChange={(e) => setAdjustment({ ...adjustment, value: e.target.value })}
									placeholder="+10 or -5"
									className="rounded-xl border border-outlineVariant bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
								/>
								<input
									type="text"
									value={adjustment.reason}
									onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
									placeholder="Adjustment reason"
									className="rounded-xl border border-outlineVariant bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
								/>
								<button
									onClick={handleTrustAdjustment}
									className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-onPrimary transition hover:opacity-90">
									Apply Adjustment
								</button>
							</div>
						)}

						<div className="mt-6 space-y-3">
							{secondaryLoading ? (
								<div className="py-4 text-center text-sm text-textTertiary">
									Loading trust history…
								</div>
							) : user.trustLog.length === 0 ? (
								<div className="py-6 text-center text-sm text-textTertiary">
									No trust events recorded yet.
								</div>
							) : (
								user.trustLog.map((log, index) => (
									<div
										key={index}
										className="flex flex-col gap-3 rounded-xl bg-surfaceVariant/40 p-4 sm:flex-row sm:items-start sm:justify-between">
										<div className="flex items-start gap-3">
											<div
												className={`rounded-lg p-2 ${log.change > 0 ? "bg-successLight" : "bg-errorLight"}`}>
												{log.change > 0 ? (
													<TrendingUp className="h-4 w-4 text-success" />
												) : (
													<TrendingDown className="h-4 w-4 text-error" />
												)}
											</div>
											<div>
												<div className="text-sm font-semibold text-textPrimary">
													{log.reason}
												</div>
												<div className="mt-1 text-xs text-textTertiary">{log.date}</div>
											</div>
										</div>
										<div
											className={`text-sm font-bold ${log.change > 0 ? "text-success" : "text-error"}`}>
											{log.change > 0 ? "+" : ""}
											{log.change}
										</div>
									</div>
								))
							)}
						</div>
					</div>

					{/* User Activity */}
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
						{/* Bookings */}
						<div className="overflow-hidden rounded-2xl border border-borderLight bg-surface shadow-sm">
							<div className="flex items-center gap-2 border-b border-borderLight px-4 py-4 sm:px-5">
								<Bookmark className="h-4 w-4 text-primary" />
								<h2 className="font-bold text-textPrimary">Booking History</h2>
							</div>
							<div className="divide-y divide-borderLight">
								{user.bookings.length === 0 ? (
									<div className="px-5 py-8 text-center text-sm text-textTertiary">
										Booking history is not available here. View all platform bookings in
										the{" "}
										<Link
											href="/bookings"
											className="font-semibold text-primary hover:underline">
											Bookings
										</Link>{" "}
										section.
									</div>
								) : (
									user.bookings.map((booking) => (
										<div
											key={booking.id}
											className="flex flex-col gap-3 px-4 py-4 transition hover:bg-surfaceVariant/40 sm:flex-row sm:items-center sm:justify-between sm:px-5">
											<div>
												<div className="text-sm font-semibold text-textPrimary">
													{booking.item}
												</div>
												<div className="mt-1 text-xs text-textTertiary">
													{booking.id} · {booking.date}
												</div>
											</div>
											<div className="text-xs font-bold text-primary">{booking.status}</div>
										</div>
									))
								)}
							</div>
						</div>

						{/* Listed Items */}
						<div className="overflow-hidden rounded-2xl border border-borderLight bg-surface shadow-sm">
							<div className="flex items-center gap-2 border-b border-borderLight px-4 py-4 sm:px-5">
								<Package className="h-4 w-4 text-accent" />
								<h2 className="font-bold text-textPrimary">Listed Items</h2>
							</div>
							<div className="divide-y divide-borderLight">
								{user.items.length === 0 ? (
									<div className="px-5 py-8 text-center text-sm text-textTertiary">
										Listed items are not available here. View all items in the{" "}
										<Link
											href="/items"
											className="font-semibold text-primary hover:underline">
											Items
										</Link>{" "}
										section.
									</div>
								) : (
									user.items.map((item) => (
										<div
											key={item.id}
											className="flex flex-col gap-3 px-4 py-4 transition hover:bg-surfaceVariant/40 sm:flex-row sm:items-center sm:justify-between sm:px-5">
											<div>
												<div className="text-sm font-semibold text-textPrimary">
													{item.title}
												</div>
												<div className="mt-1 text-xs text-textTertiary">{item.id}</div>
											</div>
											<div className="text-left sm:text-right">
												<div className="text-sm font-bold text-primary">{item.price}</div>
												<div className="mt-1 text-xs font-semibold text-success">
													{item.status}
												</div>
											</div>
										</div>
									))
								)}
							</div>
						</div>
					</div>

					{/* Disputes */}
					<div className="overflow-hidden rounded-2xl border border-borderLight bg-surface shadow-sm">
						<div className="flex items-center gap-2 border-b border-borderLight px-4 py-4 sm:px-5">
							<ShieldAlert className="h-4 w-4 text-error" />
							<h2 className="font-bold text-textPrimary">Disputes & Reports</h2>
						</div>
						<div className="divide-y divide-borderLight">
							{secondaryLoading ? (
								<div className="px-5 py-8 text-center text-sm text-textTertiary">
									Loading disputes…
								</div>
							) : user.disputes.length === 0 ? (
								<div className="px-5 py-8 text-center text-sm text-textTertiary">
									No disputes on record for this user.
								</div>
							) : (
								user.disputes.map((dispute) => (
									<div
										key={dispute.id}
										className="flex flex-col gap-3 px-4 py-4 transition hover:bg-surfaceVariant/40 sm:flex-row sm:items-center sm:justify-between sm:px-5">
										<div>
											<div className="text-sm font-semibold text-textPrimary">
												{dispute.reason}
											</div>
											<div className="mt-1 text-xs text-textTertiary">
												{dispute.id} · Booking {dispute.booking} · {dispute.date}
											</div>
										</div>
										<div className="rounded-full bg-errorLight px-2.5 py-1 text-xs font-bold text-error">
											{dispute.status}
										</div>
									</div>
								))
							)}
						</div>
					</div>
				</>
			)}

			{/* Suspension info banner — shown when user is currently suspended */}
			{userStatus === "SUSPENDED" && user.suspensionType && (
				<div className="rounded-2xl border border-error/30 bg-errorLight p-5">
					<div className="flex items-center gap-2 font-bold text-error">
						<AlertTriangle className="h-4 w-4" /> Account Suspended
					</div>
					<div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
						<div>
							<span className="text-xs font-bold uppercase text-textTertiary">Duration</span>
							<p className="mt-0.5 font-semibold text-textPrimary">
								{{
									ONE_DAY: "1 Day",
									SEVEN_DAYS: "7 Days",
									THIRTY_DAYS: "30 Days",
									PERMANENT: "Permanent",
								}[user.suspensionType] ?? user.suspensionType}
							</p>
						</div>
						{user.suspendedUntil && (
							<div>
								<span className="text-xs font-bold uppercase text-textTertiary">Suspended Until</span>
								<p className="mt-0.5 font-semibold text-textPrimary">
									{formatShortDate(user.suspendedUntil)}
								</p>
							</div>
						)}
						{user.scheduledDeletionAt && (
							<div>
								<span className="text-xs font-bold uppercase text-textTertiary">
									Scheduled Deletion
								</span>
								<p className="mt-0.5 font-semibold text-error">
									{formatShortDate(user.scheduledDeletionAt)}
								</p>
							</div>
						)}
						{user.suspensionReason && (
							<div className="sm:col-span-2">
								<span className="text-xs font-bold uppercase text-textTertiary">Reason</span>
								<p className="mt-0.5 text-textPrimary">{user.suspensionReason}</p>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Admin Warning */}
			<div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warningLight p-5">
				<AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
				<div>
					<div className="font-bold text-warning">Administrative Note</div>
					<div className="mt-1 text-sm text-textSecondary">
						Always verify student information carefully before approval. Suspensions should
						include proper feedback and evidence for future moderation review.
					</div>
				</div>
			</div>

			{/* ── Suspension modal ─────────────────────────────────────────────────── */}
			{suspendModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
					<div className="w-full max-w-lg rounded-3xl border border-borderLight bg-surface shadow-2xl">
						<div className="flex items-center justify-between border-b border-borderLight px-5 py-4">
							<h2 className="text-lg font-bold text-textPrimary">Suspend Account</h2>
							<button
								onClick={() => { setSuspendModalOpen(false); setSuspensionReason(""); setSuspensionType("ONE_DAY"); }}
								className="rounded-xl p-2 transition hover:bg-surfaceVariant">
								<AlertTriangle className="h-5 w-5 text-error" />
							</button>
						</div>

						<div className="space-y-5 p-5">
							<p className="text-sm text-textSecondary">
								Suspending <span className="font-semibold text-textPrimary">{user.name}</span> will
								immediately invalidate their active session.
							</p>

							{/* Duration */}
							<div>
								<label className="mb-2 block text-xs font-bold uppercase tracking-wider text-textTertiary">
									Suspension Duration
								</label>
								<div className="grid grid-cols-2 gap-2">
									{SUSPENSION_OPTIONS.map((opt) => (
										<button
											key={opt.value}
											type="button"
											onClick={() => setSuspensionType(opt.value)}
											className={`rounded-xl border px-3 py-2.5 text-left transition ${
												suspensionType === opt.value
													? opt.value === "PERMANENT"
														? "border-error bg-errorLight text-error"
														: "border-primary bg-primaryLight text-primary"
													: "border-outlineVariant bg-surface text-textSecondary hover:bg-surfaceVariant"
											}`}>
											<div className="text-sm font-bold">{opt.label}</div>
											<div className="mt-0.5 text-xs opacity-70">{opt.description}</div>
										</button>
									))}
								</div>
								{suspensionType === "PERMANENT" && (
									<div className="mt-2 flex items-start gap-2 rounded-xl bg-errorLight px-3 py-2.5">
										<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
										<p className="text-xs text-error">
											This account will be permanently deleted after a 15-day retention period.
											This action cannot be undone.
										</p>
									</div>
								)}
							</div>

							{/* Reason */}
							<div>
								<label className="mb-2 block text-xs font-bold uppercase tracking-wider text-textTertiary">
									Suspension Reason <span className="text-error">*</span>
								</label>
								<textarea
									value={suspensionReason}
									onChange={(e) => setSuspensionReason(e.target.value)}
									placeholder="Describe the policy violation or reason for suspension..."
									className="w-full min-h-[100px] resize-none rounded-xl border border-outlineVariant bg-surface px-4 py-3 text-sm text-textPrimary outline-none focus:border-primary focus:ring-2 focus:ring-primary"
								/>
							</div>

							<div className="flex gap-3">
								<button
									onClick={() => { setSuspendModalOpen(false); setSuspensionReason(""); setSuspensionType("ONE_DAY"); }}
									className="flex-1 rounded-xl border border-outlineVariant bg-surface px-4 py-2.5 text-sm font-bold text-textSecondary transition hover:bg-surfaceVariant">
									Cancel
								</button>
								<button
									onClick={handleSuspend}
									disabled={!suspensionReason.trim()}
									className="flex-1 rounded-xl bg-error px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50">
									{suspensionType === "PERMANENT" ? "Permanently Suspend" : "Suspend User"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
