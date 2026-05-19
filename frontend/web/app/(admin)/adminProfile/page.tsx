"use client";

import React from "react";
import Link from "next/link";
import {
	ShieldCheck,
	Users,
	Package,
	AlertTriangle,
	BarChart3,
	Settings,
	Activity,
	Edit3,
	CheckCircle2,
	Search,
	MessageSquareWarning,
} from "lucide-react";

export default function AdminProfilePage() {
	return (
		<div className="max-w-4xl mx-auto space-y-6 pb-20">
			<h1 className="text-2xl font-bold text-textPrimary tracking-tight">
				Admin Control Center
			</h1>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Left Column - Admin Identity */}
				<div className="md:col-span-1 space-y-6">
					{/* Admin Info Card */}
					<div className="bg-surface border border-borderLight rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
						<div className="w-24 h-24 bg-dashboardBlueTint text-dashboardBlue rounded-full flex items-center justify-center font-extrabold text-3xl mb-4 relative">
							CV
							<span className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full border-2 border-surface">
								<ShieldCheck className="w-4 h-4" />
							</span>
						</div>
						<h2 className="text-xl font-bold text-textPrimary">System Admin</h2>
						<p className="text-sm text-textSecondary font-medium">
							Staff ID: AD-9901
						</p>

						<div className="w-full border-t border-borderLight my-4"></div>

						<div className="flex flex-col gap-3 w-full text-sm text-textSecondary text-left">
							<span className="flex items-center gap-2">
								<Activity className="w-4 h-4" /> Role: Platform Overseer
							</span>
							<span className="flex items-center gap-2">
								<Settings className="w-4 h-4" /> System Access: Full
							</span>
						</div>

						<Link
							href="/admin/settings"
							className="w-full mt-6 py-2.5 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primaryDark transition-colors shadow-sm">
							<Settings className="w-4 h-4" /> System Settings
						</Link>
					</div>

					{/* Platform Health Card */}
					<div className="bg-gradient-to-br from-primary to-primaryDark p-6 rounded-2xl shadow-sm text-white flex flex-col items-center text-center relative overflow-hidden">
						<BarChart3 className="absolute -right-4 -top-4 w-24 h-24 opacity-10" />
						<div className="text-sm font-bold uppercase tracking-wider mb-2 opacity-90">
							Platform Status
						</div>
						<div className="text-4xl font-extrabold leading-none mb-1">
							Active
						</div>
						<div className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm mt-3">
							Uptime: 99.9%
						</div>

						<div className="w-full mt-6 space-y-1">
							<div className="flex justify-between text-xs font-bold opacity-80">
								<span>Stability</span>
								<span>Normal Load</span>
							</div>
							<div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
								<div
									className="h-full bg-white rounded-full"
									style={{ width: "92%" }}></div>
							</div>
						</div>
					</div>
				</div>

				{/* Right Column - Admin Stats & Pending Actions */}
				<div className="md:col-span-2 space-y-6">
					<h2 className="text-lg font-bold text-textPrimary">
						Platform Overview
					</h2>
					<div className="grid grid-cols-2 gap-4">
						{/* Users Statistics */}
						<div className="bg-surface border border-borderLight p-5 rounded-2xl flex items-center gap-4">
							<div className="w-12 h-12 bg-primaryLight text-primary rounded-xl flex items-center justify-center shrink-0">
								<Users className="w-6 h-6" />
							</div>
							<div>
								<div className="text-2xl font-extrabold text-textPrimary">
									1,240
								</div>
								<div className="text-xs font-bold text-textSecondary uppercase tracking-wider">
									Total Users
								</div>
							</div>
						</div>
						{/* Listings Monitoring */}
						<div className="bg-surface border border-borderLight p-5 rounded-2xl flex items-center gap-4">
							<div className="w-12 h-12 bg-dashboardBlueTint text-dashboardBlue rounded-xl flex items-center justify-center shrink-0">
								<Package className="w-6 h-6" />
							</div>
							<div>
								<div className="text-2xl font-extrabold text-textPrimary">
									452
								</div>
								<div className="text-xs font-bold text-textSecondary uppercase tracking-wider">
									Total Listings
								</div>
							</div>
						</div>
						{/* Dispute Management */}
						<div className="bg-surface border border-borderLight p-5 rounded-2xl flex items-center gap-4">
							<div className="w-12 h-12 bg-warningLight text-warningDark rounded-xl flex items-center justify-center shrink-0">
								<AlertTriangle className="w-6 h-6" />
							</div>
							<div>
								<div className="text-2xl font-extrabold text-textPrimary">
									03
								</div>
								<div className="text-xs font-bold text-textSecondary uppercase tracking-wider">
									Open Disputes
								</div>
							</div>
						</div>
						{/* Verification Tasks */}
						<div className="bg-surface border border-borderLight p-5 rounded-2xl flex items-center gap-4">
							<div className="w-12 h-12 bg-successLight text-success rounded-xl flex items-center justify-center shrink-0">
								<CheckCircle2 className="w-6 h-6" />
							</div>
							<div>
								<div className="text-2xl font-extrabold text-textPrimary">
									12
								</div>
								<div className="text-xs font-bold text-textSecondary uppercase tracking-wider">
									Pending Verifs
								</div>
							</div>
						</div>
					</div>

					{/* Action Logs / Reports[cite: 1] */}
					<div className="bg-surface border border-borderLight rounded-2xl p-6 space-y-4">
						<div className="flex justify-between items-center mb-2">
							<h2 className="text-lg font-bold text-textPrimary">
								Flagged Activities
							</h2>
							<Link
								href="/admin/reports"
								className="text-sm font-bold text-primary hover:underline">
								Review All
							</Link>
						</div>

						<div className="divide-y divide-borderLight">
							<div className="py-4">
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-2">
										<MessageSquareWarning className="w-4 h-4 text-warningDark" />
										<div className="font-bold text-textPrimary text-sm">
											Reported Listing #4402
										</div>
									</div>
									<span className="text-[10px] font-bold bg-warningLight text-warningDark px-2 py-0.5 rounded-full uppercase">
										High Priority
									</span>
								</div>
								<p className="text-sm text-textSecondary">
									User reported inappropriate images in "Graphics Tablet"
									listing.[cite: 1]
								</p>
							</div>
							<div className="py-4">
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-2">
										<Search className="w-4 h-4 text-dashboardBlue" />
										<div className="font-bold text-textPrimary text-sm">
											Penalty Review: Student #2210...
										</div>
									</div>
									<span className="text-[10px] font-bold bg-dashboardBlueTint text-dashboardBlue px-2 py-0.5 rounded-full uppercase">
										Investigation
									</span>
								</div>
								<p className="text-sm text-textSecondary">
									Automatic penalty review triggered due to repeated late
									returns.[cite: 1]
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
