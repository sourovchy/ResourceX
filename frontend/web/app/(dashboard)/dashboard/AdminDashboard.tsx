"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/cards/StatCard";
import api from "@/lib/api";
import {
	Users,
	PackageOpen,
	UserPlus,
	Clock,
	ArrowRight,
	Loader2,
	DollarSign,
	AlertCircle,
	TrendingUp,
	TrendingDown,
} from "lucide-react";

type DashboardStats = {
	totalUsers: number;
	activeBookings: number;
	revenue: number;
	pendingApprovals: number;
};

type PendingUser = {
	id: number | string;
	name: string;
	email: string;
	studentId: string;
	university?: string;
	department?: string;
	createdAt?: string;
};

interface AuditLog {
	id?: string | number;
	userId: string | number;
	name: string;
	change: number;
	reason: string;
	timestamp: string;
}

interface AuditApiResponse {
	id?: string | number;
	userId?: string | number;
	name?: string;
	userName?: string;
	change?: number | string;
	scoreChange?: number | string;
	reason?: string;
	description?: string;
	timestamp?: string;
	createdAt?: string;
}

function normalizeAudit(data: AuditApiResponse): AuditLog {
	return {
		id: data.id,
		userId: data.userId ?? "",
		name: data.name ?? data.userName ?? "Unknown User",
		change: Number(data.change ?? data.scoreChange ?? 0),
		reason: data.reason ?? data.description ?? "No reason provided.",
		timestamp: data.timestamp ?? data.createdAt ?? new Date().toISOString(),
	};
}

function formatDate(value?: string) {
	if (!value) return "-";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "-";
	return date.toLocaleString();
}

export default function AdminHomePage() {
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
	const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let active = true;

		async function loadDashboard() {
			try {
				setLoading(true);
				setError("");

				const [statsRes, pendingRes, auditRes] = await Promise.all([
					api.get<DashboardStats>("/admin/dashboard").catch(() => ({ data: { totalUsers: 0, activeBookings: 0, revenue: 0, pendingApprovals: 0 } as DashboardStats })),
					api.get<{ content?: PendingUser[] }>("/admin/pending-users").catch(() => ({ data: { content: [] as PendingUser[] } })),
					api.get("/trust/admin/audit-log").catch(() => ({ data: [] })),
				]);

				if (!active) return;

				setStats(statsRes.data);

				const pendingList = Array.isArray(pendingRes.data?.content)
					? pendingRes.data.content
					: [];
				setPendingUsers(pendingList);

				const auditRaw = auditRes.data;
				const auditList = Array.isArray(auditRaw)
					? auditRaw
					: Array.isArray(auditRaw?.data)
						? auditRaw.data
						: Array.isArray(auditRaw?.content)
							? auditRaw.content
							: [];
				setAuditLogs(auditList.map(normalizeAudit));
			} catch (err) {
				console.error(err);
				if (active) setError("Could not load admin dashboard data.");
			} finally {
				if (active) setLoading(false);
			}
		}

		void loadDashboard();

		return () => {
			active = false;
		};
	}, []);

	// Removed full page loader in favor of skeleton state

	return (
		<div className="page-enter space-y-6 pb-20 sm:pb-0">
			{/* Welcome strip (simplified for admin) */}
			<div className="flex flex-col gap-4 rounded-xl border border-borderLight bg-surface p-5 shadow-sm sm:p-6">
				<div className="min-w-0">
					<p className="text-xs font-semibold uppercase tracking-widest text-textTertiary">
						Admin Dashboard
					</p>
					<h1 className="mt-1 text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
						Overview
					</h1>
					<p className="mt-1 text-sm text-textSecondary">
						Live platform metrics from the ResourceX database.
					</p>
				</div>
			</div>

			{/* Error banner */}
			{error && (
				<div className="flex items-center gap-3 rounded-xl border border-error/40 bg-errorLight px-4 py-3 text-sm font-medium text-error animate-slide-down">
					<AlertCircle className="h-4 w-4 shrink-0" />
					{error}
				</div>
			)}

			{/* Stat cards */}
			<div className="grid grid-cols-2 gap-4 xl:grid-cols-4 stagger-children">
				<StatCard
					loading={loading}
					icon={<Users className="h-5 w-5 text-dashboardBlue" />}
					title="Total Users"
					value={String(stats?.totalUsers ?? 0)}
					tint="bg-dashboardBlueTint"
				/>
				<StatCard
					loading={loading}
					icon={<PackageOpen className="h-5 w-5 text-primary" />}
					title="Active Rentals"
					value={String(stats?.activeBookings ?? 0)}
					tint="bg-primaryLight"
				/>
				<StatCard
					loading={loading}
					icon={<DollarSign className="h-5 w-5 text-success" />}
					title="Revenue"
					value={`৳${Number(stats?.revenue ?? 0).toLocaleString()}`}
					tint="bg-successLight"
				/>
				<StatCard
					loading={loading}
					icon={<UserPlus className="h-5 w-5 text-warning" />}
					title="Pending Approvals"
					value={String(stats?.pendingApprovals ?? pendingUsers.length)}
					tint="bg-warningLight"
				/>
			</div>

			{/* Pending approvals panel – styled like StudentDashboard's panels */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Pending approvals panel – styled like StudentDashboard's panels */}
				<section className="flex flex-col overflow-hidden rounded-xl border border-borderLight bg-surface shadow-sm">
					<div className="flex items-center justify-between border-b border-borderLight px-5 py-4">
						<h2 className="flex items-center gap-2 text-sm font-bold text-textPrimary">
							<Clock className="h-4 w-4 text-warning" />
							Pending Approvals
						</h2>
						<Link
							href="/users?filter=PENDING"
							className="text-xs font-semibold text-primary hover:underline">
							View all
						</Link>
					</div>

					<div className="flex-1 divide-y divide-borderLight overflow-y-auto max-h-[480px]">
						{loading ? (
							<div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-textSecondary" /></div>
						) : pendingUsers.length === 0 ? (
							<div className="flex flex-col items-center justify-center gap-2 px-5 py-10 text-center">
								<Clock className="h-8 w-8 text-borderLight" />
								<p className="text-sm text-textSecondary">No pending approvals.</p>
							</div>
						) : (
							<>
								{pendingUsers.slice(0, 6).map((user) => (
									<div
										key={user.id}
										className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-surfaceVariant/60">
										<div className="flex min-w-0 items-center gap-3">
											<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primaryLight text-sm font-bold text-primary">
												{user.name?.[0]?.toUpperCase() ?? "U"}
											</div>
											<div className="min-w-0">
												<div className="truncate text-sm font-semibold text-textPrimary">
													{user.name}
												</div>
												<div className="truncate text-xs text-textTertiary">
													{user.studentId} · {user.email}
												</div>
											</div>
										</div>
										<Link
											href={`/users/${user.id}`}
											className="shrink-0 text-xs font-bold text-primary hover:underline">
											Review
										</Link>
									</div>
								))}
								{pendingUsers.length > 6 && (
									<Link
										href="/users?filter=PENDING"
										className="flex items-center justify-center px-5 py-3 text-xs font-semibold text-textSecondary transition-colors hover:bg-surfaceVariant/60 hover:text-primary">
										View all {pendingUsers.length} pending users →
									</Link>
								)}
							</>
						)}
					</div>
				</section>

				{/* Audit Log Panel */}
				<section className="flex flex-col overflow-hidden rounded-xl border border-borderLight bg-surface shadow-sm">
					<div className="border-b border-borderLight px-4 py-4 sm:px-5">
						<h2 className="flex items-center gap-2 text-sm font-bold text-textPrimary">
							<AlertCircle className="h-4 w-4 text-textTertiary" />
							Trust Score Audit Log
						</h2>
					</div>
					<div className="flex-1 divide-y divide-borderLight overflow-y-auto max-h-[480px]">
						{loading ? (
							<div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-textSecondary" /></div>
						) : auditLogs.length === 0 ? (
							<div className="px-4 py-12 text-center text-sm text-textTertiary">
								No audit logs found.
							</div>
						) : (
							auditLogs.map((log, i) => (
								<div
									key={log.id ?? i}
									className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
									<div className="flex min-w-0 items-start gap-3 sm:items-center">
										{log.change > 0 ? (
											<TrendingUp className="h-4 w-4 shrink-0 text-success" />
										) : (
											<TrendingDown className="h-4 w-4 shrink-0 text-error" />
										)}
										<div className="min-w-0 max-w-full">
											<div className="truncate text-xs font-bold text-textPrimary">
												{log.name}
											</div>
											<div className="truncate text-xs text-textSecondary">
												{log.reason}
											</div>
											<div className="mt-0.5 text-[10px] text-textTertiary">
												{formatDate(log.timestamp)}
											</div>
										</div>
									</div>
									<span
										className={`self-start text-sm font-extrabold sm:ml-3 sm:self-auto ${
											log.change > 0 ? "text-success" : "text-error"
										}`}>
										{log.change > 0 ? `+${log.change}` : log.change}
									</span>
								</div>
							))
						)}
					</div>
				</section>
			</div>
		</div>
	);
}