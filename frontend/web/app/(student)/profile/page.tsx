"use client";

import React from "react";
import Link from "next/link";
import {
	User,
	Mail,
	Phone,
	CalendarDays,
	Shield,
	Star,
	Edit3,
	Package,
	BookOpen,
	CheckCircle2,
	MessageSquare,
} from "lucide-react";

export default function ProfilePage() {
	return (
		<div className="max-w-4xl mx-auto space-y-6 pb-20">
			<h1 className="text-2xl font-bold text-textPrimary tracking-tight">
				Profile Overview
			</h1>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Left Column - User Info & Trust */}
				<div className="md:col-span-1 space-y-6">
					{/* Basic Info Card */}
					<div className="bg-surface border border-borderLight rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
						<div className="w-24 h-24 bg-primaryLight text-primary rounded-full flex items-center justify-center font-extrabold text-3xl mb-4 relative">
							A
							<span className="absolute bottom-0 right-0 bg-success text-white p-1 rounded-full border-2 border-surface">
								<CheckCircle2 className="w-4 h-4" />
							</span>
						</div>
						<h2 className="text-xl font-bold text-textPrimary">Arif Hossain</h2>
						<p className="text-sm text-textSecondary font-medium">
							Student ID: 22101234
						</p>

						<div className="w-full border-t border-borderLight my-4"></div>

						<div className="flex flex-col gap-3 w-full text-sm text-textSecondary justify-start text-left">
							<span className="flex items-center gap-2">
								<Mail className="w-4 h-4" /> arif@student.bracu.ac.bd
							</span>
							<span className="flex items-center gap-2">
								<CalendarDays className="w-4 h-4" /> Member since Jan 2024
							</span>
						</div>

						<Link
							href="/profile/edit"
							className="w-full mt-6 py-2.5 bg-surfaceVariant text-textPrimary border border-borderLight rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-borderLight transition-colors">
							<Edit3 className="w-4 h-4" /> Edit Profile
						</Link>
					</div>

					{/* Trust Score Card */}
					<div className="bg-gradient-to-br from-primaryDark to-primary p-6 rounded-2xl shadow-sm text-white flex flex-col items-center text-center relative overflow-hidden">
						<Shield className="absolute -right-4 -top-4 w-24 h-24 opacity-10" />
						<div className="text-sm font-bold uppercase tracking-wider mb-2 opacity-90">
							Trust Score
						</div>
						<div className="text-5xl font-extrabold leading-none mb-1">98</div>
						<div className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm mt-3">
							Verified Tier
						</div>

						<div className="w-full mt-6 space-y-1">
							<div className="flex justify-between text-xs font-bold opacity-80">
								<span>0</span>
								<span>Trend: +5 this month</span>
								<span>100</span>
							</div>
							<div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
								<div
									className="h-full bg-white rounded-full"
									style={{ width: "98%" }}></div>
							</div>
						</div>
					</div>
				</div>

				{/* Right Column - Stats & Reviews */}
				<div className="md:col-span-2 space-y-6">
					<h2 className="text-lg font-bold text-textPrimary">Stats Summary</h2>
					<div className="grid grid-cols-2 gap-4">
						<div className="bg-surface border border-borderLight p-5 rounded-2xl flex items-center gap-4">
							<div className="w-12 h-12 bg-primaryLight text-primary rounded-xl flex items-center justify-center shrink-0">
								<Package className="w-6 h-6" />
							</div>
							<div>
								<div className="text-2xl font-extrabold text-textPrimary">
									5
								</div>
								<div className="text-xs font-bold text-textSecondary uppercase tracking-wider">
									Items Listed
								</div>
							</div>
						</div>
						<div className="bg-surface border border-borderLight p-5 rounded-2xl flex items-center gap-4">
							<div className="w-12 h-12 bg-dashboardBlueTint text-dashboardBlue rounded-xl flex items-center justify-center shrink-0">
								<BookOpen className="w-6 h-6" />
							</div>
							<div>
								<div className="text-2xl font-extrabold text-textPrimary">
									14
								</div>
								<div className="text-xs font-bold text-textSecondary uppercase tracking-wider">
									Total Rentals
								</div>
							</div>
						</div>
						<div className="bg-surface border border-borderLight p-5 rounded-2xl flex items-center gap-4">
							<div className="w-12 h-12 bg-successLight text-success rounded-xl flex items-center justify-center shrink-0">
								<CheckCircle2 className="w-6 h-6" />
							</div>
							<div>
								<div className="text-2xl font-extrabold text-textPrimary">
									13
								</div>
								<div className="text-xs font-bold text-textSecondary uppercase tracking-wider">
									Succ. Returns
								</div>
							</div>
						</div>
						<div className="bg-surface border border-borderLight p-5 rounded-2xl flex items-center gap-4">
							<div className="w-12 h-12 bg-warningLight text-warningDark rounded-xl flex items-center justify-center shrink-0">
								<Star className="w-6 h-6" />
							</div>
							<div>
								<div className="text-2xl font-extrabold text-textPrimary">
									11
								</div>
								<div className="text-xs font-bold text-textSecondary uppercase tracking-wider">
									Reviews Rcvd
								</div>
							</div>
						</div>
					</div>

					<div className="bg-surface border border-borderLight rounded-2xl p-6 space-y-4">
						<div className="flex justify-between items-center mb-2">
							<h2 className="text-lg font-bold text-textPrimary">
								Recent Reviews (As Owner)
							</h2>
							<Link
								href="/profile/my-reviews"
								className="text-sm font-bold text-primary hover:underline">
								View All
							</Link>
						</div>

						<div className="divide-y divide-borderLight">
							<div className="py-4">
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-2">
										<div className="font-bold text-textPrimary text-sm">
											Nusrat J.
										</div>
										<div className="text-xs text-textSecondary font-medium">
											for Sony Alpha A7III
										</div>
									</div>
									<div className="flex items-center gap-0.5">
										<Star className="w-3.5 h-3.5 text-warning fill-warning" />
										<Star className="w-3.5 h-3.5 text-warning fill-warning" />
										<Star className="w-3.5 h-3.5 text-warning fill-warning" />
										<Star className="w-3.5 h-3.5 text-warning fill-warning" />
										<Star className="w-3.5 h-3.5 text-warning fill-warning" />
									</div>
								</div>
								<p className="text-sm text-textSecondary italic">
									"Excellent camera, handled perfectly. Arif was very helpful in
									explaining the menu settings!"
								</p>
							</div>
							<div className="py-4">
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-2">
										<div className="font-bold text-textPrimary text-sm">
											Tanvir A.
										</div>
										<div className="text-xs text-textSecondary font-medium">
											for DJI Mavic Air 2 Drone
										</div>
									</div>
									<div className="flex items-center gap-0.5">
										<Star className="w-3.5 h-3.5 text-warning fill-warning" />
										<Star className="w-3.5 h-3.5 text-warning fill-warning" />
										<Star className="w-3.5 h-3.5 text-warning fill-warning" />
										<Star className="w-3.5 h-3.5 text-warning fill-warning" />
										<Star className="w-3.5 h-3.5 text-outlineVariant" />
									</div>
								</div>
								<p className="text-sm text-textSecondary italic">
									"Everything was fine but missing a spare battery."
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}