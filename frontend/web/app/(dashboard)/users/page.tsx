"use client";

import api from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatShortDate } from "@/lib/dateUtils";
import { extractErrorMessage } from "@/lib/errorUtils";
import { useToast } from "@/context/ToastContext";
import {
	Search,
	CheckCircle2,
	XCircle,
	Eye,
	Users,
	AlertTriangle,
	X,
	Info,
	RefreshCcw,
	ShieldOff,
} from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";

type UserStatus = "VERIFIED" | "PENDING" | "SUSPENDED";
type FilterType = "ALL" | UserStatus;
type ReviewMode = "APPROVE" | "REJECT" | "SUSPEND" | "REACTIVATE" | null;
type SuspensionType = "ONE_DAY" | "SEVEN_DAYS" | "THIRTY_DAYS" | "PERMANENT";

const SUSPENSION_OPTIONS: { value: SuspensionType; label: string;}[] = [
	{ value: "ONE_DAY",     label: "1 Day"},
	{ value: "SEVEN_DAYS",  label: "7 Days" },
	{ value: "THIRTY_DAYS", label: "30 Days" },
	{ value: "PERMANENT",   label: "Permanent"},
];

type AdminUser = {
	id: string;
	name: string;
	email: string;
	studentId: string;
	phone: string;
	university: string;
	department: string;
	idCardDataUrl?: string;
	status: UserStatus;
	trustScore: number;
	registered: string;
	warningCount: number;
	verificationSubmitted: string;
	documentCount: number;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function mapUserStatus(raw?: string): UserStatus {
	if (raw === "ACTIVE") return "VERIFIED";
	if (raw === "SUSPENDED") return "SUSPENDED";
	return "PENDING";
}

function extractPageContent<T>(payload: unknown): { data: T[]; totalPages: number } {
	const p = payload as any;
	if (Array.isArray(p?.content)) return { data: p.content, totalPages: p.totalPages ?? 1 };
	if (Array.isArray(p?.data?.content)) return { data: p.data.content, totalPages: p.data.totalPages ?? 1 };
	if (Array.isArray(p?.data)) return { data: p.data, totalPages: 1 };
	if (Array.isArray(p)) return { data: p as T[], totalPages: 1 };
	return { data: [], totalPages: 1 };
}

function mapNormalUser(u: any): AdminUser {
	return {
		id: String(u.userId ?? u.id ?? ""),
		name: u.name ?? "",
		email: u.email ?? "",
		phone: u.studentProfile?.phone ?? "—",
		studentId: u.studentProfile?.studentId ?? "—",
		university: u.studentProfile?.university ?? "—",
		department: u.studentProfile?.department ?? "—",
		idCardDataUrl: u.studentProfile?.idCardDataUrl ?? undefined,
		status: mapUserStatus(u.status),
		trustScore: u.studentProfile?.trustScore ?? 0,
		registered: formatShortDate(u.createdAt),
		warningCount: 0,
		verificationSubmitted: formatShortDate(u.createdAt),
		documentCount: u.studentProfile?.idCardDataUrl ? 1 : 0,
	};
}

function mapPendingUser(u: any): AdminUser {
	return {
		id: String(u.id ?? ""),
		name: u.name ?? "",
		email: u.email ?? "",
		phone: u.phone ?? "—",
		studentId: u.studentId ?? "—",
		university: u.university ?? "—",
		department: u.department ?? "—",
		idCardDataUrl: u.idCardDataUrl ?? undefined,
		status: "PENDING",
		trustScore: 0,
		registered: formatShortDate(u.createdAt),
		warningCount: 0,
		verificationSubmitted: formatShortDate(u.createdAt),
		documentCount: u.idCardDataUrl ? 1 : 0,
	};
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<UserStatus, string> = {
	VERIFIED: "bg-successLight text-success",
	PENDING: "bg-warningLight text-warning",
	SUSPENDED: "bg-errorLight text-error",
};

const WARNING_COLORS = ["text-success", "text-warning", "text-error", "text-error"];

const FILTERS: FilterType[] = ["ALL", "PENDING", "VERIFIED", "SUSPENDED"];

const SUMMARY_CARDS: { label: string; status: FilterType | null; color: string }[] = [
	{ label: "Pending Review", status: "PENDING", color: "text-warning" },
	{ label: "Verified", status: "VERIFIED", color: "text-success" },
	{ label: "Suspended", status: "SUSPENDED", color: "text-error" },
];

type ProfileMetric = {
	label: string;
	value: (u: AdminUser) => string | number;
	valueClassName?: (u: AdminUser) => string;
};

type VerificationField = {
	label: string;
	value: (u: AdminUser) => string;
};

const PROFILE_METRICS: ProfileMetric[] = [
	{ label: "Phone", value: (u) => u.phone },
	{ label: "Registered", value: (u) => u.registered },
	{
		label: "Warnings",
		value: (u) => u.warningCount,
		valueClassName: (u) => WARNING_COLORS[Math.min(u.warningCount, 3)],
	},
	{
		label: "Trust Score",
		value: (u) => (u.trustScore > 0 ? u.trustScore : "—"),
		valueClassName: (u) => getTrustColor(u.trustScore),
	},
];

const VERIFICATION_FIELDS: VerificationField[] = [
	{ label: "Name", value: (u) => u.name },
	{ label: "Email", value: (u) => u.email },
	{ label: "Phone", value: (u) => u.phone },
	{ label: "Student ID", value: (u) => u.studentId },
	{ label: "University", value: (u) => u.university },
	{ label: "Department", value: (u) => u.department },
	{ label: "Submitted", value: (u) => u.verificationSubmitted },
	{ label: "Documents", value: (u) => `${u.documentCount} uploaded` },
];

function getTrustColor(score: number) {
	if (score >= 90) return "text-success";
	if (score >= 50) return "text-primary";
	if (score > 0) return "text-warning";
	return "text-error";
}

function getTrustLabel(score: number) {
	if (score >= 90) return "Low risk";
	if (score >= 50) return "Moderate";
	if (score > 0) return "Needs review";
	return "Unverified";
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
	const searchParams = useSearchParams();
	const { toast } = useToast();

	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<FilterType>("ALL");
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [reviewMode, setReviewMode] = useState<ReviewMode>(null);
	const [decisionFeedback, setDecisionFeedback] = useState("");
	const [suspensionType, setSuspensionType] = useState<SuspensionType>("ONE_DAY");
	const [pageIndex, setPageIndex] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		const urlFilter = searchParams.get("filter") as FilterType | null;
		if (urlFilter && FILTERS.includes(urlFilter)) {
			setFilter(urlFilter);
		}
	}, [searchParams]);

	const fetchUsers = useCallback(
		async (page: number, currentFilter: FilterType) => {
			setLoading(true);
			try {
				if (currentFilter === "ALL") {
					// Pending users are prepended on page 0 only; regular users are paginated normally.
					const requests: Promise<any>[] = [api.get(`/users?page=${page}&size=10`)];
					if (page === 0) requests.push(api.get(`/admin/pending-users?page=0&size=10`));

					const results = await Promise.allSettled(requests);

					let normalUsers: AdminUser[] = [];
					let pendingUsers: AdminUser[] = [];
					let normalTotalPages = 1;

					if (results[0].status === "fulfilled") {
						const { data, totalPages: tp } = extractPageContent<any>(results[0].value.data);
						normalUsers = data.map(mapNormalUser);
						normalTotalPages = tp;
					}
					if (page === 0 && results[1]?.status === "fulfilled") {
						const { data } = extractPageContent<any>(
							(results[1] as PromiseFulfilledResult<any>).value.data,
						);
						pendingUsers = data.map(mapPendingUser);
					}

					setUsers([...pendingUsers, ...normalUsers]);
					setTotalPages(normalTotalPages);
				} else if (currentFilter === "PENDING") {
					const res = await api.get(`/admin/pending-users?page=${page}&size=10`);
					const { data, totalPages: tp } = extractPageContent<any>(res.data);
					setUsers(data.map(mapPendingUser));
					setTotalPages(tp);
				} else {
					// VERIFIED or SUSPENDED — fetch from /users and client-side filter by status
					const res = await api.get(`/users?page=${page}&size=10`);
					const { data, totalPages: tp } = extractPageContent<any>(res.data);
					setUsers(data.map(mapNormalUser));
					setTotalPages(tp);
				}
			} catch (err) {
				console.error("Failed to fetch users:", err);
				toast(extractErrorMessage(err), "error");
				setUsers([]);
			} finally {
				setLoading(false);
			}
		},
		[toast],
	);

	useEffect(() => {
		void fetchUsers(pageIndex, filter);
	}, [pageIndex, filter, fetchUsers]);

	const filteredUsers = useMemo(() => {
		const term = search.toLowerCase();
		return users.filter((u) => {
			const matchSearch =
				!term ||
				(u.name && u.name.toLowerCase().includes(term)) ||
				(u.email && u.email.toLowerCase().includes(term)) ||
				(u.studentId && u.studentId.toLowerCase().includes(term));
			const matchFilter = filter === "ALL" || u.status === filter;
			return matchSearch && matchFilter;
		});
	}, [users, search, filter]);

	const selectedUser = useMemo(
		() => users.find((u) => u.id === selectedUserId) ?? null,
		[users, selectedUserId],
	);

	const [idCardBlobUrl, setIdCardBlobUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!selectedUser?.idCardDataUrl) {
			setIdCardBlobUrl(null);
			return;
		}

		const url = selectedUser.idCardDataUrl;
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
	}, [selectedUser?.idCardDataUrl]);

	const openReview = (userId: string, mode: ReviewMode) => {
		setSelectedUserId(userId);
		setReviewMode(mode);
		setDecisionFeedback("");
		setSuspensionType("ONE_DAY");
	};

	const closeModal = () => {
		setSelectedUserId(null);
		setReviewMode(null);
		setDecisionFeedback("");
		setSuspensionType("ONE_DAY");
	};

	const approveUser = async () => {
		if (!selectedUser) return;
		setSubmitting(true);
		try {
			await api.post(`/admin/approve/${selectedUser.id}`);
			toast("User approved successfully.");
			await fetchUsers(pageIndex, filter);
			closeModal();
		} catch (err) {
			toast(extractErrorMessage(err), "error");
		} finally {
			setSubmitting(false);
		}
	};

	const rejectUser = async () => {
		if (!selectedUser) return;
		setSubmitting(true);
		try {
			await api.post(`/admin/reject/${selectedUser.id}`, {
				reason: decisionFeedback || "Rejected by admin",
			});
			toast("User rejected.");
			await fetchUsers(pageIndex, filter);
			closeModal();
		} catch (err) {
			toast(extractErrorMessage(err), "error");
		} finally {
			setSubmitting(false);
		}
	};

	const suspendUser = async () => {
		if (!selectedUser) return;
		if (!decisionFeedback.trim()) {
			toast("Suspension reason is required.", "error");
			return;
		}
		if (suspensionType === "PERMANENT") {
			const confirmed = window.confirm(
				`⚠️ Permanent suspension will schedule ${selectedUser.name}'s account for deletion after 15 days. This cannot be undone. Continue?`
			);
			if (!confirmed) return;
		}
		setSubmitting(true);
		try {
			await api.post(`/admin/block/${selectedUser.id}`, {
				suspensionType,
				reason: decisionFeedback.trim(),
			});
			toast("User suspended.");
			await fetchUsers(pageIndex, filter);
			closeModal();
		} catch (err) {
			toast(extractErrorMessage(err), "error");
		} finally {
			setSubmitting(false);
		}
	};

	const reactivateUser = async (userId: string) => {
		setSubmitting(true);
		try {
			await api.post(`/admin/unblock/${userId}`);
			toast("User reactivated.");
			await fetchUsers(pageIndex, filter);
			closeModal();
		} catch (err) {
			toast(extractErrorMessage(err), "error");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="mx-auto max-w-7xl space-y-6 px-4 pb-20 sm:px-6 lg:px-8">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary">User Management</h1>
					<p className="mt-1 text-sm text-textSecondary">
						Manage student accounts, verifications, and suspensions.
					</p>
				</div>
				<div className="flex w-full items-center gap-2 rounded-xl border border-borderLight bg-surface px-3 py-2 text-sm text-textSecondary shadow-sm sm:w-auto">
					<Users className="h-4 w-4" />
					<span className="font-bold text-textPrimary">{users.length}</span>
					<span>on this page</span>
				</div>
			</div>

			{/* Stat cards */}
			<div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
				{SUMMARY_CARDS.map((card) => (
					<div
						key={card.label}
						className="rounded-2xl border border-borderLight bg-surface p-4 shadow-sm">
						<div className="text-xs font-semibold uppercase tracking-wider text-textTertiary">
							{card.label}
						</div>
						<div className={`mt-2 text-2xl font-bold ${card.color}`}>
							{card.status
								? users.filter((u) => u.status === card.status).length
								: users.filter((u) => u.warningCount > 0).length}
						</div>
					</div>
				))}
			</div>

			{/* Search + filter */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start">
				<div className="relative min-w-0 flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textTertiary" />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by name, email, or student ID..."
						className="w-full rounded-xl border border-outlineVariant bg-surface py-2.5 pl-9 pr-4 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
					/>
				</div>
				<div className="flex flex-wrap gap-2">
					{FILTERS.map((f) => (
						<button
							key={f}
							onClick={() => {
								setPageIndex(0);
								setFilter(f);
							}}
							className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
								filter === f
									? "border-primary bg-primary text-onPrimary shadow"
									: "border-outlineVariant bg-surface text-textSecondary hover:bg-surfaceVariant"
							}`}>
							{f}
						</button>
					))}
				</div>
			</div>

			<div className="text-xs text-textTertiary">
				Note: Search and filtering apply only to the current page.
				{filter === "ALL" && " Pending users appear first on page 1."}
			</div>

			{/* Table */}
			<div className="overflow-x-auto rounded-2xl border border-borderLight bg-surface shadow-sm">
				<div className="min-w-full">
					<DataTable
						columns={[
							{
								header: "Student",
								cell: (u) => (
									<div className="flex min-w-0 items-center gap-3">
										<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primaryLight text-sm font-bold text-primary">
											{u.name?.[0]?.toUpperCase() ?? "?"}
										</div>
										<div className="min-w-0">
											<div className="break-words font-semibold text-textPrimary">{u.name}</div>
											<div className="break-all text-xs text-textTertiary">{u.email}</div>
										</div>
									</div>
								),
							},
							{
								header: "Student ID",
								cell: (u) => (
									<span className="break-all font-mono text-xs text-textSecondary">
										{u.studentId}
									</span>
								),
							},
							{
								header: "Status",
								cell: (u) => (
									<span
										className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_COLORS[u.status]}`}>
										{u.status}
									</span>
								),
							},
							{
								header: "Trust",
								cell: (u) => (
									<div className="space-y-1">
										<div className={`text-sm font-bold ${getTrustColor(u.trustScore)}`}>
											{u.trustScore > 0 ? u.trustScore : "—"}
										</div>
										<div className="text-xs text-textTertiary">
											{getTrustLabel(u.trustScore)}
										</div>
									</div>
								),
							},
							{
								header: "Joined",
								cell: (u) => (
									<span className="text-xs text-textSecondary">{u.registered}</span>
								),
							},
							{
								header: "Actions",
								cell: (u) => (
									<div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
										{u.status === "PENDING" && (
											<>
												<button
													type="button"
													onClick={() => openReview(u.id, "APPROVE")}
													className="flex items-center gap-1 rounded-lg bg-success px-2.5 py-1.5 text-xs font-bold text-white transition hover:opacity-90">
													<CheckCircle2 className="h-3.5 w-3.5" /> Approve
												</button>
												<button
													type="button"
													onClick={() => openReview(u.id, "REJECT")}
													className="flex items-center gap-1 rounded-lg bg-errorLight px-2.5 py-1.5 text-xs font-bold text-error transition hover:bg-error/20">
													<XCircle className="h-3.5 w-3.5" /> Reject
												</button>
											</>
										)}
										{u.status === "VERIFIED" && (
											<button
												type="button"
												onClick={() => openReview(u.id, "SUSPEND")}
												className="flex items-center gap-1 rounded-lg bg-errorLight px-2.5 py-1.5 text-xs font-bold text-error transition hover:bg-error/20">
												<ShieldOff className="h-3.5 w-3.5" /> Suspend
											</button>
										)}
										{u.status === "SUSPENDED" && (
											<button
												type="button"
												onClick={() => openReview(u.id, "REACTIVATE")}
												className="flex items-center gap-1 rounded-lg bg-successLight px-2.5 py-1.5 text-xs font-bold text-success transition hover:bg-success/20">
												<RefreshCcw className="h-3.5 w-3.5" /> Reactivate
											</button>
										)}
										<Link
											href={`/users/${u.id}${u.status === "PENDING" ? "?type=pending" : ""}`}
											className="flex items-center gap-1 rounded-lg bg-surfaceVariant px-2.5 py-1.5 text-xs font-bold text-textSecondary transition hover:bg-borderLight">
											<Eye className="h-3.5 w-3.5" /> Profile
										</Link>
									</div>
								),
							},
						]}
						data={filteredUsers}
						pageIndex={pageIndex}
						totalPages={totalPages}
						onPageChange={setPageIndex}
						isLoading={loading}
						emptyMessage="No users match your search."
						emptyDescription="Try adjusting your search query or filter."
					/>
				</div>
			</div>

			{/* Modal */}
			{selectedUser && (
				<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm sm:items-center sm:p-6">
					<div className="w-full max-w-4xl overflow-y-auto rounded-3xl border border-borderLight bg-surface shadow-2xl max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-3rem)]">
						{/* Modal header */}
						<div className="flex flex-col gap-3 border-b border-borderLight px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
							<div className="min-w-0">
								<div className="flex items-center gap-2">
									<h2 className="truncate text-lg font-bold text-textPrimary">
										{selectedUser.name}
									</h2>
									<span
										className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_COLORS[selectedUser.status]}`}>
										{selectedUser.status}
									</span>
								</div>
								<p className="mt-1 truncate text-sm text-textSecondary">
									{selectedUser.email}
								</p>
							</div>
							<button
								type="button"
								onClick={closeModal}
								className="rounded-xl p-2 transition hover:bg-surfaceVariant"
								aria-label="Close modal">
								<X className="h-5 w-5 text-textSecondary" />
							</button>
						</div>

						<div className="grid grid-cols-1 gap-0 lg:grid-cols-3">
							{/* Left: profile info + verification */}
							<div className="space-y-5 border-b border-borderLight p-4 sm:p-5 lg:col-span-2 lg:border-b-0 lg:border-r">
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									{PROFILE_METRICS.map((metric) => {
										const value = metric.value(selectedUser);
										const valueClassName =
											metric.valueClassName?.(selectedUser) ?? "text-textPrimary";
										return (
											<div
												key={metric.label}
												className="rounded-2xl bg-surfaceVariant/40 p-4">
												<div className="text-xs font-semibold uppercase tracking-wider text-textTertiary">
													{metric.label}
												</div>
												<div className={`mt-1 font-semibold ${valueClassName}`}>
													{value}
												</div>
											</div>
										);
									})}
								</div>

								<div className="rounded-2xl bg-surfaceVariant/30 p-4">
									<div className="mb-3 flex items-center gap-2 text-sm font-bold text-textPrimary">
										<Info className="h-4 w-4 text-primary" />
										Provided verification info
									</div>
									<div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
										{VERIFICATION_FIELDS.map((field) => (
											<div key={field.label}>
												<div className="text-xs text-textTertiary">{field.label}</div>
												<div className="font-medium text-textPrimary">
													{field.value(selectedUser)}
												</div>
											</div>
										))}
									</div>

									{selectedUser.idCardDataUrl ? (
										<div className="mt-4">
											<div className="mb-2 text-xs font-semibold uppercase tracking-wider text-textTertiary">
												Student ID card
											</div>
											{idCardBlobUrl ? (
												<img
													src={idCardBlobUrl}
													alt="Submitted student ID card"
													className="max-h-80 w-full rounded-xl border border-borderLight bg-surface object-contain"
												/>
											) : (
												<div className="flex h-32 w-full items-center justify-center rounded-xl border border-borderLight bg-surfaceVariant/30 text-sm text-textTertiary">
													Loading image...
												</div>
											)}
										</div>
									) : (
										<div className="mt-4 text-xs text-textTertiary">
											No submitted ID‑card image available for this user.
										</div>
									)}
								</div>
							</div>

							{/* Right: decision panel */}
							<div className="space-y-4 p-4 sm:p-5">
								<div className="flex items-center gap-2 text-sm font-bold text-textPrimary">
									<AlertTriangle className="h-4 w-4 text-warning" />
									Admin decision
								</div>

								<div className="text-sm text-textSecondary">
									{reviewMode === "APPROVE" &&
										"Approve after checking that the information matches."}
									{reviewMode === "REJECT" &&
										"Reject with feedback if information is incomplete or invalid."}
									{reviewMode === "SUSPEND" &&
										"Suspend if the user misused the platform or violated policy."}
									{reviewMode === "REACTIVATE" &&
										"Reactivate this account after the issue is resolved."}
									{reviewMode === null &&
										"Open this profile to review details or take action."}
								</div>

								{/* Suspension duration — only shown for SUSPEND mode */}
								{reviewMode === "SUSPEND" && (
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
													className={`rounded-xl border px-3 py-2 text-left transition ${
														suspensionType === opt.value
															? opt.value === "PERMANENT"
																? "border-error bg-errorLight text-error"
																: "border-primary bg-primaryLight text-primary"
															: "border-outlineVariant bg-surface text-textSecondary hover:bg-surfaceVariant"
													}`}>
													<div className="text-xs font-bold">{opt.label}</div>
												</button>
											))}
										</div>
										{suspensionType === "PERMANENT" && (
											<div className="mt-2 flex items-start gap-2 rounded-xl bg-errorLight px-3 py-2">
												<AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-error" />
												<p className="text-xs text-error">
													Account will be permanently deleted after a 15-day retention period.
												</p>
											</div>
										)}
									</div>
								)}

								<div>
									<label className="mb-2 block text-xs font-bold uppercase tracking-wider text-textTertiary">
										{reviewMode === "REJECT"
											? "Rejection reason"
											: reviewMode === "SUSPEND"
												? "Suspension reason (required)"
												: "Feedback"}
									</label>
									<textarea
										value={decisionFeedback}
										onChange={(e) => setDecisionFeedback(e.target.value)}
										placeholder={
											reviewMode === "SUSPEND"
												? "Describe the policy violation or reason for suspension..."
												: "Write a short reason or feedback..."
										}
										className="min-h-32 w-full resize-none rounded-xl border border-outlineVariant bg-surface px-3 py-2 text-sm text-textPrimary outline-none focus:ring-2 focus:ring-primary"
									/>
								</div>

								<div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
									{selectedUser.status === "PENDING" && (
										<>
											<button
												type="button"
												onClick={approveUser}
												disabled={submitting}
												className="flex w-full items-center justify-center gap-2 rounded-xl bg-success px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60">
												<CheckCircle2 className="h-4 w-4" /> Approve
											</button>
											<button
												type="button"
												onClick={rejectUser}
												disabled={submitting}
												className="flex w-full items-center justify-center gap-2 rounded-xl bg-errorLight px-4 py-2.5 text-sm font-bold text-error transition hover:bg-error/20 disabled:opacity-60">
												<XCircle className="h-4 w-4" /> Reject
											</button>
										</>
									)}

									{selectedUser.status === "VERIFIED" && (
										<button
											type="button"
											onClick={suspendUser}
											disabled={submitting}
											className="flex w-full items-center justify-center gap-2 rounded-xl bg-errorLight px-4 py-2.5 text-sm font-bold text-error transition hover:bg-error/20 disabled:opacity-60">
											<ShieldOff className="h-4 w-4" /> Suspend
										</button>
									)}

									{selectedUser.status === "SUSPENDED" && (
										<button
											type="button"
											onClick={() => reactivateUser(selectedUser.id)}
											disabled={submitting}
											className="flex w-full items-center justify-center gap-2 rounded-xl bg-successLight px-4 py-2.5 text-sm font-bold text-success transition hover:bg-success/20 disabled:opacity-60">
											<RefreshCcw className="h-4 w-4" /> Reactivate
										</button>
									)}

									<Link
										href={`/users/${selectedUser.id}${selectedUser.status === "PENDING" ? "?type=pending" : ""}`}
										className="flex w-full items-center justify-center gap-2 rounded-xl bg-surfaceVariant px-4 py-2.5 text-sm font-bold text-textSecondary transition hover:bg-borderLight"
										onClick={closeModal}>
										<Eye className="h-4 w-4" /> Full Profile
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
