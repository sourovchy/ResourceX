"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import {
	ShieldCheck,
	Users,
	Package,
	AlertTriangle,
	BarChart3,
	Settings,
	Activity,
	CheckCircle2,
	Search,
	MessageSquareWarning,
	Loader2,
	RefreshCw,
} from "lucide-react";

type AdminProfile = {
	userId?: number;
	name?: string;
	email?: string;
	role?: string;
	roles?: string[];
};

type DashboardStats = {
	totalUsers?: number;
	totalListings?: number;
	openDisputes?: number;
	pendingVerifs?: number;
	uptime?: string;
	status?: string;
	stability?: string;
	load?: string;
};

type FlaggedActivity = {
	id?: string | number;
	title?: string;
	description?: string;
	priority?: "HIGH" | "MEDIUM" | "LOW" | string;
	type?: string;
};

type ApiError = {
	message?: string;
};

const api = axios.create({
	baseURL:
		process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8080",
	headers: {
		"Content-Type": "application/json",
	},
});

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
	const [activities, setActivities] = useState<FlaggedActivity[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState("");

	const authHeaders = useMemo(() => {
		if (typeof window === "undefined") return {};
		const token = localStorage.getItem("resourcex_token");
		return token ? { Authorization: `Bearer ${token}` } : {};
	}, []);

	const loadAdminData = async () => {
		try {
			setError("");

			// Change these paths only if your controller mappings are different.
			const [meRes, statsRes, activitiesRes] = await Promise.all([
				api.get<AdminProfile>("/api/auth/me", { headers: authHeaders }),
				api.get<DashboardStats>("/api/admin/dashboard/stats", {
					headers: authHeaders,
				}),
				api.get<{ items?: FlaggedActivity[]; data?: FlaggedActivity[] }>(
					"/api/admin/reports/recent",
					{ headers: authHeaders },
				),
			]);

			setProfile(meRes.data);
			setStats(statsRes.data);

			const list = activitiesRes.data.items ?? activitiesRes.data.data ?? [];
			setActivities(list);
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
		<div className="max-w-4xl mx-auto space-y-6 pb-20">
			<div className="flex items-center justify-between gap-3">
				<h1 className="text-2xl font-bold text-textPrimary tracking-tight">
					Admin Control Center
				</h1>

				<button
					type="button"
					onClick={handleRefresh}
					disabled={refreshing}
					className="inline-flex items-center gap-2 rounded-xl border border-borderLight bg-surface px-4 py-2 text-sm font-semibold text-textPrimary shadow-sm transition hover:bg-background disabled:opacity-60">
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

			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				<div className="space-y-6 md:col-span-1">
					<div className="flex flex-col items-center rounded-2xl border border-borderLight bg-surface p-6 text-center shadow-sm">
						<div className="relative mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-dashboardBlueTint text-3xl font-extrabold text-dashboardBlue">
							{getInitials(profile?.name)}
							<span className="absolute bottom-0 right-0 rounded-full border-2 border-surface bg-primary p-1 text-white">
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
							href="/admin/settings"
							className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 font-bold text-white shadow-sm transition hover:bg-primaryDark">
							<Settings className="h-4 w-4" /> System Settings
						</Link>
					</div>

					<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primaryDark p-6 text-center text-white shadow-sm">
						<BarChart3 className="absolute -right-4 -top-4 h-24 w-24 opacity-10" />
						<div className="mb-2 text-sm font-bold uppercase tracking-wider opacity-90">
							Platform Status
						</div>
						<div className="mb-1 text-4xl font-extrabold leading-none">
							{stats?.status || "Active"}
						</div>
						<div className="mt-3 rounded-full bg-white/20 px-3 py-1 text-sm font-bold backdrop-blur-sm">
							Uptime: {stats?.uptime || "—"}
						</div>

						<div className="mt-6 space-y-1">
							<div className="flex justify-between text-xs font-bold opacity-80">
								<span>Stability</span>
								<span>{stats?.stability || "Normal Load"}</span>
							</div>
							<div className="h-2 w-full overflow-hidden rounded-full bg-black/20">
								<div className="h-full w-[92%] rounded-full bg-white" />
							</div>
						</div>
					</div>
				</div>

				<div className="space-y-6 md:col-span-2">
					<h2 className="text-lg font-bold text-textPrimary">
						Platform Overview
					</h2>

					<div className="grid grid-cols-2 gap-4">
						<div className="flex items-center gap-4 rounded-2xl border border-borderLight bg-surface p-5">
							<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primaryLight text-primary">
								<Users className="h-6 w-6" />
							</div>
							<div>
								<div className="text-2xl font-extrabold text-textPrimary">
									{formatNumber(stats?.totalUsers)}
								</div>
								<div className="text-xs font-bold uppercase tracking-wider text-textSecondary">
									Total Users
								</div>
							</div>
						</div>

						<div className="flex items-center gap-4 rounded-2xl border border-borderLight bg-surface p-5">
							<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-dashboardBlueTint text-dashboardBlue">
								<Package className="h-6 w-6" />
							</div>
							<div>
								<div className="text-2xl font-extrabold text-textPrimary">
									{formatNumber(stats?.totalListings)}
								</div>
								<div className="text-xs font-bold uppercase tracking-wider text-textSecondary">
									Total Listings
								</div>
							</div>
						</div>

						<div className="flex items-center gap-4 rounded-2xl border border-borderLight bg-surface p-5">
							<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warningLight text-warningDark">
								<AlertTriangle className="h-6 w-6" />
							</div>
							<div>
								<div className="text-2xl font-extrabold text-textPrimary">
									{formatNumber(stats?.openDisputes)}
								</div>
								<div className="text-xs font-bold uppercase tracking-wider text-textSecondary">
									Open Disputes
								</div>
							</div>
						</div>

						<div className="flex items-center gap-4 rounded-2xl border border-borderLight bg-surface p-5">
							<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-successLight text-success">
								<CheckCircle2 className="h-6 w-6" />
							</div>
							<div>
								<div className="text-2xl font-extrabold text-textPrimary">
									{formatNumber(stats?.pendingVerifs)}
								</div>
								<div className="text-xs font-bold uppercase tracking-wider text-textSecondary">
									Pending Verifs
								</div>
							</div>
						</div>
					</div>

					<div className="space-y-4 rounded-2xl border border-borderLight bg-surface p-6">
						<div className="mb-2 flex items-center justify-between">
							<h2 className="text-lg font-bold text-textPrimary">
								Flagged Activities
							</h2>
							<Link
								href="/admin/reports"
								className="text-sm font-bold text-primary hover:underline">
								Review All
							</Link>
						</div>

						{activities.length === 0 ? (
							<div className="rounded-xl border border-dashed border-borderLight p-6 text-sm text-textSecondary">
								No flagged activities right now.
							</div>
						) : (
							<div className="divide-y divide-borderLight">
								{activities.map((item, index) => (
									<div key={item.id ?? index} className="py-4">
										<div className="mb-2 flex items-center justify-between">
											<div className="flex items-center gap-2">
												{item.type === "PENALTY" ? (
													<Search className="h-4 w-4 text-dashboardBlue" />
												) : (
													<MessageSquareWarning className="h-4 w-4 text-warningDark" />
												)}
												<div className="text-sm font-bold text-textPrimary">
													{item.title || "Flagged item"}
												</div>
											</div>

											<span
												className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
													(item.priority || "").toUpperCase() === "HIGH"
														? "bg-warningLight text-warningDark"
														: "bg-dashboardBlueTint text-dashboardBlue"
												}`}>
												{item.priority || "Review"}
											</span>
										</div>

										<p className="text-sm text-textSecondary">
											{item.description || "No description provided by backend."}
										</p>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
