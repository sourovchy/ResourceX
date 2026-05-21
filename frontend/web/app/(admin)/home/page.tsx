"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/cards/StatCard";
import api from "@/lib/api";
import {
	Users,
	PackageOpen,
	ShieldAlert,
	UserPlus,
	Clock,
	ArrowRight,
	Loader2,
	DollarSign,
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

		loadDashboard();

		return () => {
			active = false;
		};
	}, []);

	if (loading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center text-textSecondary">
				<Loader2 className="mr-2 h-5 w-5 animate-spin" />
				Loading admin dashboard...
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-textPrimary">
					Overview
				</h1>
				<p className="mt-1 text-sm text-textSecondary">
					Live platform metrics from the ResourceX database.
				</p>
			</div>

			{error && (
				<div className="rounded-lg border border-error/50 bg-errorLight px-5 py-4 text-sm font-semibold text-error">
					{error}
				</div>
			)}

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
				<StatCard
					icon={<Users className="h-5 w-5 text-blue-500" />}
					title="Total Users"
					value={String(stats?.totalUsers ?? 0)}
					tint="bg-blue-50 dark:bg-blue-950/40"
					iconColor="text-blue-500"
				/>
				<StatCard
					icon={<PackageOpen className="h-5 w-5 text-primary" />}
					title="Active Rentals"
					value={String(stats?.activeBookings ?? 0)}
					tint="bg-primaryLight"
					iconColor="text-primary"
				/>
				<StatCard
					icon={<DollarSign className="h-5 w-5 text-success" />}
					title="Revenue"
					value={`৳${Number(stats?.revenue ?? 0).toLocaleString()}`}
					tint="bg-successLight"
					iconColor="text-success"
				/>
				<StatCard
					icon={<UserPlus className="h-5 w-5 text-warning" />}
					title="Pending Approvals"
					value={String(stats?.pendingApprovals ?? pendingUsers.length)}
					tint="bg-warningLight"
					iconColor="text-warning"
				/>
			</div>

			<section className="overflow-hidden rounded-lg border border-borderLight bg-surface shadow-sm">
				<div className="flex items-center justify-between border-b border-borderLight px-5 py-4">
					<h2 className="flex items-center gap-2 font-bold text-textPrimary">
						<Clock className="h-4 w-4 text-warning" />
						Pending Approvals
					</h2>

					<Link
						href="/users?filter=PENDING"
						className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
						View all <ArrowRight className="h-3 w-3" />
					</Link>
				</div>

				<div className="divide-y divide-borderLight">
					{pendingUsers.length === 0 ? (
						<div className="p-6 text-sm text-textSecondary">
							No pending approvals.
						</div>
					) : (
						pendingUsers.slice(0, 6).map((user) => (
							<div
								key={user.id}
								className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-surfaceVariant/50">
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
									className="text-xs font-bold text-primary hover:underline">
									Review
								</Link>
							</div>
						))
					)}
				</div>
			</section>

			<section className="flex items-center gap-3 rounded-lg border border-borderLight bg-surface p-6 text-sm text-textSecondary">
				<ShieldAlert className="h-5 w-5 text-primary" />
				Admin pages are protected by frontend guards and backend role
				authorization.
			</section>
		</div>
	);
}