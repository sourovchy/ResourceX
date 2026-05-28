"use client";
import api from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import {
	Search,
	CheckCircle2,
	XCircle,
	Eye,
	Users,
	Clock,
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

type AdminUser = {
	id: string;
	name: string;
	email: string;
	studentId: string;
	phone?: string;
	university?: string;
	department?: string;
	idCardFileName?: string;
	idCardDataUrl?: string;
	status: UserStatus;
	trustScore: number;
	bookings: number;
	registered: string;
	lastActive: string;
	warningCount: number;
	suspensionReason?: string;
	suspensionPeriod?: string;
	verificationSubmitted: string;
	documentCount: number;
	note?: string;
};

const STATUS_MAP: Record<string, UserStatus> = {
	PENDING_VERIFICATION: "PENDING",
	PENDING_APPROVAL: "PENDING",
	APPROVED: "VERIFIED",
};

const STATUS_COLORS: Record<UserStatus, string> = {
	VERIFIED: "bg-successLight text-success",
	PENDING: "bg-warningLight text-warning",
	SUSPENDED: "bg-errorLight text-error",
};

const WARNING_COLORS = [
	"text-success",
	"text-warning",
	"text-error",
	"text-error",
];

const FILTERS: FilterType[] = [
	"ALL",
	"PENDING",
	"VERIFIED",
	"SUSPENDED",
];

const SUMMARY_CARDS: {
	label: string;
	status: FilterType | null;
	color: string;
}[] = [
	{ label: "Pending Review", status: "PENDING", color: "text-warning" },
	{ label: "Verified", status: "VERIFIED", color: "text-success" },
	{ label: "Suspended", status: "SUSPENDED", color: "text-error" },
	{ label: "Flagged", status: null, color: "text-primary" },
];

type ProfileMetric = {
	label: string;
	value: (user: AdminUser) => string | number;
	valueClassName?: (user: AdminUser) => string;
};

type VerificationField = {
	label: string;
	value: (user: AdminUser) => string;
};

const PROFILE_METRICS: ProfileMetric[] = [
	{ label: "Student ID", value: (user) => user.studentId },
	{ label: "Registered", value: (user) => user.registered },
	{ label: "Last Active", value: (user) => user.lastActive },
	{ label: "Bookings", value: (user) => user.bookings },
	{
		label: "Warnings",
		value: (user) => user.warningCount,
		valueClassName: (user) => WARNING_COLORS[Math.min(user.warningCount, 3)],
	},
	{
		label: "Trust Score",
		value: (user) => (user.trustScore > 0 ? user.trustScore : "—"),
		valueClassName: (user) => getTrustColor(user.trustScore),
	},
];

const VERIFICATION_FIELDS: VerificationField[] = [
	{ label: "Name", value: (user) => user.name },
	{ label: "Email", value: (user) => user.email },
	{ label: "Phone", value: (user) => user.phone || "Not provided" },
	{ label: "Student ID", value: (user) => user.studentId },
	{ label: "Submitted", value: (user) => user.verificationSubmitted },
	{ label: "University", value: (user) => user.university || "Not provided" },
	{ label: "Department", value: (user) => user.department || "Not provided" },
	{ label: "Documents", value: (user) => `${user.documentCount} uploaded` },
	{ label: "Notes", value: (user) => user.note || "No admin note yet." },
];

function getTrustColor(trustScore: number) {
	if (trustScore >= 90) return "text-success";
	if (trustScore >= 50) return "text-primary";
	if (trustScore > 0) return "text-warning";
	return "text-textTertiary";
}

function getTrustLabel(trustScore: number) {
	if (trustScore >= 90) return "Low risk";
	if (trustScore >= 50) return "Moderate";
	if (trustScore > 0) return "Needs review";
	return "Unverified";
}

export default function AdminUsersPage() {
	const searchParams = useSearchParams();

	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<FilterType>("ALL");
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const urlFilter = searchParams.get("filter") as FilterType | null;
		if (urlFilter && FILTERS.includes(urlFilter)) {
			setFilter(urlFilter);
		} else {
			setFilter("ALL");
		}
	}, [searchParams]);

	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [reviewMode, setReviewMode] = useState<ReviewMode>(null);
	const [decisionFeedback, setDecisionFeedback] = useState("");
	const [suspensionPeriod, setSuspensionPeriod] = useState("7 days");
	const [pageIndex, setPageIndex] = useState(0);
	const [totalPages, setTotalPages] = useState(0);

	const fetchUsers = async (page: number, currentFilter: FilterType) => {
		setLoading(true);
		try {
			let combinedMappedUsers: AdminUser[] = [];
			let maxTotalPages = 1;

			if (currentFilter === "ALL") {
				const [resNormal, resPending] = await Promise.all([
					api.get(`/users?page=${page}&size=10`),
					api.get(`/admin/pending-users?page=${page}&size=10`),
				]);

				let dataNormal = [];
				if (resNormal.data?.data?.content) {
					dataNormal = resNormal.data.data.content;
					maxTotalPages = Math.max(
						maxTotalPages,
						resNormal.data.data.totalPages || 0,
					);
				} else if (Array.isArray(resNormal.data?.content)) {
					dataNormal = resNormal.data.content;
					maxTotalPages = Math.max(
						maxTotalPages,
						resNormal.data.totalPages || 0,
					);
				} else if (Array.isArray(resNormal.data)) {
					dataNormal = resNormal.data;
				}

				const mappedNormal = dataNormal.map((u: any) => ({
					id: u.userId?.toString() || u.id?.toString(),
					name: u.name,
					email: u.email,
					phone: u.studentProfile?.phone || "N/A",
					studentId: u.studentProfile?.studentId || "N/A",
					university: u.studentProfile?.university || "N/A",
					department: u.studentProfile?.department || "N/A",
					idCardDataUrl:
						u.studentProfile?.idCardDataUrl || u.avatarUrl || undefined,
					status:
						u.status === "ACTIVE"
							? "VERIFIED"
							: u.status === "SUSPENDED"
								? "SUSPENDED"
								: "SUSPENDED",
					trustScore: u.studentProfile?.trustScore || 0,
					bookings: 0,
					registered: new Date(u.createdAt).toLocaleDateString(),
					lastActive: "N/A",
					warningCount: 0,
					verificationSubmitted: new Date(u.createdAt).toLocaleDateString(),
					documentCount: u.studentProfile?.idCardDataUrl ? 1 : 0,
					note: "Standard user",
				}));

				let dataPending = [];
				if (resPending.data?.data?.content) {
					dataPending = resPending.data.data.content;
					maxTotalPages = Math.max(
						maxTotalPages,
						resPending.data.data.totalPages || 0,
					);
				} else if (Array.isArray(resPending.data?.content)) {
					dataPending = resPending.data.content;
					maxTotalPages = Math.max(
						maxTotalPages,
						resPending.data.totalPages || 0,
					);
				} else if (Array.isArray(resPending.data)) {
					dataPending = resPending.data;
				}

				const mappedPending = dataPending.map((u: any) => ({
					id: u.id?.toString(),
					name: u.name,
					email: u.email,
					phone: u.phone || "N/A",
					studentId: u.studentId || "N/A",
					university: u.university || "N/A",
					department: u.department || "N/A",
					idCardDataUrl: u.idCardDataUrl || undefined,
					status: "PENDING",
					trustScore: 0,
					bookings: 0,
					registered: new Date(u.createdAt).toLocaleDateString(),
					lastActive: "N/A",
					warningCount: 0,
					verificationSubmitted: new Date(u.createdAt).toLocaleDateString(),
					documentCount: u.idCardDataUrl ? 1 : 0,
					note: "Awaiting admin review",
				}));

				combinedMappedUsers = [...mappedPending, ...mappedNormal];
				setTotalPages(maxTotalPages);
			} else {
				const isPending = currentFilter === "PENDING";
				const endpoint = isPending
					? `/admin/pending-users?page=${page}&size=10`
					: `/users?page=${page}&size=10`;

				const res = await api.get(endpoint);
				const payload = res.data;

				let data = [];
				if (payload?.data?.content) {
					data = payload.data.content;
					setTotalPages(payload.data.totalPages || 0);
				} else if (Array.isArray(payload?.data)) {
					data = payload.data;
					setTotalPages(1);
				} else if (Array.isArray(payload)) {
					data = payload;
					setTotalPages(1);
				} else if (Array.isArray(payload?.content)) {
					data = payload.content;
					setTotalPages(payload.totalPages || 0);
				}

				combinedMappedUsers = data.map((u: any) => {
					if (isPending) {
						return {
							id: u.id?.toString(),
							name: u.name,
							email: u.email,
							phone: u.phone || "N/A",
							studentId: u.studentId || "N/A",
							university: u.university || "N/A",
							department: u.department || "N/A",
							idCardDataUrl: u.idCardDataUrl || undefined,
							status: "PENDING",
							trustScore: 0,
							bookings: 0,
							registered: new Date(u.createdAt).toLocaleDateString(),
							lastActive: "N/A",
							warningCount: 0,
							verificationSubmitted: new Date(u.createdAt).toLocaleDateString(),
							documentCount: u.idCardDataUrl ? 1 : 0,
							note: "Awaiting admin review",
						};
					}

					return {
						id: u.userId?.toString() || u.id?.toString(),
						name: u.name,
						email: u.email,
						phone: u.studentProfile?.phone || "N/A",
						studentId: u.studentProfile?.studentId || "N/A",
						university: u.studentProfile?.university || "N/A",
						department: u.studentProfile?.department || "N/A",
						idCardDataUrl:
							u.studentProfile?.idCardDataUrl || u.avatarUrl || undefined,
						status:
							u.status === "ACTIVE"
								? "VERIFIED"
								: u.status === "SUSPENDED"
									? "SUSPENDED"
									: "SUSPENDED",
						trustScore: u.studentProfile?.trustScore || 0,
						bookings: 0,
						registered: new Date(u.createdAt).toLocaleDateString(),
						lastActive: "N/A",
						warningCount: 0,
						verificationSubmitted: new Date(u.createdAt).toLocaleDateString(),
						documentCount: u.studentProfile?.idCardDataUrl ? 1 : 0,
						note: "Standard user",
					};
				});
			}

			setUsers(combinedMappedUsers);
		} catch (err) {
			console.error("Failed to fetch users:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers(pageIndex, filter);
	}, [pageIndex, filter]);

	const filteredUsers = useMemo(() => {
		return users.filter((u) => {
			const term = search.toLowerCase();
			const matchSearch =
				u.name.toLowerCase().includes(term) ||
				u.email.toLowerCase().includes(term) ||
				u.studentId.toLowerCase().includes(term);

			const matchFilter = filter === "ALL" || u.status === filter;
			return matchSearch && matchFilter;
		});
	}, [users, search, filter]);

	const selectedUser = useMemo(
		() => users.find((u) => u.id === selectedUserId) ?? null,
		[users, selectedUserId],
	);

	const openReview = (userId: string, mode: ReviewMode) => {
		setSelectedUserId(userId);
		setReviewMode(mode);
		setDecisionFeedback("");
		setSuspensionPeriod("7 days");
	};

	const closeModal = () => {
		setSelectedUserId(null);
		setReviewMode(null);
		setDecisionFeedback("");
		setSuspensionPeriod("7 days");
	};

	const approveUser = async () => {
		if (!selectedUser) return;

		try {
			await api.post(`/admin/approve/${selectedUser.id}`);
			fetchUsers(pageIndex, filter);
			closeModal();
		} catch (err) {
			console.error("Failed to approve user:", err);
			alert("Failed to approve user");
		}
	};

	const rejectUser = async () => {
		if (!selectedUser) return;

		try {
			await api.post(`/admin/reject/${selectedUser.id}`);
			fetchUsers(pageIndex, filter);
			closeModal();
		} catch (err) {
			console.error("Failed to reject user:", err);
			alert("Failed to reject user");
		}
	};

	const suspendUser = async () => {
		if (!selectedUser) return;
		try {
			await api.post(`/admin/block/${selectedUser.id}`);
			fetchUsers(pageIndex, filter);
			closeModal();
		} catch (err) {
			console.error(err);
		}
	};

	const reactivateUser = async (userId: string) => {
		try {
			await api.post(`/admin/unblock/${userId}`);
			fetchUsers(pageIndex, filter);
			closeModal();
		} catch (err) {
			console.error(err);
		}
	};


	return (
		<div className="mx-auto max-w-7xl space-y-6 px-4 pb-20 sm:px-6 lg:px-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary">
						User Management
					</h1>
					<p className="mt-1 text-sm text-textSecondary">
						Manage student accounts, verifications, and suspensions.
					</p>
				</div>

				<div className="flex w-full items-center gap-2 rounded-xl border border-borderLight bg-surface px-3 py-2 text-sm text-textSecondary shadow-sm sm:w-auto">
					<Users className="h-4 w-4" />
					<span className="font-bold text-textPrimary">{users.length}</span>
					<span>total users</span>
				</div>
			</div>

			{/* Stat cards – 2 columns on mobile, 4 on desktop (matching AdminHomePage) */}
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

			{/* Search + filter row – responsive, filters wrap on mobile (pattern from AdminBookingsPage) */}
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
							onClick={() => setFilter(f)}
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

			<div className="mb-4 text-xs text-textTertiary">
				Note: Search and filtering apply only to the current page.
			</div>

			<div className="overflow-x-auto rounded-2xl border border-borderLight bg-surface shadow-sm">
				<div className="min-w-full">
					<DataTable
						columns={[
							{
								header: "Student",
								cell: (u) => (
									<div className="flex min-w-0 items-center gap-3">
										<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primaryLight text-sm font-bold text-primary">
											{u.name[0]}
										</div>
										<div className="min-w-0">
											<div className="break-words font-semibold text-textPrimary">
												{u.name}
											</div>
											<div className="break-all text-xs text-textTertiary">
												{u.email}
											</div>
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
										<div
											className={`text-sm font-bold ${getTrustColor(u.trustScore)}`}>
											{u.trustScore > 0 ? u.trustScore : "—"}
										</div>
										<div className="text-xs text-textTertiary">
											{getTrustLabel(u.trustScore)}
										</div>
									</div>
								),
							},
							{
								header: "Warnings",
								cell: (u) => (
									<span className="text-sm font-semibold text-textSecondary">
										{u.warningCount}
									</span>
								),
							},
							{
								header: "Bookings",
								accessorKey: "bookings",
							},
							{
								header: "Last Active",
								cell: (u) => (
									<span className="text-xs text-textSecondary">
										{u.lastActive}
									</span>
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
													<CheckCircle2 className="h-3.5 w-3.5" />
													Approve
												</button>
												<button
													type="button"
													onClick={() => openReview(u.id, "REJECT")}
													className="flex items-center gap-1 rounded-lg bg-errorLight px-2.5 py-1.5 text-xs font-bold text-error transition hover:bg-error/20">
													<XCircle className="h-3.5 w-3.5" />
													Reject
												</button>
											</>
										)}

										{u.status === "VERIFIED" && (
											<button
												type="button"
												onClick={() => openReview(u.id, "SUSPEND")}
												className="flex items-center gap-1 rounded-lg bg-errorLight px-2.5 py-1.5 text-xs font-bold text-error transition hover:bg-error/20">
												<ShieldOff className="h-3.5 w-3.5" />
												Suspend
											</button>
										)}

										{u.status === "SUSPENDED" && (
											<button
												type="button"
												onClick={() => openReview(u.id, "REACTIVATE")}
												className="flex items-center gap-1 rounded-lg bg-successLight px-2.5 py-1.5 text-xs font-bold text-success transition hover:bg-success/20">
												<RefreshCcw className="h-3.5 w-3.5" />
												Reactivate
											</button>
										)}


										<button
											type="button"
											onClick={() => openReview(u.id, null)}
											className="flex items-center gap-1 rounded-lg bg-surfaceVariant px-2.5 py-1.5 text-xs font-bold text-textSecondary transition hover:bg-borderLight">
											<Eye className="h-3.5 w-3.5" />
											View
										</button>
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

			{/* Modal – unchanged apart from small spacing adjustments */}
			{selectedUser && (
				<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm sm:items-center sm:p-6">
					<div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-borderLight bg-surface shadow-2xl max-h-[calc(100vh-1.5rem)] overflow-y-auto sm:max-h-[calc(100vh-3rem)]">
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
							<div className="space-y-5 border-b border-borderLight p-4 sm:p-5 lg:col-span-2 lg:border-b-0 lg:border-r">
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									{PROFILE_METRICS.map((metric) => {
										const value = metric.value(selectedUser);
										const valueClassName =
											metric.valueClassName?.(selectedUser) ??
											"text-textPrimary";

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
												<div className="text-xs text-textTertiary">
													{field.label}
												</div>
												<div className="font-medium text-textPrimary">
													{field.value(selectedUser)}
												</div>
											</div>
										))}
									</div>

									{selectedUser.idCardDataUrl ? (
										<div className="mt-4">
											<div className="mb-2 text-xs font-semibold uppercase tracking-wider text-textTertiary">
												Student ID card · {selectedUser.idCardFileName}
											</div>
											<img
												src={selectedUser.idCardDataUrl}
												alt="Submitted student ID card"
												className="max-h-80 w-full rounded-xl border border-borderLight bg-surface object-contain"
											/>
										</div>
									) : (
										<div className="mt-4 text-xs text-textTertiary">
											No submitted ID‑card image available for this user.
										</div>
									)}
								</div>
							</div>

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

								<div>
									<label className="mb-2 block text-xs font-bold uppercase tracking-wider text-textTertiary">
										Feedback
									</label>
									<textarea
										value={decisionFeedback}
										onChange={(e) => setDecisionFeedback(e.target.value)}
										placeholder="Write a short reason or feedback..."
										className="min-h-32 w-full resize-none rounded-xl border border-outlineVariant bg-surface px-3 py-2 text-sm text-textPrimary outline-none focus:ring-2 focus:ring-primary"
									/>
								</div>

								{reviewMode === "SUSPEND" && (
									<div>
										<label className="mb-2 block text-xs font-bold uppercase tracking-wider text-textTertiary">
											Suspension period
										</label>
										<select
											value={suspensionPeriod}
											onChange={(e) => setSuspensionPeriod(e.target.value)}
											className="w-full rounded-xl border border-outlineVariant bg-surface px-3 py-2 text-sm text-textPrimary outline-none focus:ring-2 focus:ring-primary">
											<option>1 day</option>
											<option>3 days</option>
											<option>7 days</option>
											<option>30 days</option>
											<option>Permanent</option>
										</select>
									</div>
								)}

								<div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2 lg:grid-cols-2">
									{selectedUser.status === "PENDING" && (
										<>
											<button
												type="button"
												onClick={approveUser}
												className="flex w-full items-center justify-center gap-2 rounded-xl bg-success px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90">
												<CheckCircle2 className="h-4 w-4" />
												Approve
											</button>
											<button
												type="button"
												onClick={rejectUser}
												className="flex w-full items-center justify-center gap-2 rounded-xl bg-errorLight px-4 py-2.5 text-sm font-bold text-error transition hover:bg-error/20">
												<XCircle className="h-4 w-4" />
												Reject
											</button>
										</>
									)}

									{selectedUser.status === "VERIFIED" && (
										<button
											type="button"
											onClick={suspendUser}
											className="flex w-full items-center justify-center gap-2 rounded-xl bg-errorLight px-4 py-2.5 text-sm font-bold text-error transition hover:bg-error/20">
											<ShieldOff className="h-4 w-4" />
											Suspend
										</button>
									)}

									{selectedUser.status === "SUSPENDED" && (
										<button
											type="button"
											onClick={() => {
												reactivateUser(selectedUser.id);
												closeModal();
											}}
											className="flex w-full items-center justify-center gap-2 rounded-xl bg-successLight px-4 py-2.5 text-sm font-bold text-success transition hover:bg-success/20">
											<RefreshCcw className="h-4 w-4" />
											Reactivate
										</button>
									)}


									<Link
										href={`/users/${selectedUser.id}${selectedUser.status === "PENDING" ? "?type=pending" : ""}`}
										className="flex w-full items-center justify-center gap-2 rounded-xl bg-surfaceVariant px-4 py-2.5 text-sm font-bold text-textSecondary transition hover:bg-borderLight"
										onClick={closeModal}>
										<Eye className="h-4 w-4" />
										Open full profile
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
