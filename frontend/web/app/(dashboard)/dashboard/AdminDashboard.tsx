"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/cards/StatCard";
import { TiltCard } from "@/components/ui/TiltCard";
import api from "@/lib/api";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import {
	Package,
	PackageOpen,
	Clock,
	AlertCircle,
	Ban,
	AlertTriangle,
	ShieldCheck,
	ShieldAlert,
	ChevronRight,
} from "lucide-react";
import PendingUsersTab, { PendingUser } from "./admin/PendingUsersTab";
import ReportsTab, { Report } from "./admin/ReportsTab";

type DashboardStats = {
	totalUsers: number;
	activeBookings: number;
	pendingApprovals: number;
	verifiedStudents: number;
	totalListings: number;
	availableListings: number;
	activeRentals: number;
	reportsPendingReview: number;
	suspendedUsers: number;
};

export default function AdminHomePage() {
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
	const [reports, setReports] = useState<Report[]>([]);

	const [activeTab, setActiveTab] = useState<"pending" | "reports">("pending");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const loadDashboardStatsAndLists = useCallback(async (silent = false) => {
		try {
			if (!silent) setLoading(true);
			setError("");

			const [statsRes, pendingRes, reportsRes] = await Promise.all([
				api.get<DashboardStats>("/admin/dashboard").catch(() => ({
					data: {
						totalUsers: 0,
						activeBookings: 0,
						pendingApprovals: 0,
						verifiedStudents: 0,
						totalListings: 0,
						availableListings: 0,
						activeRentals: 0,
						reportsPendingReview: 0,
						suspendedUsers: 0,
					} as DashboardStats,
				})),
				api.get<{ content?: any[] }>("/admin/pending-users").catch(() => ({
					data: { content: [] as any[] },
				})),
				api.get<Report[]>("/admin/reports").catch(() => ({
					data: [],
				})),
			]);

			setStats(statsRes.data);
			const mappedPending: PendingUser[] = (Array.isArray(pendingRes.data?.content) ? pendingRes.data.content : []).map((u: any) => ({
				id: u.userId ?? u.id,
				name: u.name ?? "",
				email: u.email ?? "",
				studentId: u.studentProfile?.studentId ?? u.studentId ?? "—",
				university: u.studentProfile?.university ?? u.university ?? "—",
				department: u.studentProfile?.department ?? u.department ?? "—",
				createdAt: u.createdAt,
			}));
			setPendingUsers(mappedPending);
			setReports(Array.isArray(reportsRes.data) ? reportsRes.data : []);
		} catch (err) {
			console.error(err);
			setError("Could not load dashboard platform stats.");
		} finally {
			if (!silent) setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadDashboardStatsAndLists();
	}, [loadDashboardStatsAndLists]);

	useAutoRefresh(() => void loadDashboardStatsAndLists(true), { intervalMs: 30_000 });

	return (
		<div className="space-y-6 pb-20 sm:pb-6 animate-fade-in graph-grid">
			{/* Welcome strip / Header */}
			<div className="glass-surface relative overflow-hidden rounded-2xl p-6 shadow-sm">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 className="mt-1 text-2xl font-extrabold tracking-tight text-textPrimary sm:text-3xl">
							Admin <span className="text-gradient-brand italic">Dashboard.</span>
						</h1>
						<p className="mt-1 text-sm text-textSecondary">
							ResourceX real-time metrics, verification workflows, and operational action queues.
						</p>
					</div>
				</div>
			</div>

			{/* Error banner */}
			{error && (
				<div className="flex items-center gap-3 rounded-xl border border-error/30 bg-errorLight px-4 py-3.5 text-sm font-medium text-error animate-slide-down shadow-sm">
					<AlertCircle className="h-5 w-5 shrink-0" />
					{error}
				</div>
			)}

			{/* Platform Health Indicators Panel (Immediate Attention Actions) */}
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 stagger-children">
				<HealthTile
					href="/users?filter=PENDING"
					tone="border-warning/30 bg-warningLight/50"
					iconWrap="bg-warningLight text-warning"
					icon={<Clock className="h-5 w-5" />}
					label="Pending Review"
					value={`${stats?.pendingApprovals ?? 0} Users`}
				/>
				<HealthTile
					href="/moderation"
					tone="border-error/30 bg-errorLight/50"
					iconWrap="bg-errorLight text-error"
					icon={<AlertTriangle className="h-5 w-5" />}
					label="Pending Reports"
					value={`${stats?.reportsPendingReview ?? 0} Reports`}
				/>
				<div className="col-span-2 sm:col-span-1">
					<HealthTile
						href="/users?filter=SUSPENDED"
						tone="border-border bg-surfaceVariant/50 w-full"
						iconWrap="bg-surfaceVariant text-textSecondary"
						icon={<Ban className="h-5 w-5" />}
						label="Suspended Accounts"
						value={`${stats?.suspendedUsers ?? 0} Users`}
					/>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 stagger-children">
				<StatCard
					loading={loading}
					icon={<Package className="h-5 w-5 text-primary" />}
					title="Total / Available Listings"
					value={`${stats?.totalListings ?? 0} / ${stats?.availableListings ?? 0}`}
					tint="bg-primaryLight"
					href="/items"
				/>
				<StatCard
					loading={loading}
					icon={<ShieldCheck className="h-5 w-5 text-success" />}
					title="Verified Students"
					value={String(stats?.verifiedStudents ?? 0)}
					tint="bg-successLight"
					href="/users?filter=VERIFIED"
				/>
				<StatCard
					loading={loading}
					icon={<PackageOpen className="h-5 w-5 text-primary" />}
					title="Active Rentals"
					value={String(stats?.activeRentals ?? 0)}
					tint="bg-primaryLight"
					href="/bookings"
					className="col-span-2 sm:col-span-1"
				/>
			</div>

			{/* Main section: tabbed for maximum mobile layout optimization */}
			<section id="main-tabs-section" className="flex flex-col rounded-2xl border border-borderLight bg-surface shadow-sm overflow-hidden">
				{/* Tab Selection */}
				<div className="flex border-b border-borderLight bg-card overflow-x-auto scrollbar-thin">
					<TabButton
						active={activeTab === "pending"}
						onClick={() => setActiveTab("pending")}
						icon={<Clock className="h-4 w-4" />}
						label="Pending Approvals"
						badge={pendingUsers.length > 0 ? pendingUsers.length : undefined}
					/>
					<TabButton
						active={activeTab === "reports"}
						onClick={() => setActiveTab("reports")}
						icon={<ShieldAlert className="h-4 w-4" />}
						label="Flagged Reports"
						badge={reports.length > 0 ? reports.length : undefined}
					/>
				</div>

				{/* TAB CONTENTS */}
				<div className="p-5 flex-1 min-h-[400px]">
					{activeTab === "pending" && (
						<PendingUsersTab pendingUsers={pendingUsers} loading={loading} />
					)}
					{activeTab === "reports" && (
						<ReportsTab reports={reports} loading={loading} />
					)}
				</div>
			</section>
		</div>
	);
}

function HealthTile({
	href,
	tone,
	iconWrap,
	icon,
	label,
	value,
}: {
	href: string;
	tone: string;
	iconWrap: string;
	icon: React.ReactNode;
	label: string;
	value: string;
}) {
	return (
		<Link href={href} className="w-full">
			<TiltCard
				maxTilt={1}
				className={`group flex items-center gap-3 rounded-xl border p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md ${tone}`}
			>
				<div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconWrap}`}>
					{icon}
				</div>
				<div className="min-w-0 flex-1">
					<div className="text-[10px] font-bold uppercase tracking-wider text-textTertiary">{label}</div>
					<div className="text-lg font-bold text-textPrimary">{value}</div>
				</div>
				<ChevronRight className="ml-auto h-4 w-4 shrink-0 text-textTertiary transition group-hover:translate-x-0.5 group-hover:text-primary" />
			</TiltCard>
		</Link>
	);
}

function TabButton({
	active,
	onClick,
	icon,
	label,
	badge,
}: {
	active: boolean;
	onClick: () => void;
	icon: React.ReactNode;
	label: string;
	badge?: number;
}) {
	return (
		<button
			onClick={onClick}
			className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all relative whitespace-nowrap ${
				active
					? "border-primary text-primary bg-surface"
					: "border-transparent text-textSecondary hover:text-textPrimary hover:bg-surfaceVariant/30"
			}`}>
			{icon}
			{label}
			{badge !== undefined && (
				<span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-warning text-[10px] font-bold text-white">
					{badge}
				</span>
			)}
		</button>
	);
}
