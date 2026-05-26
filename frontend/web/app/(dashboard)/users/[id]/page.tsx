"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
	ArrowLeft,
	Star,
	Shield,
	Bookmark,
	Package,
	ShieldAlert,
	Edit2,
	TrendingDown,
	TrendingUp,
	Calendar,
	Clock3,
	User,
	Phone,
	Mail,
	AlertTriangle,
} from "lucide-react";

type UserStatus = "VERIFIED" | "PENDING" | "SUSPENDED";

type BookingItem = {
	id: string;
	item: string;
	status: string;
	date: string;
};

type ListedItem = {
	id: string;
	title: string;
	status: string;
	price: string;
};

type DisputeItem = {
	id: string;
	booking: string;
	reason: string;
	status: string;
};

type TrustLogItem = {
	change: number;
	reason: string;
	date: string;
};

type AdminUserDetail = {
	id: string;
	name: string;
	email: string;
	studentId: string;
	phone?: string;
	department?: string;
	year?: string;
	status: UserStatus;
	trustScore: number;
	registered: string;
	lastActive: string;
	warnings: number;
	suspensionReason?: string;
	suspensionUntil?: string;
	verificationSubmitted: string;
	verificationDocs: string[];
	bookings: BookingItem[];
	items: ListedItem[];
	disputes: DisputeItem[];
	trustLog: TrustLogItem[];
};

type ApiUserDetailResponse = {
	user?: AdminUserDetail;
} & Partial<AdminUserDetail>;

export default function AdminUserDetailPage() {
	const params = useParams<{ id?: string | string[] }>();
	const userId = Array.isArray(params.id) ? params.id[0] : params.id;

	const [user, setUser] = useState<AdminUserDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [userStatus, setUserStatus] = useState<UserStatus>("PENDING");
	const [trustScore, setTrustScore] = useState(0);
	const [adjusting, setAdjusting] = useState(false);
	const [adjustment, setAdjustment] = useState({
		value: "",
		reason: "",
	});
	const [adminFeedback, setAdminFeedback] = useState("");

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

	useEffect(() => {
		if (!userId) {
			setError("Missing user id.");
			setLoading(false);
			return;
		}

		const resolvedUserId = userId;
		const controller = new AbortController();

		async function fetchUser() {
			try {
				setLoading(true);
				setError(null);

				const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
				const endpoints = [
					`${baseUrl}/api/admin/users/${encodeURIComponent(resolvedUserId)}`,
					`${baseUrl}/api/users/${encodeURIComponent(resolvedUserId)}`,
				];

				for (const endpoint of endpoints) {
					try {
						const response = await fetch(endpoint, {
							method: "GET",
							headers: {
								"Content-Type": "application/json",
							},
							signal: controller.signal,
						});

						if (!response.ok) {
							throw new Error(`Failed to load user (${response.status})`);
						}

						const data: ApiUserDetailResponse = await response.json();
						const nextUser = (data.user ?? data) as AdminUserDetail;

						if (!nextUser?.id) {
							throw new Error("User data was empty.");
						}

						setUser(nextUser);
						setUserStatus(nextUser.status ?? "PENDING");
						setTrustScore(nextUser.trustScore ?? 0);
						setAdminFeedback("");
						setLoading(false);
						return;
					} catch {
						// try next endpoint
					}
				}

				throw new Error("Failed to load user details.");
			} catch (fetchError) {
				if (controller.signal.aborted) return;

				setError(
					fetchError instanceof Error
						? fetchError.message
						: "Failed to load user details.",
				);
				setLoading(false);
			}
		}

		void fetchUser();

		return () => controller.abort();
	}, [userId]);

	const handleVerify = () => {
		setUserStatus("VERIFIED");
		setUser((prev) => (prev ? { ...prev, status: "VERIFIED" } : prev));
		setAdminFeedback("User verified successfully.");
	};

	const handleSuspend = () => {
		setUserStatus("SUSPENDED");
		setUser((prev) => (prev ? { ...prev, status: "SUSPENDED" } : prev));
		setAdminFeedback("User suspended due to policy violation.");
	};

	const handleReactivate = () => {
		setUserStatus("VERIFIED");
		setUser((prev) => (prev ? { ...prev, status: "VERIFIED" } : prev));
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

	if (loading) {
		return (
			<div className="mx-auto max-w-5xl space-y-5 px-4 sm:space-y-6 sm:px-6 lg:px-0">
				<div className="h-6 w-40 animate-pulse rounded bg-surfaceVariant" />
				<div className="h-40 animate-pulse rounded-2xl border border-borderLight bg-surface" />
				<div className="grid gap-6 lg:grid-cols-2">
					<div className="h-64 animate-pulse rounded-2xl border border-borderLight bg-surface" />
					<div className="h-64 animate-pulse rounded-2xl border border-borderLight bg-surface" />
				</div>
			</div>
		);
	}

	if (error || !user) {
		return (
			<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-0">
				<div className="rounded-2xl border border-borderLight bg-surface p-6 shadow-sm">
					<h1 className="text-xl font-bold text-textPrimary">User details unavailable</h1>
					<p className="mt-2 text-sm text-textSecondary">
						{error ?? "We could not load this user right now."}
					</p>
					<Link href="/users" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white">
						<ArrowLeft className="h-4 w-4" />
						Back to Users
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-5xl space-y-5 px-4 sm:space-y-6 sm:px-6 lg:px-0">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
				<Link
					href="/users"
					className="flex items-center gap-1.5 text-sm text-textSecondary hover:text-textPrimary transition font-medium">
					<ArrowLeft className="w-4 h-4" />
					Back to Users
				</Link>

				<div className="text-xs text-textTertiary">User ID: {userId}</div>
			</div>

			{/* Profile Card */}
			<div className="flex flex-col items-start gap-5 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-5 lg:flex-row lg:gap-6 lg:p-6">
				<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primaryLight text-xl font-extrabold text-primary sm:h-16 sm:w-16 sm:text-2xl">
					{user.name[0]}
				</div>

				<div className="flex-1 min-w-0">
					<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
						<h1 className="text-xl font-extrabold text-textPrimary">
							{user.name}
						</h1>

						<span
							className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor}`}>
							{userStatus}
						</span>
					</div>

					<div className="mt-1 flex flex-col gap-2 text-sm text-textSecondary sm:flex-row sm:flex-wrap sm:gap-3">
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

					<div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
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

					<div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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

			</div>

			{/* Verification Details */}
			<div className="bg-surface border border-borderLight rounded-2xl shadow-sm p-5">
				<div className="flex items-center gap-2 mb-4">
					<Shield className="w-4 h-4 text-primary" />
					<h2 className="font-bold text-textPrimary">Verification Details</h2>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
				<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

				<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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
							className="flex flex-col gap-3 rounded-xl bg-surfaceVariant/40 p-4 sm:flex-row sm:items-start sm:justify-between">
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
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* Bookings */}
				<div className="bg-surface border border-borderLight rounded-2xl shadow-sm overflow-hidden">
					<div className="flex items-center gap-2 border-b border-borderLight px-4 py-4 sm:px-5">
						<Bookmark className="w-4 h-4 text-primary" />

						<h2 className="font-bold text-textPrimary">Booking History</h2>
					</div>

					<div className="divide-y divide-borderLight">
						{user.bookings.map((booking) => (
							<div
								key={booking.id}
								className="flex flex-col gap-3 px-4 py-4 hover:bg-surfaceVariant/40 transition sm:flex-row sm:items-center sm:justify-between sm:px-5">
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
					<div className="flex items-center gap-2 border-b border-borderLight px-4 py-4 sm:px-5">
						<Package className="w-4 h-4 text-accent" />

						<h2 className="font-bold text-textPrimary">Listed Items</h2>
					</div>

					<div className="divide-y divide-borderLight">
						{user.items.map((item) => (
							<div
								key={item.id}
								className="flex flex-col gap-3 px-4 py-4 hover:bg-surfaceVariant/40 transition sm:flex-row sm:items-center sm:justify-between sm:px-5">
								<div>
									<div className="font-semibold text-sm text-textPrimary">
										{item.title}
									</div>

									<div className="text-xs text-textTertiary mt-1">
										{item.id}
									</div>
								</div>

								<div className="text-left sm:text-right">
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
				<div className="flex items-center gap-2 border-b border-borderLight px-4 py-4 sm:px-5">
					<ShieldAlert className="w-4 h-4 text-error" />

					<h2 className="font-bold text-textPrimary">Disputes & Reports</h2>
				</div>

				<div className="divide-y divide-borderLight">
					{user.disputes.map((dispute) => (
						<div
							key={dispute.id}
							className="flex flex-col gap-3 px-4 py-4 hover:bg-surfaceVariant/40 transition sm:flex-row sm:items-center sm:justify-between sm:px-5">
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
