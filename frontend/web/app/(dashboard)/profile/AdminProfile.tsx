"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AxiosError } from "axios";
import api from "@/lib/api";
import { Card } from "@/components/ui/Card";
import ActionCard from "@/components/cards/ActionCard";
import {
	ShieldCheck,
	Users,
	Package,
	Settings,
	Activity,
	CheckCircle2,
	Loader2,
} from "lucide-react";
import { ProfileHeaderCard } from "@/components/profile/ProfileHeaderCard";
import { TiltCard } from "@/components/ui/TiltCard";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

type AdminProfile = {
	userId?: number;
	name?: string;
	email?: string;
	role?: string;
	roles?: string[];
	avatarUrl?: string | null;
};

type DashboardStats = {
	totalUsers?: number;
	totalListings?: number;
	pendingVerifs?: number;
};

type ApiError = {
	message?: string;
};

function formatNumber(value: number | undefined) {
	return new Intl.NumberFormat("en-US").format(value ?? 0);
}

function getInitials(name?: string) {
	if (!name) return "CV";
	const parts = name.trim().split(/\s+/);
	return parts
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");
}

export default function AdminProfilePage() {
	const [profile, setProfile] = useState<AdminProfile | null>(null);
	const [stats, setStats] = useState<DashboardStats | null>(null);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const loadAdminData = async () => {
		try {
			setError("");

			// Use shared `api` client (baseURL already set to /api) and correct paths.
			const mePromise = api.get<AdminProfile>("/auth/me");
			const statsPromise = api.get<DashboardStats>("/admin/dashboard");

			const [meRes, statsRes] = await Promise.all([
				mePromise,
				statsPromise,
			]);

			// `GET /auth/me` returns { user, roles } — extract the nested user if present.
			const meData: any = meRes.data;
			setProfile(meData?.user ?? meData ?? null);
			// Map backend DashboardStatsResponse to frontend display shape.
			const s = statsRes.data || {};
			setStats({
				totalUsers: (s as any).totalUsers ?? 0,
				totalListings: (s as any).totalListings ?? 0,
				pendingVerifs: (s as any).pendingApprovals ?? 0,
			});
		} catch (err) {
			const axiosError = err as AxiosError<ApiError>;
			setError(
				axiosError.response?.data?.message ||
					"Failed to load admin data from the backend.",
			);
		}
	};

	useEffect(() => {
		let mounted = true;

		(async () => {
			setLoading(true);
			await loadAdminData();
			if (mounted) setLoading(false);
		})();

		return () => {
			mounted = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Auto-refresh admin summary on tab focus + moderate polling
	useAutoRefresh(loadAdminData, { intervalMs: 60_000 });

	const adminName = profile?.name || "System Admin";
	const roleText =
		profile?.role ||
		profile?.roles?.find((r) => r.includes("ADMIN")) ||
		"Platform Overseer";

	return (
		<div className="w-full space-y-6 px-4 pb-20 sm:px-6 lg:px-8">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div className="min-w-0">
<h2 className="mt-1 text-3xl font-bold tracking-tighter text-textPrimary sm:text-5xl">
						Control <span className="text-gradient-brand italic">Center.</span>
					</h2>
				</div>
			</div>

			{loading ? (
				<Card padding="none" className="p-8 text-center text-textSecondary">
					<Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-primary" />
					Loading admin data...
				</Card>
			) : error ? (
				<div className="rounded-2xl border border-error bg-errorLight p-4 text-sm text-error">
					{error}
				</div>
			) : null}

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<div className="space-y-6">
					<ProfileHeaderCard
						avatarUrl={profile?.avatarUrl}
						initials={getInitials(profile?.name)}
						avatarBadge={<ShieldCheck className="h-5 w-5" />}
						avatarBgClass="bg-dashboardBlueTint text-dashboardBlue [&>span]:bg-primary [&>span]:text-white"
						name={adminName}
						infoRows={[
							{ icon: <Users className="h-4 w-4" />, text: `User ID: ${profile?.userId ?? "N/A"}` },
							{ icon: <Activity className="h-4 w-4" />, text: `Role: ${roleText}` },
							...(profile?.email ? [{ icon: <Settings className="h-4 w-4" />, text: `Email: ${profile.email}` }] : [])
						]}
						actions={
							<Link
								href="/profile/edit"
								className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primaryDark hover:shadow-md"
							>
								<Settings className="h-4 w-4" /> Profile Settings
							</Link>
						}
					/>

					<Card padding="none" className="p-4 sm:p-6">
						<h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-textSecondary">
							Quick Actions
						</h3>
						<div className="flex flex-col gap-2">
							<ActionCard
								variant="row"
								href="/users"
								bgIcon="bg-dashboardBlueTint text-dashboardBlue"
								icon={<Users className="h-5 w-5" />}
								title="Manage Users"
								description="View and manage all users"
							/>
							<ActionCard
								variant="row"
								href="/bookings"
								bgIcon="bg-successLight text-success"
								icon={<Package className="h-5 w-5" />}
								title="Monitor Bookings"
								description="View all system bookings"
							/>
						</div>
					</Card>
				</div>

				<div className="space-y-6">
					<h2 className="text-lg font-bold text-textPrimary">
						Platform Overview
					</h2>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<TiltCard
							maxTilt={1}
							className="flex items-center gap-4 rounded-2xl border border-borderLight bg-surface p-4 sm:p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-md"
						>
							<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primaryLight text-primary">
								<Users className="h-6 w-6" />
							</div>
							<div>
								<div className="text-xl font-extrabold text-textPrimary sm:text-2xl">
									{formatNumber(stats?.totalUsers)}
								</div>
								<div className="text-xs font-bold uppercase tracking-wider text-textSecondary">
									Total Users
								</div>
							</div>
						</TiltCard>

						<TiltCard
							maxTilt={1}
							className="flex items-center gap-4 rounded-2xl border border-borderLight bg-surface p-4 sm:p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-md"
						>
							<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-dashboardBlueTint text-dashboardBlue">
								<Package className="h-6 w-6" />
							</div>
							<div>
								<div className="text-xl font-extrabold text-textPrimary sm:text-2xl">
									{formatNumber(stats?.totalListings)}
								</div>
								<div className="text-xs font-bold uppercase tracking-wider text-textSecondary">
									Total Listings
								</div>
							</div>
						</TiltCard>

						<TiltCard
							maxTilt={1}
							className="flex items-center gap-4 rounded-2xl border border-borderLight bg-surface p-4 sm:p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-md"
						>
							<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-successLight text-success">
								<CheckCircle2 className="h-6 w-6" />
							</div>
							<div>
								<div className="text-xl font-extrabold text-textPrimary sm:text-2xl">
									{formatNumber(stats?.pendingVerifs)}
								</div>
								<div className="text-xs font-bold uppercase tracking-wider text-textSecondary">
									Pending Verifs
								</div>
							</div>
						</TiltCard>
					</div>

				</div>
			</div>
		</div>
	);
}
