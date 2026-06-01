"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { AxiosError } from "axios";
import api, { getFileUrl } from "@/lib/api";
import SafeImage from "@/components/ui/SafeImage";
import {
	ShieldCheck,
	Users,
	Package,
	AlertTriangle,
	Settings,
	Activity,
	CheckCircle2,
	Loader2,
	RefreshCw,
} from "lucide-react";

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
	openDisputes?: number;
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
	const [refreshing, setRefreshing] = useState(false);
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
				openDisputes: (s as any).openDisputes ?? 0,
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

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadAdminData();
		setRefreshing(false);
	};

	const adminName = profile?.name || "System Admin";
	const roleText =
		profile?.role ||
		profile?.roles?.find((r) => r.includes("ADMIN")) ||
		"Platform Overseer";

	return (
		<div className="w-full space-y-6 px-4 pb-20 sm:px-6 lg:px-8">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h1 className="text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
					Admin Control Center
				</h1>

				<button
					type="button"
					onClick={handleRefresh}
					disabled={refreshing}
					className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-borderLight bg-surface px-4 py-2 text-sm font-semibold text-textPrimary shadow-sm transition hover:bg-background disabled:opacity-60 sm:w-auto">
					{refreshing ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<RefreshCw className="h-4 w-4" />
					)}
					Refresh
				</button>
			</div>

			{loading ? (
				<div className="rounded-2xl border border-borderLight bg-surface p-8 text-center text-textSecondary shadow-sm">
					<Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-primary" />
					Loading admin data...
				</div>
			) : error ? (
				<div className="rounded-2xl border border-error bg-errorLight p-4 text-sm text-error">
					{error}
				</div>
			) : null}

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<div className="space-y-6">
					<div className="flex flex-col items-center rounded-2xl border border-borderLight bg-surface p-4 text-center shadow-sm sm:p-6">
						<div className="relative mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-dashboardBlueTint text-2xl font-extrabold text-dashboardBlue sm:h-24 sm:w-24 sm:text-3xl">
							{profile?.avatarUrl ? (
								<SafeImage
									src={getFileUrl(profile.avatarUrl)}
									alt={adminName}
									fill
									className="object-cover"
									sizes="96px"
								/>
							) : (
								getInitials(profile?.name)
							)}
							<span className="absolute bottom-0 right-0 rounded-full border-2 border-surface bg-primary p-1 text-white z-10">
								<ShieldCheck className="h-4 w-4" />
							</span>
						</div>

						<h2 className="text-xl font-bold text-textPrimary">{adminName}</h2>
						<p className="text-sm font-medium text-textSecondary">
							User ID: {profile?.userId ?? "N/A"}
						</p>

						<div className="my-4 w-full border-t border-borderLight" />

						<div className="flex w-full flex-col gap-3 text-left text-sm text-textSecondary">
							<span className="flex items-center gap-2">
								<Activity className="h-4 w-4" /> Role: {roleText}
							</span>
							<span className="flex items-center gap-2">
								<Settings className="h-4 w-4" /> System Access: Full
							</span>
							{profile?.email && (
								<span className="truncate">Email: {profile.email}</span>
							)}
						</div>

						<Link
							href="/profile/edit"
							className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 font-bold text-white shadow-sm transition hover:bg-primaryDark">
							<Settings className="h-4 w-4" /> Profile Settings
						</Link>
					</div>

					<div className="rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6">
						<h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-textSecondary">
							Quick Actions
						</h3>
						<div className="flex flex-col gap-2">
							<Link
								href="/users"
								className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-surfaceVariant">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-dashboardBlueTint text-dashboardBlue">
									<Users className="h-5 w-5" />
								</div>
								<div>
									<div className="font-semibold text-textPrimary">Manage Users</div>
									<div className="text-xs text-textSecondary">View and manage all users</div>
								</div>
							</Link>
							<Link
								href="/disputes"
								className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-surfaceVariant">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warningLight text-warningDark">
									<AlertTriangle className="h-5 w-5" />
								</div>
								<div>
									<div className="font-semibold text-textPrimary">Review Disputes</div>
									<div className="text-xs text-textSecondary">Handle user disputes</div>
								</div>
							</Link>
							<Link
								href="/bookings"
								className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-surfaceVariant">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-successLight text-success">
									<Package className="h-5 w-5" />
								</div>
								<div>
									<div className="font-semibold text-textPrimary">Monitor Bookings</div>
									<div className="text-xs text-textSecondary">View all system bookings</div>
								</div>
							</Link>
						</div>
					</div>
				</div>

				<div className="space-y-6">
					<h2 className="text-lg font-bold text-textPrimary">
						Platform Overview
					</h2>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="flex items-center gap-4 rounded-2xl border border-borderLight bg-surface p-4 sm:p-5">
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
						</div>

						<div className="flex items-center gap-4 rounded-2xl border border-borderLight bg-surface p-4 sm:p-5">
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
						</div>

						<div className="flex items-center gap-4 rounded-2xl border border-borderLight bg-surface p-4 sm:p-5">
							<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warningLight text-warningDark">
								<AlertTriangle className="h-6 w-6" />
							</div>
							<div>
								<div className="text-xl font-extrabold text-textPrimary sm:text-2xl">
									{formatNumber(stats?.openDisputes)}
								</div>
								<div className="text-xs font-bold uppercase tracking-wider text-textSecondary">
									Open Disputes
								</div>
							</div>
						</div>

						<div className="flex items-center gap-4 rounded-2xl border border-borderLight bg-surface p-4 sm:p-5">
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
						</div>
					</div>

				</div>
			</div>
		</div>
	);
}
