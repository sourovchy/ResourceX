import React from "react";
import Link from "next/link";
import StatCard from "@/components/cards/StatCard";
import ActionCard from "@/components/cards/ActionCard";
import {
	ShieldCheck,
	PackageSearch,
	PlusCircle,
	Bookmark,
	PackageOpen,
	TrendingUp,
	Bell,
	Star,
	AlertTriangle,
	ArrowRight,
	CheckCircle2,
	HeartIcon,
	TrashIcon,
	HistoryIcon,
} from "lucide-react";

export default function StudentDashboard() {
	return (
		<div className="min-h-screen bg-background p-4 md:p-8">
			<div className="max-w-6xl mx-auto space-y-8">
				{/* Alert Banner */}
				<div className="bg-errorLight border border-error/50 text-error px-5 py-4 rounded-xl flex items-start gap-4 shadow-sm">
					<AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
					<div className="flex-1">
						<h3 className="text-sm font-bold">
							Action Required: Overdue Rental
						</h3>
						<p className="text-sm mt-1 opacity-90">
							You have a &quot;DSLR Camera Setup&quot; that was due for return
							yesterday. Please return it immediately to avoid further trust
							score penalties.
						</p>
					</div>
					<Link
						href="/my-bookings"
						className="text-xs font-bold underline shrink-0 hover:text-error transition-colors">
						View Booking
					</Link>
				</div>

				{/* Welcome Section */}
				<div className="bg-surface border border-borderLight rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
					<div>
						<h1 className="text-2xl font-bold text-textPrimary tracking-tight flex items-center gap-2">
							Welcome back, Arif!
						</h1>
						<p className="text-textSecondary mt-1">
							Here is what&apos;s happening with your campus items today.
						</p>
					</div>
					<div className="flex items-center gap-4 bg-surfaceVariant p-3 rounded-xl border border-borderLight">
						<div className="bg-successLight p-2 rounded-full">
							<ShieldCheck className="w-6 h-6 text-success" />
						</div>
						<div>
							<div className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
								Account Status
							</div>
							<div className="text-sm font-bold text-success flex items-center gap-1 mt-0.5">
								Verified Student
							</div>
						</div>
					</div>
				</div>

				{/* Quick Stats Row */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
					<StatCard
						icon={<PackageOpen className="w-5 h-5 text-dashboardBlue" />}
						title="Active Rentals"
						value="2"
						tint="bg-dashboardBlueTint"
					/>
					<StatCard
						icon={<PlusCircle className="w-5 h-5 text-dashboardPurple" />}
						title="Items Listed"
						value="5"
						tint="bg-dashboardPurpleTint"
					/>
					<StatCard
						icon={<Bell className="w-5 h-5 text-dashboardYellow" />}
						title="Pending Requests"
						value="1"
						tint="bg-dashboardYellowTint"
					/>
					<StatCard
						icon={<Star className="w-5 h-5 text-dashboardGreen" />}
						title="Trust Score"
						value="105"
						tint="bg-dashboardGreenTint"
						subtitle="Excellent Tier"
					/>
				</div>

				{/* Quick Actions */}
				<div>
					<h2 className="text-lg font-bold text-textPrimary mb-5">
						Quick Actions
					</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-5">
						<ActionCard
							href="/borrow"
							icon={<PackageSearch className="w-6 h-6 text-primary" />}
							bgIcon="bg-primaryLight"
							title="Browse Items"
							description="Find items to rent"
						/>
						<ActionCard
							href="/my-posts/add"
							icon={<PlusCircle className="w-6 h-6 text-accent" />}
							bgIcon="bg-accentLight"
							title="List an Item"
							description="Rent out your gear"
						/>
						<ActionCard
							href="/my-bookings"
							icon={<Bookmark className="w-6 h-6 text-dashboardBlue" />}
							bgIcon="bg-dashboardBlueTint"
							title="My Bookings"
							description="Track your rentals"
						/>
						<ActionCard
							href="/my-posts"
							icon={<PackageOpen className="w-6 h-6 text-dashboardYellow" />}
							bgIcon="bg-dashboardYellowTint"
							title="My Posts"
							description="Manage listings"
						/>
						<ActionCard
							href="/borrow/wishlist"
							icon={<HeartIcon className="w-6 h-6 text-dashboardYellow" />}
							bgIcon="bg-dashboardYellowTint"
							title="Wishlist"
							description="Favorite listings"
						/>
						<ActionCard
							href="/history"
							icon={<HistoryIcon className="w-6 h-6 text-dashboardYellow" />}
							bgIcon="bg-dashboard"
							title="History"
							description="History listings"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Recent Activity */}
					<div className="lg:col-span-2 space-y-5">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-bold text-textPrimary">
								Recent Activity
							</h2>
							<Link
								href="/notifications"
								className="text-sm font-medium text-primary hover:underline">
								View all
							</Link>
						</div>
						<div className="bg-surface border border-borderLight rounded-2xl shadow-sm overflow-hidden flex flex-col">
							<div className="divide-y divide-borderLight">
								<ActivityItem
									icon={<CheckCircle2 className="w-5 h-5 text-success" />}
									bgIcon="bg-successLight"
									title="Booking Approved"
									desc="Your request for 'Arduino Mega Kit' was approved."
									time="2 hours ago"
								/>
								<ActivityItem
									icon={<AlertTriangle className="w-5 h-5 text-warning" />}
									bgIcon="bg-warningLight"
									title="Return Reminder"
									desc="Please return 'Calculus Textbook Vol 2' by tomorrow."
									time="5 hours ago"
								/>
								<ActivityItem
									icon={<PlusCircle className="w-5 h-5 text-dashboardPurple" />}
									bgIcon="bg-dashboardPurpleTint"
									title="Item Verified"
									desc="Your posting 'Sony WH-1000XM4' is now live."
									time="1 day ago"
								/>
							</div>
						</div>
					</div>

					{/* Trending Items */}
					<div className="space-y-5">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-bold text-textPrimary flex items-center gap-2">
								<TrendingUp className="w-5 h-5 text-dashboardPink" />
								Trending Now
							</h2>
						</div>
						<div className="bg-surface border border-borderLight rounded-2xl shadow-sm p-5 space-y-5 h-full max-h-min">
							<TrendingItem title="Sony Alpha A7III" price="৳ 500/day" />
							<TrendingItem title="Casio fx-991EX Plus" price="৳ 20/day" />
							<TrendingItem title="JBL PartyBox 310" price="৳ 800/day" />
							<Link
								href="/borrow"
								className="flex items-center justify-center gap-2 w-full py-3 mt-4 bg-surfaceVariant text-textPrimary rounded-xl text-sm font-bold hover:bg-borderLight transition-colors">
								Explore All Items
								<ArrowRight className="w-4 h-4" />
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// Subcomponents
function ActivityItem({ icon, bgIcon, title, desc, time }: any) {
	return (
		<div className="p-5 flex gap-4 hover:bg-surfaceVariant/50 transition-colors cursor-pointer">
			<div
				className={`w-10 h-10 flex shrink-0 items-center justify-center rounded-full ${bgIcon}`}>
				{icon}
			</div>
			<div className="flex-1 min-w-0">
				<h4 className="text-sm font-bold text-textPrimary">{title}</h4>
				<p className="text-sm text-textSecondary mt-0.5 pr-4 truncate">
					{desc}
				</p>
			</div>
			<div className="text-xs font-medium text-textTertiary shrink-0 mt-0.5">
				{time}
			</div>
		</div>
	);
}

function TrendingItem({ title, price }: any) {
	return (
		<div className="flex flex-row items-center justify-between pb-4 border-b border-borderLight last:border-0 last:pb-0">
			<div className="text-sm font-bold text-textPrimary">{title}</div>
			<div className="text-xs font-bold bg-successLight text-successDark px-2 py-1 rounded-md">
				{price}
			</div>
		</div>
	);
}
