"use client";

import api from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatShortDate } from "@/lib/dateUtils";
import { extractErrorMessage } from "@/lib/errorUtils";
import { useToast } from "@/context/ToastContext";
import { Search, Users, ClipboardCheck, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import TrustBadge from "@/components/TrustBadge";
import Avatar from "@/components/ui/Avatar";
import { trustLevelFor, TRUST_LEVEL_LABEL } from "@/types/trust";

type UserStatus = "VERIFIED" | "PENDING" | "SUSPENDED";
type FilterType = "ALL" | UserStatus;
type SortField = "name" | "joined";
type SortOrder = "asc" | "desc";

type AdminUser = {
	id: string;
	name: string;
	email: string;
	studentId: string;
	phone: string;
	university: string;
	department: string;
	status: UserStatus;
	trustScore: number;
	registered: string;
	createdAt: number;
	avatarUrl?: string | null;
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
		status: mapUserStatus(u.status),
		trustScore: u.studentProfile?.trustScore ?? 0,
		registered: formatShortDate(u.createdAt),
		createdAt: new Date(u.createdAt).getTime() || 0,
		avatarUrl: u.avatarUrl,
	};
}

function mapPendingUser(u: any): AdminUser {
	return {
		id: String(u.userId ?? u.id ?? ""),
		name: u.name ?? "",
		email: u.email ?? "",
		phone: u.studentProfile?.phone ?? u.phone ?? "—",
		studentId: u.studentProfile?.studentId ?? u.studentId ?? "—",
		university: u.studentProfile?.university ?? u.university ?? "—",
		department: u.studentProfile?.department ?? u.department ?? "—",
		status: "PENDING",
		trustScore: 0,
		registered: formatShortDate(u.createdAt),
		createdAt: new Date(u.createdAt).getTime() || 0,
		avatarUrl: u.avatarUrl,
	};
}

// Build the review page link for a row. Pending users live in a separate id
// namespace and MUST carry ?type=pending so the review page hits the pending
// endpoint rather than resolving an unrelated verified user with the same id.
function reviewHref(u: AdminUser): string {
	return `/users/${u.id}${u.status === "PENDING" ? "?type=pending" : ""}`;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<UserStatus, string> = {
	VERIFIED: "bg-successLight text-success",
	PENDING: "bg-warningLight text-warning",
	SUSPENDED: "bg-errorLight text-error",
};

const FILTERS: FilterType[] = ["ALL", "PENDING", "VERIFIED", "SUSPENDED"];

const SUMMARY_CARDS: { label: string; status: FilterType }[] = [
	{ label: "Pending Review", status: "PENDING" },
	{ label: "Verified", status: "VERIFIED" },
	{ label: "Suspended", status: "SUSPENDED" },
];

const SUMMARY_COLORS: Record<string, string> = {
	"Pending Review": "text-warning",
	Verified: "text-success",
	Suspended: "text-error",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
	const searchParams = useSearchParams();
	const { toast } = useToast();

	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<FilterType>("ALL");
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [pageIndex, setPageIndex] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [sortField, setSortField] = useState<SortField>("joined");
	const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

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

	// Auto-refresh on tab focus + moderate polling (pending approvals are time-sensitive)
	useAutoRefresh(() => fetchUsers(pageIndex, filter), { intervalMs: 60_000 });

	const filteredUsers = useMemo(() => {
		const term = search.toLowerCase();
		const filtered = users.filter((u) => {
			const matchSearch =
				!term ||
				(u.name && u.name.toLowerCase().includes(term)) ||
				(u.email && u.email.toLowerCase().includes(term)) ||
				(u.studentId && u.studentId.toLowerCase().includes(term));
			const matchFilter = filter === "ALL" || u.status === filter;
			return matchSearch && matchFilter;
		});

		return filtered.sort((a, b) => {
			let comp = 0;
			if (sortField === "name") {
				comp = a.name.localeCompare(b.name);
			} else if (sortField === "joined") {
				comp = a.createdAt - b.createdAt;
			}
			return sortOrder === "asc" ? comp : -comp;
		});
	}, [users, search, filter, sortField, sortOrder]);

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortOrder("asc");
		}
	};

	const renderSortableHeader = (label: string, field: SortField) => {
		const isActive = sortField === field;
		return (
			<button
				onClick={() => handleSort(field)}
				className="group flex items-center gap-1 hover:text-primary transition-colors focus:outline-none"
			>
				{label}
				{isActive ? (
					sortOrder === "asc" ? (
						<ArrowUp className="h-3.5 w-3.5" />
					) : (
						<ArrowDown className="h-3.5 w-3.5" />
					)
				) : (
					<ArrowUpDown className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-50" />
				)}
			</button>
		);
	};

	return (
		<div className="w-full space-y-6 px-4 pb-20 sm:px-6 lg:px-8 graph-grid page-enter">
			{/* Header */}
			<div className="glass-surface relative overflow-hidden rounded-2xl p-6 shadow-sm">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 className="mt-0.5 text-2xl font-bold tracking-tighter text-textPrimary">
							User <span className="text-gradient-brand italic">Management.</span>
						</h2>
						<p className="mt-1 text-sm text-textSecondary">
							Review student accounts. Open a user to verify documents and approve, reject,
							suspend, or reactivate.
						</p>
					</div>
					<div className="flex w-full items-center gap-2 rounded-xl border border-borderLight bg-surface px-3 py-2 text-sm text-textSecondary shadow-sm sm:w-auto self-start sm:self-auto">
						<Users className="h-4 w-4" />
						<span className="font-bold text-textPrimary">{users.length}</span>
						<span>on this page</span>
					</div>
				</div>
			</div>

			{/* Stat cards */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{SUMMARY_CARDS.map((card) => (
					<Card key={card.label} padding="none" className="p-4" interactive={true}>
						<div className="text-xs font-semibold uppercase tracking-wider text-textTertiary">
							{card.label}
						</div>
						<div className={`mt-2 text-2xl font-bold ${SUMMARY_COLORS[card.label]}`}>
							{users.filter((u) => u.status === card.status).length}
						</div>
					</Card>
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
						aria-label="Search users"
						className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-textPrimary shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-textTertiary"
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
							className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-all sm:px-4 ${
								filter === f
									? "bg-primary text-onPrimary shadow-sm"
									: "border border-border bg-card text-textSecondary hover:border-primary/40 hover:text-textPrimary"
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
			<Card padding="none" className="overflow-x-auto">
				<div className="min-w-full">
					<DataTable
						columns={[
							{
								header: renderSortableHeader("Student", "name"),
								cell: (u) => (
									<div className="flex min-w-0 items-center gap-3">
										<Avatar src={u.avatarUrl} name={u.name} size={36} />
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
								cell: (u) =>
									u.status === "PENDING" ? (
										<span className="text-xs text-textTertiary">Not yet rated</span>
									) : (
										<div className="space-y-1">
											<TrustBadge score={u.trustScore} compact />
											<div className="text-xs text-textTertiary">
												{TRUST_LEVEL_LABEL[trustLevelFor(u.trustScore)]}
											</div>
										</div>
									),
							},
							{
								header: renderSortableHeader("Joined", "joined"),
								cell: (u) => (
									<span className="text-xs text-textSecondary">{u.registered}</span>
								),
							},
							{
								header: "Actions",
								cell: (u) => (
									<div className="flex items-center justify-start lg:justify-end">
										<Link
											href={reviewHref(u)}
											className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-onPrimary transition hover:opacity-90">
											<ClipboardCheck className="h-3.5 w-3.5" /> Review
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
			</Card>
		</div>
	);
}
