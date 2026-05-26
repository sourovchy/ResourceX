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

type UserStatus = "VERIFIED" | "PENDING" | "SUSPENDED" | "REJECTED";
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
	REJECTED: "REJECTED",
};

const STATUS_COLORS: Record<UserStatus, string> = {
	VERIFIED: "bg-successLight text-success",
	PENDING: "bg-warningLight text-warning",
	SUSPENDED: "bg-errorLight text-error",
	REJECTED: "bg-surfaceVariant text-textSecondary",
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
	"REJECTED",
];

const SUMMARY_CARDS: { label: string; status: FilterType | null; color: string }[] = [
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

	const fetchUsers = async (page: number) => {
		setLoading(true);
		try {
			const res = await api.get(`/admin/pending-users?page=${page}&size=10`);
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

			const mappedUsers: AdminUser[] = data.map((u: any) => ({
				id: u.id.toString(),
				name: u.name,
				email: u.email,
				phone: u.phone,
				studentId: u.studentId,
				university: u.university,
				department: u.department,
				idCardDataUrl: u.idCardDataUrl,
				status: STATUS_MAP[u.status] || "PENDING",
				trustScore: 0,
				bookings: 0,
				registered: new Date(u.createdAt).toLocaleDateString(),
				lastActive: "N/A",
				warningCount: 0,
				verificationSubmitted: new Date(u.createdAt).toLocaleDateString(),
				documentCount: u.idCardDataUrl ? 1 : 0,
				note:
					u.status === "PENDING_APPROVAL"
						? "Verified, awaiting approval"
						: "Awaiting verification",
			}));

			setUsers(mappedUsers);
		} catch (err) {
			console.error("Failed to fetch pending users:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers(pageIndex);
	}, [pageIndex]);

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
			fetchUsers(pageIndex);
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
			fetchUsers(pageIndex);
			closeModal();
		} catch (err) {
			console.error("Failed to reject user:", err);
			alert("Failed to reject user");
		}
	};

	const suspendUser = () => {
		// Placeholder for future implementation
		closeModal();
	};

	const reactivateUser = (userId: string) => {
		// Placeholder for future implementation
	};

	const restoreForReview = (userId: string) => {
		// Placeholder
	};

	return (
		<div className="mx-auto max-w-7xl space-y-6 px-4 pb-20 sm:px-6 lg:px-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary">
						User Management
					</h1>
					<p className="text-textSecondary text-sm mt-1">
						Manage student accounts, verifications, and suspensions.
					</p>
				</div>

				<div className="flex w-full items-center gap-2 bg-surface border border-borderLight px-3 py-2 rounded-xl shadow-sm text-sm text-textSecondary sm:w-auto">
					<Users className="w-4 h-4" />
					<span className="font-bold text-textPrimary">{users.length}</span>
					<span>total users</span>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{SUMMARY_CARDS.map((card) => (
					<div key={card.label} className="rounded-2xl border border-borderLight bg-surface p-4 shadow-sm">
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

			<div className="flex flex-col gap-3 lg:flex-row lg:items-center">
				<div className="relative w-full flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textTertiary" />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by name, email, or student ID..."
						className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outlineVariant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textPrimary text-sm"
					/>
				</div>

				<div className="flex w-full gap-2 overflow-x-auto pb-1 lg:w-auto lg:pb-0">
					{FILTERS.map((f) => (
						<button
							key={f}
							onClick={() => setFilter(f)}
							className={`px-4 py-2 rounded-xl text-sm font-semibold transition border whitespace-nowrap ${
								filter === f
									? "bg-primary text-onPrimary border-primary shadow"
									: "bg-surface border-outlineVariant text-textSecondary hover:bg-surfaceVariant"
							}`}>
							{f}
						</button>
					))}
				</div>
			</div>

			<div className="mb-4 text-xs text-textTertiary">
				Note: Search and filtering apply only to the current page.
			</div>

			<div className="overflow-x-auto">
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
							)
						},
						{
							header: "Student ID",
							cell: (u) => <span className="break-all font-mono text-xs text-textSecondary">{u.studentId}</span>
						},
						{
							header: "Status",
							cell: (u) => (
								<span
									className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_COLORS[u.status]}`}>
									{u.status}
								</span>
							)
						},
						{
							header: "Trust",
							cell: (u) => (
								<div className="space-y-1">
									<div className={`font-bold text-sm ${getTrustColor(u.trustScore)}`}>
										{u.trustScore > 0 ? u.trustScore : "—"}
									</div>
									<div className="text-xs text-textTertiary">
										{getTrustLabel(u.trustScore)}
									</div>
								</div>
							)
						},
						{
							header: "Warnings",
							cell: (u) => <span className="text-sm font-semibold text-textSecondary">{u.warningCount}</span>
						},
						{
							header: "Bookings",
							accessorKey: "bookings"
						},
						{
							header: "Last Active",
							cell: (u) => <span className="text-xs text-textSecondary">{u.lastActive}</span>
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
												className="flex items-center gap-1 px-2.5 py-1.5 bg-success text-white rounded-lg text-xs font-bold hover:opacity-90 transition">
												<CheckCircle2 className="w-3.5 h-3.5" />
												Approve
											</button>
											<button
												type="button"
												onClick={() => openReview(u.id, "REJECT")}
												className="flex items-center gap-1 px-2.5 py-1.5 bg-errorLight text-error rounded-lg text-xs font-bold hover:bg-error/20 transition">
												<XCircle className="w-3.5 h-3.5" />
												Reject
											</button>
										</>
									)}

									{u.status === "VERIFIED" && (
										<button
											type="button"
											onClick={() => openReview(u.id, "SUSPEND")}
											className="flex items-center gap-1 px-2.5 py-1.5 bg-errorLight text-error rounded-lg text-xs font-bold hover:bg-error/20 transition">
											<ShieldOff className="w-3.5 h-3.5" />
											Suspend
										</button>
									)}

									{u.status === "SUSPENDED" && (
										<button
											type="button"
											onClick={() => openReview(u.id, "REACTIVATE")}
											className="flex items-center gap-1 px-2.5 py-1.5 bg-successLight text-success rounded-lg text-xs font-bold hover:bg-success/20 transition">
											<RefreshCcw className="w-3.5 h-3.5" />
											Reactivate
										</button>
									)}

									{u.status === "REJECTED" && (
										<button
											type="button"
											onClick={() => restoreForReview(u.id)}
											className="flex items-center gap-1 px-2.5 py-1.5 bg-warningLight text-warning rounded-lg text-xs font-bold hover:opacity-90 transition">
											<Clock className="w-3.5 h-3.5" />
											Re-review
										</button>
									)}

									<button
										type="button"
										onClick={() => openReview(u.id, null)}
										className="flex items-center gap-1 px-2.5 py-1.5 bg-surfaceVariant text-textSecondary rounded-lg text-xs font-bold hover:bg-borderLight transition">
										<Eye className="w-3.5 h-3.5" />
										View
									</button>
								</div>
							)
						}
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

			{selectedUser && (
				<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm sm:items-center sm:p-6">
					<div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-borderLight bg-surface shadow-2xl max-h-[calc(100vh-1.5rem)] overflow-y-auto sm:max-h-[calc(100vh-3rem)]">
						<div className="flex flex-col gap-3 border-b border-borderLight px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
							<div className="min-w-0">
								<div className="flex items-center gap-2">
									<h2 className="text-lg font-bold text-textPrimary truncate">
										{selectedUser.name}
									</h2>
									<span
										className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[selectedUser.status]}`}>
										{selectedUser.status}
									</span>
								</div>
								<p className="text-sm text-textSecondary mt-1 truncate">
									{selectedUser.email}
								</p>
							</div>

							<button
								type="button"
								onClick={closeModal}
								className="p-2 rounded-xl hover:bg-surfaceVariant transition"
								aria-label="Close modal">
								<X className="w-5 h-5 text-textSecondary" />
							</button>
						</div>

						<div className="grid grid-cols-1 gap-0 lg:grid-cols-3">
							<div className="space-y-5 border-b border-borderLight p-4 sm:p-5 lg:col-span-2 lg:border-b-0 lg:border-r">
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
	{PROFILE_METRICS.map((metric) => {
		const value = metric.value(selectedUser);
		const valueClassName = metric.valueClassName?.(selectedUser) ?? "text-textPrimary";

		return (
			<div key={metric.label} className="rounded-2xl bg-surfaceVariant/40 p-4">
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

								<div className="bg-surfaceVariant/30 rounded-2xl p-4">
									<div className="flex items-center gap-2 text-sm font-bold text-textPrimary mb-3">
										<Info className="w-4 h-4 text-primary" />
										Provided verification info
									</div>

									<div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
	{VERIFICATION_FIELDS.map((field) => (
		<div key={field.label}>
			<div className="text-xs text-textTertiary">{field.label}</div>
			<div className="font-medium text-textPrimary">{field.value(selectedUser)}</div>
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
												className="max-h-80 w-full rounded-xl border border-borderLight object-contain bg-surface"
											/>
										</div>
									) : (
										<div className="mt-4 text-xs text-textTertiary">
											No submitted ID-card image available for this user.
										</div>
									)}
								</div>
							</div>

							<div className="space-y-4 p-4 sm:p-5">
								<div className="flex items-center gap-2 text-sm font-bold text-textPrimary">
									<AlertTriangle className="w-4 h-4 text-warning" />
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
									<label className="block text-xs font-bold text-textTertiary uppercase tracking-wider mb-2">
										Feedback
									</label>
									<textarea
										value={decisionFeedback}
										onChange={(e) => setDecisionFeedback(e.target.value)}
										placeholder="Write a short reason or feedback..."
										className="w-full min-h-32 resize-none rounded-xl border border-outlineVariant bg-surface px-3 py-2 text-sm text-textPrimary outline-none focus:ring-2 focus:ring-primary"
									/>
								</div>

								{reviewMode === "SUSPEND" && (
									<div>
										<label className="block text-xs font-bold text-textTertiary uppercase tracking-wider mb-2">
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
												className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-success text-white rounded-xl text-sm font-bold hover:opacity-90 transition">
												<CheckCircle2 className="w-4 h-4" />
												Approve
											</button>
											<button
												type="button"
												onClick={rejectUser}
												className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-errorLight text-error rounded-xl text-sm font-bold hover:bg-error/20 transition">
												<XCircle className="w-4 h-4" />
												Reject
											</button>
										</>
									)}

									{selectedUser.status === "VERIFIED" && (
										<button
											type="button"
											onClick={suspendUser}
											className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-errorLight text-error rounded-xl text-sm font-bold hover:bg-error/20 transition">
											<ShieldOff className="w-4 h-4" />
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
											className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-successLight text-success rounded-xl text-sm font-bold hover:bg-success/20 transition">
											<RefreshCcw className="w-4 h-4" />
											Reactivate
										</button>
									)}

									{selectedUser.status === "REJECTED" && (
										<button
											type="button"
											onClick={() => restoreForReview(selectedUser.id)}
											className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-warningLight text-warning rounded-xl text-sm font-bold hover:opacity-90 transition">
											<Clock className="w-4 h-4" />
											Send back to review
										</button>
									)}

									<Link
										href={`/users/${selectedUser.id}`}
										className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-surfaceVariant text-textSecondary rounded-xl text-sm font-bold hover:bg-borderLight transition"
										onClick={closeModal}>
										<Eye className="w-4 h-4" />
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
