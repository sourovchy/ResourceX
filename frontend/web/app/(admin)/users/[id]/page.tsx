"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
	ArrowLeft,
	Star,
	Shield,
	Bookmark,
	Package,
	ShieldAlert,
	MessageSquare,
	CheckCircle2,
	XCircle,
	Edit2,
	TrendingDown,
	TrendingUp,
	Calendar,
	Clock3,
	User,
	Phone,
	Mail,
	AlertTriangle,
	RefreshCcw,
} from "lucide-react";

type UserStatus = "VERIFIED" | "PENDING" | "SUSPENDED";

const MOCK_USER = {
	id: "U001",
	name: "Arif Hossain",
	email: "arif@uni.edu",
	studentId: "20-44512",
	phone: "+880 1712 345678",
	department: "Computer Science & Engineering",
	year: "4th Year",
	status: "VERIFIED" as UserStatus,
	trustScore: 105,
	registered: "March 12, 2024",
	lastActive: "2 hours ago",
	warnings: 1,
	suspensionReason: "",
	suspensionUntil: "",
	verificationSubmitted: "March 11, 2024",
	verificationDocs: ["Student ID Card", "University Email", "Profile Photo"],
	bookings: [
		{
			id: "BK-2041",
			item: "DSLR Camera Kit",
			status: "ACTIVE",
			date: "May 1, 2024",
		},
		{
			id: "BK-2030",
			item: "Arduino Mega Kit",
			status: "COMPLETED",
			date: "Apr 20, 2024",
		},
		{
			id: "BK-2017",
			item: "Scientific Calculator",
			status: "COMPLETED",
			date: "Apr 5, 2024",
		},
	],
	items: [
		{
			id: "IT-101",
			title: "Casio fx-991EX",
			status: "ACTIVE",
			price: "৳20/day",
		},
		{
			id: "IT-094",
			title: "JBL Speaker",
			status: "ACTIVE",
			price: "৳150/day",
		},
	],
	disputes: [
		{
			id: "D-001",
			booking: "BK-2041",
			reason: "Item damage dispute",
			status: "OPEN",
		},
	],
	trustLog: [
		{
			change: +10,
			reason: "Successful rental completion",
			date: "Apr 20, 2024",
		},
		{
			change: -5,
			reason: "Late return — 2 days overdue",
			date: "Apr 8, 2024",
		},
		{
			change: +5,
			reason: "Positive review received",
			date: "Mar 28, 2024",
		},
		{
			change: +95,
			reason: "Initial verification bonus",
			date: "Mar 12, 2024",
		},
	],
};

export default function AdminUserDetailPage() {
	const { id } = useParams();

	const [userStatus, setUserStatus] = useState<UserStatus>(MOCK_USER.status);

	const [trustScore, setTrustScore] = useState(MOCK_USER.trustScore);

	const [adjusting, setAdjusting] = useState(false);

	const [adjustment, setAdjustment] = useState({
		value: "",
		reason: "",
	});

	const [adminFeedback, setAdminFeedback] = useState("");

	const user = MOCK_USER;

	const statusColor = useMemo(() => {
		if (userStatus === "VERIFIED") {
			return "bg-successLight text-success";
		}

		if (userStatus === "PENDING") {
			return "bg-warningLight text-warning";
		}

		return "bg-errorLight text-error";
	}, [userStatus]);

	const trustColor = useMemo(() => {
		if (trustScore >= 90) return "text-success";
		if (trustScore >= 50) return "text-primary";
		if (trustScore > 0) return "text-warning";
		return "text-error";
	}, [trustScore]);

	const handleVerify = () => {
		setUserStatus("VERIFIED");
		setAdminFeedback("User verified successfully.");
	};

	const handleSuspend = () => {
		setUserStatus("SUSPENDED");
		setAdminFeedback("User suspended due to policy violation.");
	};

	const handleReactivate = () => {
		setUserStatus("VERIFIED");
		setAdminFeedback("User account reactivated.");
	};

	const handleTrustAdjustment = () => {
		const value = Number(adjustment.value);

		if (Number.isNaN(value) || value === 0) return;

		setTrustScore((prev) => prev + value);

		setAdjustment({
			value: "",
			reason: "",
		});

		setAdjusting(false);
	};

	return (
		<div className="max-w-5xl mx-auto space-y-6">
			<div className="flex items-center gap-3">
				<Link
					href="/users"
					className="flex items-center gap-1.5 text-sm text-textSecondary hover:text-textPrimary transition font-medium">
					<ArrowLeft className="w-4 h-4" />
					Back to Users
				</Link>

				<div className="text-xs text-textTertiary">User ID: {id as string}</div>
			</div>

			{/* Profile Card */}
			<div className="bg-surface border border-borderLight rounded-2xl shadow-sm p-6 flex flex-col lg:flex-row items-start gap-6">
				<div className="w-16 h-16 rounded-full bg-primaryLight flex items-center justify-center font-extrabold text-primary text-2xl shrink-0">
					{user.name[0]}
				</div>

				<div className="flex-1 min-w-0">
					<div className="flex flex-wrap items-center gap-3">
						<h1 className="text-xl font-extrabold text-textPrimary">
							{user.name}
						</h1>

						<span
							className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor}`}>
							{userStatus}
						</span>
					</div>

					<div className="text-sm text-textSecondary mt-1 flex flex-wrap gap-3">
						<div className="flex items-center gap-1">
							<Mail className="w-3.5 h-3.5" />
							{user.email}
						</div>

						<div className="flex items-center gap-1">
							<User className="w-3.5 h-3.5" />
							{user.studentId}
						</div>
					</div>

					<div className="text-sm text-textTertiary mt-2">
						{user.department} · {user.year}
					</div>

					<div className="flex flex-wrap gap-4 mt-4">
						<div className="flex items-center gap-1 text-xs text-textTertiary">
							<Phone className="w-3.5 h-3.5" />
							{user.phone}
						</div>

						<div className="flex items-center gap-1 text-xs text-textTertiary">
							<Calendar className="w-3.5 h-3.5" />
							Joined {user.registered}
						</div>

						<div className="flex items-center gap-1 text-xs text-textTertiary">
							<Clock3 className="w-3.5 h-3.5" />
							Last active {user.lastActive}
						</div>
					</div>

					<div className="flex flex-wrap gap-3 mt-5">
						<div className="px-3 py-2 rounded-xl bg-surfaceVariant text-sm">
							Warnings:{" "}
							<span className="font-bold text-warning">{user.warnings}</span>
						</div>

						<div className="px-3 py-2 rounded-xl bg-surfaceVariant text-sm">
							Trust Score:{" "}
							<span className={`font-bold ${trustColor}`}>{trustScore}</span>
						</div>
					</div>
				</div>

				{/* <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
					{userStatus === "VERIFIED" ? (
						<button
							onClick={handleSuspend}
							className="flex items-center justify-center gap-2 px-4 py-2 bg-errorLight text-error border border-error/30 rounded-xl text-sm font-bold hover:bg-error/20 transition">
							<XCircle className="w-4 h-4" />
							Suspend
						</button>
					) : userStatus === "SUSPENDED" ? (
						<button
							onClick={handleReactivate}
							className="flex items-center justify-center gap-2 px-4 py-2 bg-successLight text-success border border-success/30 rounded-xl text-sm font-bold hover:bg-success/20 transition">
							<RefreshCcw className="w-4 h-4" />
							Reactivate
						</button>
					) : (
						<div className="text-center text-sm text-textTertiary italic">
							<button
								onClick={handleVerify}
								className="flex items-center justify-center gap-2 px-4 py-2 bg-success text-white rounded-xl text-sm font-bold hover:opacity-90 transition">
								<CheckCircle2 className="w-4 h-4" />
								Verify Student
							</button>

							<button className="flex items-center justify-center gap-2 px-4 py-2 bg-errorLight text-error rounded-xl text-sm font-bold hover:bg-error/20 transition">
								<XCircle className="w-4 h-4" />
								Reject
							</button>
						</div>
					)}
				</div> */}
			</div>

			{/* Verification Details */}
			<div className="bg-surface border border-borderLight rounded-2xl shadow-sm p-5">
				<div className="flex items-center gap-2 mb-4">
					<Shield className="w-4 h-4 text-primary" />
					<h2 className="font-bold text-textPrimary">Verification Details</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="bg-surfaceVariant/50 rounded-xl p-4">
						<div className="text-xs text-textTertiary uppercase font-bold">
							Submitted
						</div>

						<div className="mt-1 text-sm font-semibold text-textPrimary">
							{user.verificationSubmitted}
						</div>
					</div>

					<div className="bg-surfaceVariant/50 rounded-xl p-4">
						<div className="text-xs text-textTertiary uppercase font-bold">
							Provided Documents
						</div>

						<div className="mt-2 flex flex-wrap gap-2">
							{user.verificationDocs.map((doc) => (
								<div
									key={doc}
									className="px-3 py-1.5 rounded-lg bg-primaryLight text-primary text-xs font-semibold">
									{doc}
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="mt-4">
					<label className="block text-xs font-bold text-textTertiary uppercase mb-2">
						Admin Feedback
					</label>

					<textarea
						value={adminFeedback}
						onChange={(e) => setAdminFeedback(e.target.value)}
						placeholder="Write verification note or suspension reason..."
						className="w-full min-h-[100px] px-4 py-3 rounded-xl bg-surface border border-outlineVariant focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-textPrimary resize-none"
					/>
				</div>
			</div>

			{/* Trust Score */}
			<div className="bg-surface border border-borderLight rounded-2xl shadow-sm p-5">
				<div className="flex items-center justify-between mb-4">
					<h2 className="font-bold text-textPrimary flex items-center gap-2">
						<Star className="w-4 h-4 text-success" />
						Trust Score
					</h2>

					<button
						onClick={() => setAdjusting(!adjusting)}
						className="flex items-center gap-1.5 px-3 py-1.5 bg-primaryLight text-primary rounded-xl text-xs font-bold hover:opacity-90 transition">
						<Edit2 className="w-3.5 h-3.5" />
						Adjust Score
					</button>
				</div>

				<div className="flex flex-col sm:flex-row sm:items-center gap-4">
					<div className={`text-4xl font-extrabold ${trustColor}`}>
						{trustScore}
					</div>

					<div className="text-sm text-textSecondary">
						User reputation based on rental history, disputes, reviews, and
						platform activity.
					</div>
				</div>

				{adjusting && (
					<div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
						<input
							type="number"
							value={adjustment.value}
							onChange={(e) =>
								setAdjustment({
									...adjustment,
									value: e.target.value,
								})
							}
							placeholder="+10 or -5"
							className="px-4 py-2.5 rounded-xl bg-surface border border-outlineVariant focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
						/>

						<input
							type="text"
							value={adjustment.reason}
							onChange={(e) =>
								setAdjustment({
									...adjustment,
									reason: e.target.value,
								})
							}
							placeholder="Adjustment reason"
							className="px-4 py-2.5 rounded-xl bg-surface border border-outlineVariant focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
						/>

						<button
							onClick={handleTrustAdjustment}
							className="px-4 py-2.5 bg-primary text-onPrimary rounded-xl text-sm font-bold hover:opacity-90 transition">
							Apply Adjustment
						</button>
					</div>
				)}

				<div className="mt-6 space-y-3">
					{user.trustLog.map((log, index) => (
						<div
							key={index}
							className="flex items-start justify-between gap-4 p-4 rounded-xl bg-surfaceVariant/40">
							<div className="flex items-start gap-3">
								<div
									className={`p-2 rounded-lg ${
										log.change > 0 ? "bg-successLight" : "bg-errorLight"
									}`}>
									{log.change > 0 ? (
										<TrendingUp className="w-4 h-4 text-success" />
									) : (
										<TrendingDown className="w-4 h-4 text-error" />
									)}
								</div>

								<div>
									<div className="text-sm font-semibold text-textPrimary">
										{log.reason}
									</div>

									<div className="text-xs text-textTertiary mt-1">
										{log.date}
									</div>
								</div>
							</div>

							<div
								className={`text-sm font-bold ${
									log.change > 0 ? "text-success" : "text-error"
								}`}>
								{log.change > 0 ? "+" : ""}
								{log.change}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* User Activity */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Bookings */}
				<div className="bg-surface border border-borderLight rounded-2xl shadow-sm overflow-hidden">
					<div className="px-5 py-4 border-b border-borderLight flex items-center gap-2">
						<Bookmark className="w-4 h-4 text-primary" />

						<h2 className="font-bold text-textPrimary">Booking History</h2>
					</div>

					<div className="divide-y divide-borderLight">
						{user.bookings.map((booking) => (
							<div
								key={booking.id}
								className="px-5 py-4 flex items-center justify-between hover:bg-surfaceVariant/40 transition">
								<div>
									<div className="font-semibold text-sm text-textPrimary">
										{booking.item}
									</div>

									<div className="text-xs text-textTertiary mt-1">
										{booking.id} · {booking.date}
									</div>
								</div>

								<div className="text-xs font-bold text-primary">
									{booking.status}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Listed Items */}
				<div className="bg-surface border border-borderLight rounded-2xl shadow-sm overflow-hidden">
					<div className="px-5 py-4 border-b border-borderLight flex items-center gap-2">
						<Package className="w-4 h-4 text-accent" />

						<h2 className="font-bold text-textPrimary">Listed Items</h2>
					</div>

					<div className="divide-y divide-borderLight">
						{user.items.map((item) => (
							<div
								key={item.id}
								className="px-5 py-4 flex items-center justify-between hover:bg-surfaceVariant/40 transition">
								<div>
									<div className="font-semibold text-sm text-textPrimary">
										{item.title}
									</div>

									<div className="text-xs text-textTertiary mt-1">
										{item.id}
									</div>
								</div>

								<div className="text-right">
									<div className="text-sm font-bold text-primary">
										{item.price}
									</div>

									<div className="text-xs text-success font-semibold mt-1">
										{item.status}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Disputes */}
			<div className="bg-surface border border-borderLight rounded-2xl shadow-sm overflow-hidden">
				<div className="px-5 py-4 border-b border-borderLight flex items-center gap-2">
					<ShieldAlert className="w-4 h-4 text-error" />

					<h2 className="font-bold text-textPrimary">Disputes & Reports</h2>
				</div>

				<div className="divide-y divide-borderLight">
					{user.disputes.map((dispute) => (
						<div
							key={dispute.id}
							className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surfaceVariant/40 transition">
							<div>
								<div className="font-semibold text-sm text-textPrimary">
									{dispute.reason}
								</div>

								<div className="text-xs text-textTertiary mt-1">
									{dispute.id} · Booking {dispute.booking}
								</div>
							</div>

							<div className="flex items-center gap-2">
								<div className="px-2.5 py-1 rounded-full bg-errorLight text-error text-xs font-bold">
									{dispute.status}
								</div>

								<button className="text-xs font-bold text-primary hover:underline">
									Review
								</button>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Admin Warning */}
			<div className="bg-warningLight border border-warning/30 rounded-2xl p-5 flex items-start gap-3">
				<AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />

				<div>
					<div className="font-bold text-warning">Administrative Note</div>

					<div className="text-sm text-textSecondary mt-1">
						Always verify student information carefully before approval.
						Suspensions should include proper feedback and evidence for future
						moderation review.
					</div>
				</div>
			</div>
		</div>
	);
}
