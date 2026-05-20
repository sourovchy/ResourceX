"use client";
import api from "@/lib/api";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import {
	Search,
	CheckCircle2,
	XCircle,
	Eye,
	Users,
	Clock,
	AlertTriangle,
	ShieldAlert,
	X,
	Info,
	RefreshCcw,
	ShieldOff,
} from "lucide-react";

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

const INITIAL_USERS: AdminUser[] = [
	{
		id: "U001",
		name: "Arif Hossain",
		email: "arif@uni.edu",
		studentId: "20-44512",
		status: "VERIFIED",
		trustScore: 105,
		bookings: 12,
		registered: "Mar 12, 2024",
		lastActive: "2h ago",
		warningCount: 0,
		verificationSubmitted: "Mar 10, 2024",
		documentCount: 3,
	},
	{
		id: "U002",
		name: "Priya Sen",
		email: "priya@uni.edu",
		studentId: "21-33102",
		status: "PENDING",
		trustScore: 0,
		bookings: 0,
		registered: "May 3, 2024",
		lastActive: "Today",
		warningCount: 0,
		verificationSubmitted: "Today",
		documentCount: 4,
	},
	{
		id: "U003",
		name: "Mehedi Islam",
		email: "mehedi@uni.edu",
		studentId: "22-10045",
		status: "PENDING",
		trustScore: 0,
		bookings: 0,
		registered: "May 4, 2024",
		lastActive: "Today",
		warningCount: 1,
		verificationSubmitted: "Today",
		documentCount: 3,
	},
	{
		id: "U004",
		name: "Tanvir Ahmed",
		email: "tanvir@uni.edu",
		studentId: "20-99871",
		status: "SUSPENDED",
		trustScore: 45,
		bookings: 7,
		registered: "Jan 5, 2024",
		lastActive: "3 days ago",
		warningCount: 2,
		suspensionReason: "Repeated late returns",
		suspensionPeriod: "7 days",
		verificationSubmitted: "Jan 2, 2024",
		documentCount: 2,
		note: "Suspended after multiple violations.",
	},
	{
		id: "U005",
		name: "Rafi Uddin",
		email: "rafi@uni.edu",
		studentId: "21-55611",
		status: "VERIFIED",
		trustScore: 87,
		bookings: 23,
		registered: "Feb 20, 2024",
		lastActive: "1h ago",
		warningCount: 0,
		verificationSubmitted: "Feb 18, 2024",
		documentCount: 3,
	},
	{
		id: "U006",
		name: "Sumaiya Begum",
		email: "sumaiya@uni.edu",
		studentId: "22-77390",
		status: "VERIFIED",
		trustScore: 120,
		bookings: 34,
		registered: "Nov 11, 2023",
		lastActive: "30m ago",
		warningCount: 0,
		verificationSubmitted: "Nov 9, 2023",
		documentCount: 4,
	},
	{
		id: "U007",
		name: "Fahim Chowdhury",
		email: "fahim@uni.edu",
		studentId: "23-10023",
		status: "PENDING",
		trustScore: 0,
		bookings: 0,
		registered: "May 5, 2024",
		lastActive: "Today",
		warningCount: 0,
		verificationSubmitted: "Today",
		documentCount: 3,
	},
	{
		id: "U008",
		name: "Nusrat Jahan",
		email: "nusrat@uni.edu",
		studentId: "21-44212",
		status: "VERIFIED",
		trustScore: 95,
		bookings: 18,
		registered: "Sep 8, 2023",
		lastActive: "5h ago",
		warningCount: 1,
		verificationSubmitted: "Sep 6, 2023",
		documentCount: 3,
	},
];

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

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const res = await api.get("/admin/pending-users");
			const data = res.data as any[];

			const mappedUsers: AdminUser[] = data.map((u) => ({
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
		fetchUsers();
	}, []);

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
			fetchUsers();
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
			fetchUsers();
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
		<div className="max-w-7xl mx-auto space-y-6">
			<div className="flex items-center justify-between gap-4 flex-wrap">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary">
						User Management
					</h1>
					<p className="text-textSecondary text-sm mt-1">
						Manage student accounts, verifications, and suspensions.
					</p>
				</div>

				<div className="flex items-center gap-2 bg-surface border border-borderLight px-3 py-2 rounded-xl shadow-sm text-sm text-textSecondary">
					<Users className="w-4 h-4" />
					<span className="font-bold text-textPrimary">{users.length}</span>
					<span>total users</span>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
				<div className="bg-surface border border-borderLight rounded-2xl p-4 shadow-sm">
					<div className="text-xs text-textTertiary font-semibold uppercase tracking-wider">
						Pending Review
					</div>
					<div className="mt-2 text-2xl font-bold text-warning">
						{users.filter((u) => u.status === "PENDING").length}
					</div>
				</div>
				<div className="bg-surface border border-borderLight rounded-2xl p-4 shadow-sm">
					<div className="text-xs text-textTertiary font-semibold uppercase tracking-wider">
						Verified
					</div>
					<div className="mt-2 text-2xl font-bold text-success">
						{users.filter((u) => u.status === "VERIFIED").length}
					</div>
				</div>
				<div className="bg-surface border border-borderLight rounded-2xl p-4 shadow-sm">
					<div className="text-xs text-textTertiary font-semibold uppercase tracking-wider">
						Suspended
					</div>
					<div className="mt-2 text-2xl font-bold text-error">
						{users.filter((u) => u.status === "SUSPENDED").length}
					</div>
				</div>
				<div className="bg-surface border border-borderLight rounded-2xl p-4 shadow-sm">
					<div className="text-xs text-textTertiary font-semibold uppercase tracking-wider">
						Flagged
					</div>
					<div className="mt-2 text-2xl font-bold text-primary">
						{users.filter((u) => u.warningCount > 0).length}
					</div>
				</div>
			</div>

			<div className="flex flex-col sm:flex-row gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textTertiary" />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by name, email, or student ID..."
						className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outlineVariant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textPrimary text-sm"
					/>
				</div>

				<div className="flex gap-2 shrink-0 overflow-x-auto pb-1 sm:pb-0">
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

			<div className="bg-surface border border-borderLight rounded-2xl shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-borderLight bg-surfaceVariant/60">
								<th className="px-5 py-3.5 text-left text-xs font-bold text-textTertiary uppercase tracking-wider">
									Student
								</th>
								<th className="px-5 py-3.5 text-left text-xs font-bold text-textTertiary uppercase tracking-wider">
									Student ID
								</th>
								<th className="px-5 py-3.5 text-left text-xs font-bold text-textTertiary uppercase tracking-wider">
									Status
								</th>
								<th className="px-5 py-3.5 text-left text-xs font-bold text-textTertiary uppercase tracking-wider">
									Trust
								</th>
								<th className="px-5 py-3.5 text-left text-xs font-bold text-textTertiary uppercase tracking-wider">
									Warnings
								</th>
								<th className="px-5 py-3.5 text-left text-xs font-bold text-textTertiary uppercase tracking-wider">
									Bookings
								</th>
								<th className="px-5 py-3.5 text-left text-xs font-bold text-textTertiary uppercase tracking-wider">
									Last Active
								</th>
								<th className="px-5 py-3.5 text-right text-xs font-bold text-textTertiary uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>

						<tbody className="divide-y divide-borderLight">
							{filteredUsers.map((u) => (
								<tr
									key={u.id}
									className="hover:bg-surfaceVariant/40 transition-colors">
									<td className="px-5 py-3.5">
										<div className="flex items-center gap-3">
											<div className="w-9 h-9 rounded-full bg-primaryLight flex items-center justify-center font-bold text-primary text-sm shrink-0">
												{u.name[0]}
											</div>
											<div>
												<div className="font-semibold text-textPrimary">
													{u.name}
												</div>
												<div className="text-xs text-textTertiary">
													{u.email}
												</div>
											</div>
										</div>
									</td>

									<td className="px-5 py-3.5 text-textSecondary font-mono text-xs">
										{u.studentId}
									</td>

									<td className="px-5 py-3.5">
										<span
											className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[u.status]}`}>
											{u.status}
										</span>
									</td>

									<td className="px-5 py-3.5">
										<div className="space-y-1">
											<div
												className={`font-bold text-sm ${getTrustColor(u.trustScore)}`}>
												{u.trustScore > 0 ? u.trustScore : "—"}
											</div>
											<div className="text-xs text-textTertiary">
												{getTrustLabel(u.trustScore)}
											</div>
										</div>
									</td>

									<td className="px-5 py-3.5">
										<span className="text-sm font-semibold text-textSecondary">
											{u.warningCount}
										</span>
									</td>

									<td className="px-5 py-3.5 text-textSecondary">
										{u.bookings}
									</td>

									<td className="px-5 py-3.5 text-textSecondary text-xs">
										{u.lastActive}
									</td>

									<td className="px-5 py-3.5">
										<div className="flex items-center justify-end gap-2 flex-wrap">
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
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{filteredUsers.length === 0 && (
						<div className="py-16 text-center text-textTertiary">
							<Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
							No users match your search.
						</div>
					)}
				</div>
			</div>

			{selectedUser && (
				<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-6">
					<div className="w-full max-w-4xl bg-surface border border-borderLight rounded-3xl shadow-2xl overflow-hidden">
						<div className="flex items-center justify-between px-5 py-4 border-b border-borderLight">
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

						<div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
							<div className="lg:col-span-2 p-5 space-y-5 border-b lg:border-b-0 lg:border-r border-borderLight">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="bg-surfaceVariant/40 rounded-2xl p-4">
										<div className="text-xs text-textTertiary font-semibold uppercase tracking-wider">
											Student ID
										</div>
										<div className="mt-1 font-semibold text-textPrimary">
											{selectedUser.studentId}
										</div>
									</div>
									<div className="bg-surfaceVariant/40 rounded-2xl p-4">
										<div className="text-xs text-textTertiary font-semibold uppercase tracking-wider">
											Registered
										</div>
										<div className="mt-1 font-semibold text-textPrimary">
											{selectedUser.registered}
										</div>
									</div>
									<div className="bg-surfaceVariant/40 rounded-2xl p-4">
										<div className="text-xs text-textTertiary font-semibold uppercase tracking-wider">
											Last Active
										</div>
										<div className="mt-1 font-semibold text-textPrimary">
											{selectedUser.lastActive}
										</div>
									</div>
									<div className="bg-surfaceVariant/40 rounded-2xl p-4">
										<div className="text-xs text-textTertiary font-semibold uppercase tracking-wider">
											Bookings
										</div>
										<div className="mt-1 font-semibold text-textPrimary">
											{selectedUser.bookings}
										</div>
									</div>
									<div className="bg-surfaceVariant/40 rounded-2xl p-4">
										<div className="text-xs text-textTertiary font-semibold uppercase tracking-wider">
											Warnings
										</div>
										<div
											className={`mt-1 font-semibold ${
												WARNING_COLORS[Math.min(selectedUser.warningCount, 3)]
											}`}>
											{selectedUser.warningCount}
										</div>
									</div>
									<div className="bg-surfaceVariant/40 rounded-2xl p-4">
										<div className="text-xs text-textTertiary font-semibold uppercase tracking-wider">
											Trust Score
										</div>
										<div
											className={`mt-1 font-semibold ${getTrustColor(selectedUser.trustScore)}`}>
											{selectedUser.trustScore > 0
												? selectedUser.trustScore
												: "—"}
										</div>
									</div>
								</div>

								<div className="bg-surfaceVariant/30 rounded-2xl p-4">
									<div className="flex items-center gap-2 text-sm font-bold text-textPrimary mb-3">
										<Info className="w-4 h-4 text-primary" />
										Provided verification info
									</div>

									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
										<div>
											<div className="text-xs text-textTertiary">Name</div>
											<div className="font-medium text-textPrimary">
												{selectedUser.name}
											</div>
										</div>
										<div>
											<div className="text-xs text-textTertiary">Email</div>
											<div className="font-medium text-textPrimary">
												{selectedUser.email}
											</div>
										</div>
										<div>
											<div className="text-xs text-textTertiary">Phone</div>
											<div className="font-medium text-textPrimary">
												{selectedUser.phone || "Not provided"}
											</div>
										</div>
										<div>
											<div className="text-xs text-textTertiary">
												Student ID
											</div>
											<div className="font-medium text-textPrimary">
												{selectedUser.studentId}
											</div>
										</div>
										<div>
											<div className="text-xs text-textTertiary">Submitted</div>
											<div className="font-medium text-textPrimary">
												{selectedUser.verificationSubmitted}
											</div>
										</div>
										<div>
											<div className="text-xs text-textTertiary">
												University
											</div>
											<div className="font-medium text-textPrimary">
												{selectedUser.university || "Not provided"}
											</div>
										</div>
										<div>
											<div className="text-xs text-textTertiary">
												Department
											</div>
											<div className="font-medium text-textPrimary">
												{selectedUser.department || "Not provided"}
											</div>
										</div>
										<div>
											<div className="text-xs text-textTertiary">Documents</div>
											<div className="font-medium text-textPrimary">
												{selectedUser.documentCount} uploaded
											</div>
										</div>
										<div>
											<div className="text-xs text-textTertiary">Notes</div>
											<div className="font-medium text-textPrimary">
												{selectedUser.note || "No admin note yet."}
											</div>
										</div>
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
											No submitted ID-card image available for this mock user.
										</div>
									)}
								</div>
							</div>

							<div className="p-5 space-y-4">
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

								<div className="grid grid-cols-1 gap-2 pt-2">
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
