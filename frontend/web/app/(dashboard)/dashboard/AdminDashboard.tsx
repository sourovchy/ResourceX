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

type ApiListResponse<T> =
	| T[]
	| {
			data?: T[];
			content?: T[];
	  };

function normalizeListResponse<T>(payload: ApiListResponse<T> | any): T[] {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.data)) return payload.data;
	if (Array.isArray(payload?.content)) return payload.content;
	return [];
}

export default function AdminHomePage() {
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let active = true;

		async function loadDashboard() {
			try {
				setLoading(true);
				setError("");

				const [statsRes, pendingRes] = await Promise.all([
					api.get<DashboardStats | { data?: DashboardStats }>("/admin/dashboard"),
					api.get<ApiListResponse<PendingUser> | any>("/admin/pending-users"),
				]);

				if (!active) return;

				const statsData = (statsRes.data as any)?.data ?? statsRes.data;
				setStats(statsData as DashboardStats);

				const pendingList = normalizeListResponse<PendingUser>(pendingRes.data);
				setPendingUsers(pendingList);
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

	if (loading) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-textSecondary">
				<Loader2 className="h-6 w-6 animate-spin text-primary" />
				<span className="text-sm font-medium">Loading admin dashboard…</span>
			</div>
		);
	}

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
					icon={<Users className="h-5 w-5 text-dashboardBlue" />}
					title="Total Users"
					value={String(stats?.totalUsers ?? 0)}
					tint="bg-dashboardBlueTint"
				/>
				<StatCard
					icon={<PackageOpen className="h-5 w-5 text-primary" />}
					title="Active Rentals"
					value={String(stats?.activeBookings ?? 0)}
					tint="bg-primaryLight"
				/>
				<StatCard
					icon={<DollarSign className="h-5 w-5 text-success" />}
					title="Revenue"
					value={`৳${Number(stats?.revenue ?? 0).toLocaleString()}`}
					tint="bg-successLight"
				/>
				<StatCard
					icon={<UserPlus className="h-5 w-5 text-warning" />}
					title="Pending Approvals"
					value={String(stats?.pendingApprovals ?? pendingUsers.length)}
					tint="bg-warningLight"
				/>
			</div>

			{/* Pending approvals panel – styled like StudentDashboard's panels */}
			<section className="overflow-hidden rounded-xl border border-borderLight bg-surface shadow-sm">
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

				<div className="divide-y divide-borderLight">
					{pendingUsers.length === 0 ? (
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
		</div>
	);
}