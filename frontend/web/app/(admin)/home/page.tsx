"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/cards/StatCard";
import {
	ApprovalRequest,
	formatSubmittedAt,
	getApprovalRequests,
} from "@/lib/approvalRequests";
import {
	Users,
	PackageOpen,
	AlertTriangle,
	ShieldAlert,
	Package,
	UserPlus,
	CheckCircle2,
	XCircle,
	Clock,
	ArrowRight,
	TrendingUp,
	Activity,
	Wifi,
	Server,
	Database,
} from "lucide-react";

type VerificationItem = {
	id: string;
	name: string;
	email: string;
	phone?: string;
	studentId: string;
	university?: string;
	department?: string;
	idCardFileName?: string;
	idCardDataUrl?: string;
	submitted: string;
};

const PENDING_VERIFICATIONS: VerificationItem[] = [
	{
		id: "U001",
		name: "Arif Hossain",
		email: "arif@uni.edu",
		studentId: "20-44512",
		submitted: "2h ago",
	},
	{
		id: "U002",
		name: "Priya Sen",
		email: "priya@uni.edu",
		studentId: "21-33102",
		submitted: "4h ago",
	},
	{
		id: "U003",
		name: "Mehedi Islam",
		email: "mehedi@uni.edu",
		studentId: "22-10045",
		submitted: "6h ago",
	},
	{
		id: "U004",
		name: "Tanvir Ahmed",
		email: "tanvir@uni.edu",
		studentId: "20-99871",
		submitted: "1d ago",
	},
];

const RECENT_DISPUTES = [
	{
		id: "D001",
		booking: "BK-2041",
		raised: "Arif Hossain",
		reason: "Item returned damaged – charger broken",
		status: "OPEN",
		time: "1h ago",
	},
	{
		id: "D002",
		booking: "BK-2039",
		raised: "Priya Sen",
		reason: "Owner did not hand over the item on time",
		status: "OPEN",
		time: "3h ago",
	},
	{
		id: "D003",
		booking: "BK-2035",
		raised: "Mehedi Islam",
		reason: "Deposit not returned after item return",
		status: "RESOLVED",
		time: "1d ago",
	},
];

const HEALTH_ITEMS = [
	{ label: "API Server", status: "Operational", icon: Server, ok: true },
	{ label: "Database", status: "Operational", icon: Database, ok: true },
	{ label: "CDN / Storage", status: "Degraded", icon: Wifi, ok: false },
	{ label: "Email Service", status: "Operational", icon: Activity, ok: true },
];

export default function AdminHomePage() {
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);

	useEffect(() => {
		setApprovalRequests(getApprovalRequests());
	}, []);

	const pendingVerifications = useMemo<VerificationItem[]>(() => {
		const submittedRequests = approvalRequests
			.filter((request) => request.status === "PENDING")
			.map((request) => ({
				id: request.id,
				name: request.name,
				email: request.email,
				phone: request.phone,
				studentId: request.studentId,
				university: request.university,
				department: request.department,
				idCardFileName: request.idCardFileName,
				idCardDataUrl: request.idCardDataUrl,
				submitted: formatSubmittedAt(request.submittedAt),
			}));

		return [...submittedRequests, ...PENDING_VERIFICATIONS];
	}, [approvalRequests]);

	const selectedVerification =
		pendingVerifications.find((item) => item.id === selectedUserId) ?? null;

	return (
		<div className="max-w-7xl mx-auto space-y-8">
			{/* Page header */}
			<div>
				<h1 className="text-2xl font-bold text-textPrimary tracking-tight">
					Overview
				</h1>
				<p className="text-textSecondary text-sm mt-1">
					Monitor system metrics, pending tasks, and platform health.
				</p>
			</div>

			{/* Stat Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
				<div className="rounded-2xl shadow-md">
					<StatCard
						icon={<Users className="w-5 h-5 text-blue-500" />}
						title="Total Users"
						value="1,428"
						sub="+23 this week"
						tint="bg-blue-50 dark:bg-blue-950/40"
						iconColor="text-blue-500"
					/>
				</div>

				<div className="rounded-2xl shadow-md">
					<StatCard
						icon={<PackageOpen className="w-5 h-5 text-primary" />}
						title="Active Rentals"
						value="214"
						tint="bg-primaryLight"
						iconColor="text-primary"
					/>
				</div>

				<div className="rounded-2xl shadow-md">
					<StatCard
						icon={<AlertTriangle className="w-5 h-5 text-warning" />}
						title="Overdue Rentals"
						value="18"
						sub="Needs attention"
						tint="bg-warningLight"
						iconColor="text-warning"
					/>
				</div>

				<div className="rounded-2xl shadow-md">
					<StatCard
						icon={<ShieldAlert className="w-5 h-5 text-error" />}
						title="Pending Disputes"
						value="7"
						tint="bg-errorLight"
						iconColor="text-error"
					/>
				</div>

				<div className="rounded-2xl shadow-md">
					<StatCard
						icon={<Package className="w-5 h-5 text-accent" />}
						title="Total Items"
						value="862"
						tint="bg-accentLight"
						iconColor="text-accent"
					/>
				</div>

				<div className="rounded-2xl shadow-md">
					<StatCard
						icon={<UserPlus className="w-5 h-5 text-success" />}
						title="New Today"
						value="12"
						sub="Registrations pending"
						tint="bg-successLight"
						iconColor="text-success"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Pending Verifications */}
				<div className="lg:col-span-2 bg-surface border border-borderLight rounded-2xl shadow-sm overflow-hidden">
					<div className="flex items-center justify-between px-5 py-4 border-b border-borderLight">
						<h2 className="font-bold text-textPrimary flex items-center gap-2">
							<Clock className="w-4 h-4 text-warning" />
							Pending Verifications
						</h2>
						<Link
							href="/users?filter=PENDING"
							className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
							View all <ArrowRight className="w-3 h-3" />
						</Link>
					</div>

					<div className="divide-y divide-borderLight">
						{pendingVerifications.map((u) => (
							<div
								key={u.id}
								className="flex items-center justify-between px-5 py-3.5 hover:bg-surfaceVariant/50 transition-colors">
								<div className="flex items-center gap-3 min-w-0">
									<div className="w-9 h-9 rounded-full bg-primaryLight flex items-center justify-center font-bold text-primary text-sm shrink-0">
										{u.name[0]}
									</div>
									<div className="min-w-0">
										<div className="text-sm font-semibold text-textPrimary truncate">
											{u.name}
										</div>
										<div className="text-xs text-textTertiary">
											{u.studentId} · {u.submitted}
										</div>
										<div className="text-xs text-textTertiary truncate max-w-xs">
											{u.email}
										</div>
									</div>
								</div>

								<div className="flex items-center gap-2 shrink-0 ml-3">
									<Link
										href={`/users/${u.id}`}
										className="flex items-center gap-1 px-3 py-1.5 bg-surfaceVariant text-textSecondary rounded-lg text-xs font-bold hover:bg-borderLight transition">
										View
									</Link>
								</div>
							</div>
						))}
					</div>
				</div>


			</div>

			{/* Recent Disputes */}
			<div className="bg-surface border border-borderLight rounded-2xl shadow-sm overflow-hidden">
				<div className="flex items-center justify-between px-5 py-4 border-b border-borderLight">
					<h2 className="font-bold text-textPrimary flex items-center gap-2">
						<ShieldAlert className="w-4 h-4 text-error" />
						Recent Disputes
					</h2>
					<Link
						href="/disputesAdmin"
						className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
						View all <ArrowRight className="w-3 h-3" />
					</Link>
				</div>

				<div className="divide-y divide-borderLight">
					{RECENT_DISPUTES.map((d) => (
						<div
							key={d.id}
							className="flex items-center justify-between px-5 py-4 hover:bg-surfaceVariant/50 transition-colors">
							<div className="flex items-center gap-4 min-w-0">
								<div
									className={`w-2.5 h-2.5 rounded-full shrink-0 ${
										d.status === "OPEN" ? "bg-error" : "bg-success"
									}`}
								/>
								<div className="min-w-0">
									<div className="flex items-center gap-2">
										<span className="text-sm font-bold text-textPrimary">
											{d.booking}
										</span>
										<span className="text-xs text-textTertiary">
											by {d.raised}
										</span>
									</div>
									<p className="text-xs text-textSecondary mt-0.5 truncate max-w-md">
										{d.reason}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3 shrink-0 ml-4">
								<span className="text-xs text-textTertiary">{d.time}</span>
								<span
									className={`text-xs font-bold px-2.5 py-1 rounded-full ${
										d.status === "OPEN"
											? "bg-errorLight text-error"
											: "bg-successLight text-success"
									}`}>
									{d.status}
								</span>

								{d.status === "OPEN" && (
									<Link
										href={`/disputesAdmin`}
										className="text-xs font-bold text-primary hover:underline">
										Resolve
									</Link>
								)}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Simple action indicator for selected verification */}
			{selectedVerification && (
				<div className="fixed bottom-4 right-4 bg-surface border border-borderLight shadow-lg rounded-2xl px-4 py-3 flex items-center gap-3">
					<div className="flex items-start gap-3 max-w-lg">
						<CheckCircle2 className="w-4 h-4 text-success" />
						<div className="min-w-0 text-sm">
							<div className="font-bold text-textPrimary">
								{selectedVerification.name}
							</div>
							<div className="text-textSecondary">
								{selectedVerification.studentId} · {selectedVerification.email}
							</div>
							{selectedVerification.phone && (
								<div className="text-textSecondary">
									{selectedVerification.phone} ·{" "}
									{selectedVerification.department}
								</div>
							)}
							{selectedVerification.university && (
								<div className="text-textTertiary truncate">
									{selectedVerification.university}
								</div>
							)}
							{selectedVerification.idCardDataUrl && (
								<img
									src={selectedVerification.idCardDataUrl}
									alt="Student ID card preview"
									className="mt-2 h-24 w-full rounded-lg border border-borderLight object-contain bg-surfaceVariant"
								/>
							)}
						</div>
					</div>
					<button
						type="button"
						onClick={() => setSelectedUserId(null)}
						className="p-1 rounded-lg hover:bg-surfaceVariant transition"
						aria-label="Close">
						<XCircle className="w-4 h-4 text-textSecondary" />
					</button>
				</div>
			)}
		</div>
	);
}
