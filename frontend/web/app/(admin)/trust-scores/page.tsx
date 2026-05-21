"use client";

import React, {
	useEffect,
	useMemo,
	useState,
} from "react";

import TrustBadge from "@/components/TrustBadge";

import {
	Star,
	TrendingUp,
	TrendingDown,
	Edit2,
	Search,
	X,
	Loader2,
	RefreshCw,
} from "lucide-react";

import api from "@/lib/api";

interface UserTrust {
	id: string | number;
	name: string;
	email: string;
	score: number;
}

interface AuditLog {
	id?: string | number;

	userId: string | number;

	name: string;

	change: number;

	reason: string;

	timestamp: string;
}

interface UserApiResponse {
	id?: string | number;
	userId?: string | number;

	name?: string;

	email?: string;

	score?: number | string;
	trustScore?: number | string;
}

interface AuditApiResponse {
	id?: string | number;

	userId?: string | number;

	name?: string;
	userName?: string;

	change?: number | string;
	scoreChange?: number | string;

	reason?: string;
	description?: string;

	timestamp?: string;
	createdAt?: string;
}

function normalizeUser(
	data: UserApiResponse,
): UserTrust {
	return {
		id:
			data.id ??
			data.userId ??
			"",

		name:
			data.name ??
			"Unknown User",

		email:
			data.email ??
			"",

		score: Number(
			data.score ??
			data.trustScore ??
			0,
		),
	};
}

function normalizeAudit(
	data: AuditApiResponse,
): AuditLog {
	return {
		id: data.id,

		userId:
			data.userId ?? "",

		name:
			data.name ??
			data.userName ??
			"Unknown User",

		change: Number(
			data.change ??
			data.scoreChange ??
			0,
		),

		reason:
			data.reason ??
			data.description ??
			"No reason provided.",

		timestamp:
			data.timestamp ??
			data.createdAt ??
			new Date().toISOString(),
	};
}

function formatDate(
	value?: string,
) {
	if (!value) return "-";

	const date = new Date(value);

	if (
		Number.isNaN(
			date.getTime(),
		)
	) {
		return "-";
	}

	return date.toLocaleString();
}

export default function AdminTrustScoresPage() {
	const [users, setUsers] =
		useState<UserTrust[]>([]);

	const [auditLogs, setAuditLogs] =
		useState<AuditLog[]>([]);

	const [loading, setLoading] =
		useState(true);

	const [submitting, setSubmitting] =
		useState(false);

	const [error, setError] =
		useState("");

	const [search, setSearch] =
		useState("");

	const [adjustUser, setAdjustUser] =
		useState<UserTrust | null>(
			null,
		);

	const [adjustVal, setAdjustVal] =
		useState("");

	const [
		adjustReason,
		setAdjustReason,
	] = useState("");

	const fetchData =
		async () => {
			try {
				setLoading(true);
				setError("");

				const [
					usersRes,
					auditRes,
				] =
					await Promise.all([
						api.get(
							"/admin/trust-scores/users",
						),

						api.get(
							"/admin/trust-scores/audit-log",
						),
					]);

				const usersRaw =
					usersRes.data;

				const auditRaw =
					auditRes.data;

				const usersList =
					Array.isArray(
						usersRaw,
					)
						? usersRaw
						: Array.isArray(
							usersRaw?.data,
						)
							? usersRaw.data
							: Array.isArray(
								usersRaw?.content,
							)
								? usersRaw.content
								: [];

				const auditList =
					Array.isArray(
						auditRaw,
					)
						? auditRaw
						: Array.isArray(
							auditRaw?.data,
						)
							? auditRaw.data
							: Array.isArray(
								auditRaw?.content,
							)
								? auditRaw.content
								: [];

				setUsers(
					usersList.map(
						normalizeUser,
					),
				);

				setAuditLogs(
					auditList.map(
						normalizeAudit,
					),
				);
			} catch (err) {
				console.error(err);

				setError(
					"Failed to load trust score data.",
				);

				setUsers([]);
				setAuditLogs([]);
			} finally {
				setLoading(false);
			}
		};

	useEffect(() => {
		fetchData();
	}, []);

	const filteredUsers =
		useMemo(() => {
			const searchStr =
				search
					.trim()
					.toLowerCase();

			return users.filter(
				(u) =>
					u.name
						.toLowerCase()
						.includes(
							searchStr,
						) ||
					u.email
						.toLowerCase()
						.includes(
							searchStr,
						),
			);
		}, [users, search]);

	const applyAdjustment =
		async () => {
			if (!adjustUser) return;

			const amount =
				Number(
					adjustVal,
				);

			if (
				Number.isNaN(
					amount,
				) ||
				amount === 0
			) {
				setError(
					"Enter a valid adjustment amount.",
				);

				return;
			}

			if (
				!adjustReason.trim()
			) {
				setError(
					"Please provide a reason.",
				);

				return;
			}

			try {
				setSubmitting(true);
				setError("");

				await api.patch(
					`/admin/trust-scores/${adjustUser.id}/adjust`,
					{
						change:
						amount,

						reason:
							adjustReason.trim(),
					},
				);

				await fetchData();

				setAdjustUser(
					null,
				);

				setAdjustVal(
					"",
				);

				setAdjustReason(
					"",
				);
			} catch (err) {
				console.error(err);

				setError(
					"Failed to update trust score.",
				);
			} finally {
				setSubmitting(false);
			}
		};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-5xl space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary">
						Trust Scores
					</h1>

					<p className="mt-1 text-sm text-textSecondary">
						Monitor and
						manually adjust
						trust scores with
						full backend audit
						logging.
					</p>
				</div>

				<button
					onClick={fetchData}
					className="flex items-center gap-2 rounded-xl border border-outlineVariant bg-surface px-4 py-2 text-sm font-semibold text-textSecondary transition hover:bg-surfaceVariant">
					<RefreshCw className="h-4 w-4" />
					Refresh
				</button>
			</div>

			{error && (
				<div className="rounded-xl border border-error/40 bg-errorLight px-4 py-3 text-sm font-medium text-error">
					{error}
				</div>
			)}

			{/* Manual Override Modal */}
			{adjustUser && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="w-full max-w-md space-y-4 rounded-2xl border border-borderLight bg-surface p-6 shadow-2xl">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-bold text-textPrimary">
								Adjust Trust
								Score
							</h3>

							<button
								onClick={() =>
									setAdjustUser(
										null,
									)
								}>
								<X className="h-5 w-5 text-textTertiary transition hover:text-textPrimary" />
							</button>
						</div>

						<div className="flex items-center gap-3 rounded-xl bg-surfaceVariant p-3">
							<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primaryLight text-sm font-bold text-primary">
								{
									adjustUser
										.name[0]
								}
							</div>

							<div>
								<div className="text-sm font-bold text-textPrimary">
									{
										adjustUser.name
									}
								</div>

								<div className="text-xs text-textTertiary">
									Current
									score:{" "}
									<span className="font-bold text-textPrimary">
										{
											adjustUser.score
										}
									</span>
								</div>
							</div>
						</div>

						<div>
							<label className="text-xs font-bold uppercase tracking-wider text-textSecondary">
								Adjustment
								value
							</label>

							<input
								type="number"
								value={
									adjustVal
								}
								onChange={(e) =>
									setAdjustVal(
										e
											.target
											.value,
									)
								}
								placeholder="+10 or -5"
								className="mt-1.5 w-full rounded-xl border border-outlineVariant bg-surfaceVariant px-3 py-2.5 text-sm text-textPrimary outline-none transition focus:ring-2 focus:ring-primary"
							/>
						</div>

						<div>
							<label className="text-xs font-bold uppercase tracking-wider text-textSecondary">
								Reason
							</label>

							<input
								type="text"
								value={
									adjustReason
								}
								onChange={(e) =>
									setAdjustReason(
										e
											.target
											.value,
									)
								}
								placeholder="Explain the manual override..."
								className="mt-1.5 w-full rounded-xl border border-outlineVariant bg-surfaceVariant px-3 py-2.5 text-sm text-textPrimary outline-none transition focus:ring-2 focus:ring-primary"
							/>
						</div>

						<div className="flex gap-3">
							<button
								onClick={() =>
									setAdjustUser(
										null,
									)
								}
								className="flex-1 rounded-xl border border-outlineVariant py-2.5 text-sm font-semibold text-textSecondary transition hover:bg-surfaceVariant">
								Cancel
							</button>

							<button
								onClick={
									applyAdjustment
								}
								disabled={
									submitting
								}
								className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-onPrimary transition hover:opacity-90 disabled:opacity-60">
								{submitting
									? "Applying..."
									: "Apply & Log"}
							</button>
						</div>
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* Users */}
				<div className="overflow-hidden rounded-2xl border border-borderLight bg-surface shadow-sm">
					<div className="flex items-center justify-between gap-3 border-b border-borderLight px-5 py-4">
						<h2 className="flex items-center gap-2 font-bold text-textPrimary">
							<Star className="h-4 w-4 text-success" />
							All Users
						</h2>

						<div className="relative">
							<Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-textTertiary" />

							<input
								type="text"
								value={
									search
								}
								onChange={(e) =>
									setSearch(
										e
											.target
											.value,
									)
								}
								placeholder="Search..."
								className="w-40 rounded-lg border border-outlineVariant bg-surfaceVariant py-1.5 pl-7 pr-3 text-xs text-textPrimary outline-none transition focus:ring-2 focus:ring-primary"
							/>
						</div>
					</div>

					<div className="divide-y divide-borderLight">
						{filteredUsers.map(
							(
								u,
							) => (
								<div
									key={
										u.id
									}
									className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-surfaceVariant/40">
									<div className="flex items-center gap-3">
										<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primaryLight text-sm font-bold text-primary">
											{
												u
													.name[0]
											}
										</div>

										<div>
											<div className="text-sm font-semibold text-textPrimary">
												{
													u.name
												}
											</div>

											<div className="text-xs text-textTertiary">
												{
													u.email
												}
											</div>
										</div>
									</div>

									<div className="flex items-center gap-3">
										<TrustBadge
											score={
												u.score
											}
											compact={
												true
											}
										/>

										<button
											onClick={() => {
												setAdjustUser(
													u,
												);

												setAdjustVal(
													"",
												);

												setAdjustReason(
													"",
												);
											}}
											className="flex items-center gap-1 rounded-lg bg-primaryLight px-2.5 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20">
											<Edit2 className="h-3 w-3" />
											Adjust
										</button>
									</div>
								</div>
							),
						)}

						{filteredUsers.length ===
							0 && (
								<div className="py-12 text-center text-sm text-textTertiary">
									No users found.
								</div>
							)}
					</div>
				</div>

				{/* Audit Log */}
				<div className="overflow-hidden rounded-2xl border border-borderLight bg-surface shadow-sm">
					<div className="border-b border-borderLight px-5 py-4">
						<h2 className="font-bold text-textPrimary">
							Audit Log
						</h2>
					</div>

					<div className="max-h-[480px] divide-y divide-borderLight overflow-y-auto">
						{auditLogs.map(
							(
								log,
								i,
							) => (
								<div
									key={
										log.id ??
										i
									}
									className="flex items-center justify-between px-5 py-3.5">
									<div className="flex min-w-0 items-center gap-3">
										{log.change >
										0 ? (
											<TrendingUp className="h-4 w-4 shrink-0 text-success" />
										) : (
											<TrendingDown className="h-4 w-4 shrink-0 text-error" />
										)}

										<div className="min-w-0">
											<div className="truncate text-xs font-bold text-textPrimary">
												{
													log.name
												}
											</div>

											<div className="truncate text-xs text-textSecondary">
												{
													log.reason
												}
											</div>

											<div className="mt-0.5 text-[10px] text-textTertiary">
												{formatDate(
													log.timestamp,
												)}
											</div>
										</div>
									</div>

									<span
										className={`ml-3 shrink-0 text-sm font-extrabold ${
											log.change >
											0
												? "text-success"
												: "text-error"
										}`}>
										{log.change >
										0
											? `+${log.change}`
											: log.change}
									</span>
								</div>
							),
						)}

						{auditLogs.length ===
							0 && (
								<div className="py-12 text-center text-sm text-textTertiary">
									No audit logs
									found.
								</div>
							)}
					</div>
				</div>
			</div>
		</div>
	);
}