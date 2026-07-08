"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { formatShortDate } from "@/lib/dateUtils";
import {
	AlertTriangle,
	Search,
	Filter,
	Eye,
	RefreshCw,
	CheckCircle2,
	Clock,
	ShieldAlert,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
} from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_SIZE = 10;

interface Report {
	reportId: number;
	reporterId: number;
	reporterName: string;
	reporterEmail: string;
	entityType: string;
	entityId: number;
	entityName: string;
	ownerId?: number;
	ownerName?: string;
	ownerEmail?: string;
	reason: string;
	createdAt: string;
}

const REASON_LABELS: Record<string, string> = {
	INAPPROPRIATE_CONTENT: "Inappropriate Content",
	FRAUD_OR_SCAM: "Fraud or Scam",
	MISLEADING_INFO: "Misleading Information",
	STOLEN_PROPERTY: "Stolen Property",
	PROHIBITED_ITEM: "Prohibited Item",
	OTHER: "Other Reason",
};

export default function ModerationDashboard() {
	const [reports, setReports] = useState<Report[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Filters
	const [searchQuery, setSearchQuery] = useState("");
	const [typeFilter, setTypeFilter] = useState("ALL");
	const [pageIndex, setPageIndex] = useState(0);
	const [sortBy, setSortBy] = useState<"default" | "reporter" | "date_oldest">("default");

	const fetchReports = async (silent = false) => {
		if (!silent) setLoading(true);
		setError(null);
		try {
			const res = await api.get<Report[]>("/admin/reports");
			setReports(res.data || []);
		} catch (err) {
			console.error("Failed to load reports", err);
			setError("Unable to load reports. Please check your credentials.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void fetchReports();
	}, []);

	// Auto refresh every 45s
	useAutoRefresh(() => fetchReports(true), { intervalMs: 45_000 });

	// Statistics
	const stats = useMemo(() => {
		const total = reports.length;
		return { total };
	}, [reports]);

	// Filtered & Sorted reports
	const filteredReports = useMemo(() => {
		const searchLower = searchQuery.toLowerCase().trim();
		const filtered = reports.filter((r) => {
			const matchesSearch =
				!searchLower ||
				(r.reason && r.reason.toLowerCase().includes(searchLower)) ||
				(r.entityName && r.entityName.toLowerCase().includes(searchLower)) ||
				(r.reporterName && r.reporterName.toLowerCase().includes(searchLower)) ||
				(r.ownerName && r.ownerName.toLowerCase().includes(searchLower));

			const matchesType =
				typeFilter === "ALL" || r.entityType === typeFilter;

			return matchesSearch && matchesType;
		});

		if (sortBy === "reporter") {
			return [...filtered].sort((a, b) => {
				const nameA = (a.reporterName || "").toLowerCase();
				const nameB = (b.reporterName || "").toLowerCase();
				return nameA.localeCompare(nameB);
			});
		} else if (sortBy === "date_oldest") {
			return [...filtered].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
		} else {
			// default: new report first
			return [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
		}
	}, [reports, searchQuery, typeFilter, sortBy]);

	useEffect(() => {
		setPageIndex(0);
	}, [searchQuery, typeFilter, sortBy]);

	const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));
	const safePage = Math.min(pageIndex, totalPages - 1);
	const pagedReports = useMemo(
		() => filteredReports.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
		[filteredReports, safePage],
	);

	return (
		<div className="space-y-6 pb-20 sm:pb-6 animate-fade-in graph-grid page-enter">
			{/* Header with gradient strip */}
			<div className="glass-surface relative overflow-hidden rounded-2xl p-6 shadow-sm">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h2 className="mt-0.5 text-3xl font-bold tracking-tighter text-textPrimary">
							Listing <span className="text-gradient-brand italic">Reports.</span>
						</h2>
						<p className="mt-1 text-sm text-textSecondary">
							Review flagged content, inspect listings, and manage trust penalties.
						</p>
					</div>
					
					{/* Active reports count badge directly in place of the old refresh button */}
					<div className="flex items-center justify-center gap-2 rounded-full border border-error/20 bg-errorLight/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-error self-start sm:self-auto font-mono shadow-sm">
						<ShieldAlert className="h-4 w-4 shrink-0 text-error" />
						<span className="font-extrabold">{stats.total}</span>
						Reports
					</div>
				</div>
			</div>

			{error && (
				<div className="flex items-center gap-3 rounded-xl border border-error/30 bg-errorLight px-4 py-3.5 text-sm font-medium text-error animate-slide-down shadow-sm">
					<AlertTriangle className="h-5 w-5 shrink-0" />
					{error}
				</div>
			)}

			{/* Desktop View: search and select filter */}
			<div className="hidden md:flex md:flex-row md:items-start gap-3">
				<div className="relative min-w-0 flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textTertiary" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search by reason, listing title, reporter, or owner..."
						className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-textPrimary shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-textTertiary"
					/>
				</div>

				<div className="w-full sm:w-48 shrink-0">
					<Select
						value={typeFilter}
						onChange={setTypeFilter}
						options={[
							{ value: "ALL", label: "All" },
							{ value: "ITEM", label: "Items" },
							{ value: "USER", label: "Users" },
							{ value: "BOOKING", label: "Bookings" },
						]}
					/>
				</div>
			</div>

			{/* Mobile View: Search input and select filter directly in a single row (always visible) */}
			<div className="flex flex-row items-center gap-2 md:hidden">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textTertiary" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search..."
						className="w-full rounded-full border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-textPrimary shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-textTertiary"
					/>
				</div>

				<div className="shrink-0">
					<Select
						value={typeFilter}
						onChange={setTypeFilter}
						options={[
							{ value: "ALL", label: "ALL" },
							{ value: "ITEM", label: "ITEM" },
							{ value: "USER", label: "USER" },
							{ value: "BOOKING", label: "BOOKING" },
						]}
						variant="pill"
					/>
				</div>
			</div>

			{/* Reports List */}
			<Card padding="none" className="overflow-hidden">
				{loading ? (
					<div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-textSecondary">
						<Clock className="h-8 w-8 animate-spin text-primary" />
						<span className="text-sm font-semibold">Loading moderation records...</span>
					</div>
				) : filteredReports.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
						<AlertTriangle className="h-10 w-10 text-textTertiary" />
						<p className="text-sm font-semibold text-textSecondary">No report records found.</p>
						<p className="text-xs text-textTertiary">Try clearing filters or check back later.</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-left text-sm">
							<thead className="bg-card border-b border-borderLight text-xs font-bold uppercase tracking-wider text-textTertiary">
								<tr>
									<th className="px-6 py-4 select-none">Report Details</th>
									<th className="px-6 py-4 select-none">Reported Entity</th>
									<th 
										onClick={() => setSortBy(sortBy === "reporter" ? "default" : "reporter")}
										className="px-6 py-4 cursor-pointer hover:text-textPrimary transition-colors select-none"
									>
										<div className="flex items-center gap-1">
											<span>Reporter</span>
											{sortBy === "reporter" ? (
												<ArrowUp className="h-3.5 w-3.5 text-primary shrink-0" />
											) : (
												<ArrowUpDown className="h-3.5 w-3.5 text-textTertiary/40 hover:text-textPrimary shrink-0" />
											)}
										</div>
									</th>
									<th 
										onClick={() => setSortBy(sortBy === "date_oldest" ? "default" : "date_oldest")}
										className="px-6 py-4 cursor-pointer hover:text-textPrimary transition-colors select-none"
									>
										<div className="flex items-center gap-1">
											<span>Submitted Date</span>
											{sortBy === "date_oldest" ? (
												<ArrowUp className="h-3.5 w-3.5 text-primary shrink-0" />
											) : (
												<ArrowUpDown className="h-3.5 w-3.5 text-textTertiary/40 hover:text-textPrimary shrink-0" />
											)}
										</div>
									</th>
									<th className="px-6 py-4 text-center select-none">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-borderLight">
								{pagedReports.map((report) => {
									const label = REASON_LABELS[report.reason] || report.reason;
									return (
										<tr key={report.reportId} className="hover:bg-surfaceVariant/20 transition-colors">
											<td className="px-6 py-4">
												<div className="font-semibold text-textPrimary">{label}</div>
												{report.reason !== label && (
													<div className="text-xs text-textTertiary truncate max-w-xs">{report.reason}</div>
												)}
											</td>
											<td className="px-6 py-4">
												<div className="font-medium text-textPrimary max-w-xs truncate">
													{report.entityName || "Unknown Name"}
												</div>
												<div className="text-xs text-textTertiary">
													{report.entityType} #{report.entityId}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="font-medium text-textPrimary">{report.reporterName}</div>
												<div className="text-xs text-textTertiary">{report.reporterEmail}</div>
											</td>
											<td className="px-6 py-4 text-textSecondary whitespace-nowrap">
												{formatShortDate(report.createdAt)}
											</td>
											<td className="px-6 py-4 text-center whitespace-nowrap">
												<Link
													href={`/moderation/investigate/${report.reportId}`}
													className="inline-flex items-center gap-1.5 rounded-lg border border-borderLight bg-card px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primaryLight"
												>
													<Eye className="h-3.5 w-3.5" />
													Investigate
												</Link>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
				{!loading && filteredReports.length > 0 && (
					<Pagination pageIndex={safePage} totalPages={totalPages} onPageChange={setPageIndex} />
				)}
			</Card>
		</div>
	);
}
