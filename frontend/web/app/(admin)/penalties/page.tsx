"use client";

import React, {
	useEffect,
	useMemo,
	useState,
} from "react";

import {
	DollarSign,
	CheckCircle2,
	XCircle,
	Edit2,
	X,
	Loader2,
	RefreshCw,
} from "lucide-react";

import api from "@/lib/api";

type PenaltyStatus =
	| "PENDING"
	| "APPROVED"
	| "WAIVED";

interface Penalty {
	id: string | number;
	bookingId: string | number;

	owner: string;
	renter: string;

	reason: string;

	amount: number;
	deposit: number;

	status: PenaltyStatus;

	date: string;
}

interface PenaltyApiResponse {
	id?: string | number;
	penaltyId?: string | number;

	bookingId?: string | number;

	owner?: string;
	ownerName?: string;

	renter?: string;
	renterName?: string;

	reason?: string;
	description?: string;

	amount?: number | string;
	penaltyAmount?: number | string;

	deposit?: number | string;
	securityDeposit?: number | string;

	status?: string;

	date?: string;
	createdAt?: string;
}

const STATUS_STYLES: Record<
	string,
	string
> = {
	PENDING:
		"bg-warningLight text-warning",

	APPROVED:
		"bg-successLight text-success",

	WAIVED:
		"bg-surfaceVariant text-textSecondary",
};

function normalizeStatus(
	status?: string,
): PenaltyStatus {
	const value =
		status?.toUpperCase();

	if (
		value === "APPROVED" ||
		value === "WAIVED"
	) {
		return value;
	}

	return "PENDING";
}

function normalizePenalty(
	data: PenaltyApiResponse,
): Penalty {
	return {
		id:
			data.id ??
			data.penaltyId ??
			"",

		bookingId:
			data.bookingId ?? "-",

		owner:
			data.owner ??
			data.ownerName ??
			"Unknown",

		renter:
			data.renter ??
			data.renterName ??
			"Unknown",

		reason:
			data.reason ??
			data.description ??
			"No reason provided.",

		amount: Number(
			data.amount ??
			data.penaltyAmount ??
			0,
		),

		deposit: Number(
			data.deposit ??
			data.securityDeposit ??
			0,
		),

		status: normalizeStatus(
			data.status,
		),

		date:
			data.date ??
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

	return date.toLocaleDateString();
}

export default function AdminPenaltiesPage() {
	const [penalties, setPenalties] =
		useState<Penalty[]>([]);

	const [loading, setLoading] =
		useState(true);

	const [submitting, setSubmitting] =
		useState(false);

	const [error, setError] =
		useState("");

	const [modifyId, setModifyId] =
		useState<
			string | number | null
		>(null);

	const [
		modifyAmount,
		setModifyAmount,
	] = useState("");

	const fetchPenalties =
		async () => {
			try {
				setLoading(true);
				setError("");

				const response =
					await api.get(
						"/penalties",
					);

				const raw =
					response.data;

				const list =
					Array.isArray(
						raw,
					)
						? raw
						: Array.isArray(
							raw?.data,
						)
							? raw.data
							: Array.isArray(
								raw?.content,
							)
								? raw.content
								: [];

				setPenalties(
					list.map(
						normalizePenalty,
					),
				);
			} catch (err) {
				console.error(err);

				setError(
					"Failed to load penalties.",
				);

				setPenalties([]);
			} finally {
				setLoading(false);
			}
		};

	useEffect(() => {
		fetchPenalties();
	}, []);

	const pending =
		useMemo(() => {
			return penalties.filter(
				(p) =>
					p.status ===
					"PENDING",
			).length;
		}, [penalties]);

	const approvePenalty =
		async (
			id:
				| string
				| number,
		) => {
			try {
				setSubmitting(true);

				await api.patch(
					`/penalties/${id}/approve`,
				);

				await fetchPenalties();
			} catch (err) {
				console.error(err);

				setError(
					"Failed to approve penalty.",
				);
			} finally {
				setSubmitting(false);
			}
		};

	const waivePenalty =
		async (
			id:
				| string
				| number,
		) => {
			try {
				setSubmitting(true);

				await api.patch(
					`/penalties/${id}/waive`,
				);

				await fetchPenalties();
			} catch (err) {
				console.error(err);

				setError(
					"Failed to waive penalty.",
				);
			} finally {
				setSubmitting(false);
			}
		};

	const modifyPenalty =
		async () => {
			if (!modifyId) return;

			const amount =
				Number(
					modifyAmount,
				);

			if (
				Number.isNaN(
					amount,
				) ||
				amount < 0
			) {
				setError(
					"Enter a valid amount.",
				);

				return;
			}

			try {
				setSubmitting(true);

				await api.patch(
					`/penalties/${modifyId}/modify`,
					{
						amount,
					},
				);

				await fetchPenalties();

				setModifyId(
					null,
				);

				setModifyAmount(
					"",
				);
			} catch (err) {
				console.error(err);

				setError(
					"Failed to modify penalty.",
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
						Penalty Override
					</h1>

					<p className="mt-1 text-sm text-textSecondary">
						Review and moderate
						penalty requests from
						the live backend.
					</p>
				</div>

				<div className="flex items-center gap-3">
					<button
						onClick={
							fetchPenalties
						}
						className="flex items-center gap-2 rounded-xl border border-outlineVariant bg-surface px-4 py-2 text-sm font-semibold text-textSecondary transition hover:bg-surfaceVariant">
						<RefreshCw className="h-4 w-4" />
						Refresh
					</button>

					{pending >
						0 && (
							<div className="flex items-center gap-2 rounded-xl border border-warning/40 bg-warningLight px-4 py-2 text-sm font-bold text-warning">
								<DollarSign className="h-4 w-4" />
								{
									pending
								}{" "}
								Pending
							</div>
						)}
				</div>
			</div>

			{error && (
				<div className="rounded-xl border border-error/40 bg-errorLight px-4 py-3 text-sm font-medium text-error">
					{error}
				</div>
			)}

			{/* Modify Modal */}
			{modifyId && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="w-full max-w-sm space-y-4 rounded-2xl border border-borderLight bg-surface p-6 shadow-2xl">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-bold text-textPrimary">
								Modify
								Penalty
							</h3>

							<button
								onClick={() =>
									setModifyId(
										null,
									)
								}>
								<X className="h-5 w-5 text-textTertiary transition hover:text-textPrimary" />
							</button>
						</div>

						<p className="text-sm text-textSecondary">
							Enter the new
							approved amount.
						</p>

						<div className="relative">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-textTertiary">
								৳
							</span>

							<input
								type="number"
								value={
									modifyAmount
								}
								onChange={(
									e,
								) =>
									setModifyAmount(
										e
											.target
											.value,
									)
								}
								className="w-full rounded-xl border border-outlineVariant bg-surfaceVariant py-2.5 pl-8 pr-4 text-sm text-textPrimary outline-none transition focus:ring-2 focus:ring-primary"
							/>
						</div>

						<div className="flex gap-3">
							<button
								onClick={() =>
									setModifyId(
										null,
									)
								}
								className="flex-1 rounded-xl border border-outlineVariant py-2.5 text-sm font-semibold text-textSecondary transition hover:bg-surfaceVariant">
								Cancel
							</button>

							<button
								onClick={
									modifyPenalty
								}
								disabled={
									submitting
								}
								className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-onPrimary transition hover:opacity-90 disabled:opacity-60">
								{submitting
									? "Applying..."
									: "Apply"}
							</button>
						</div>
					</div>
				</div>
			)}

			<div className="space-y-4">
				{penalties.map(
					(
						p,
					) => (
						<div
							key={
								p.id
							}
							className={`rounded-2xl border bg-surface p-5 shadow-sm ${
								p.status ===
								"PENDING"
									? "border-warning/40"
									: "border-borderLight"
							}`}>
							<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
								<div className="min-w-0 flex-1">
									<div className="mb-2 flex flex-wrap items-center gap-3">
										<span className="font-mono text-xs font-bold text-textTertiary">
											PEN-
											{
												p.id
											}
										</span>

										<span className="font-mono text-xs text-textTertiary">
											Booking:
											BK-
											{
												p.bookingId
											}
										</span>

										<span
											className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[p.status]}`}>
											{
												p.status
											}
										</span>

										<span className="text-xs text-textTertiary">
											{formatDate(
												p.date,
											)}
										</span>
									</div>

									<div className="mb-1 text-sm text-textSecondary">
										<span className="font-semibold text-textPrimary">
											{
												p.owner
											}
										</span>{" "}
										(owner)
										→{" "}
										<span className="font-semibold text-textPrimary">
											{
												p.renter
											}
										</span>{" "}
										(renter)
									</div>

									<p className="leading-relaxed text-sm text-textSecondary">
										{
											p.reason
										}
									</p>

									<div className="mt-3 flex items-center gap-6">
										<div>
											<div className="text-xs text-textTertiary">
												Requested
											</div>

											<div className="text-lg font-extrabold text-textPrimary">
												৳
												{p.amount.toLocaleString()}
											</div>
										</div>

										<div>
											<div className="text-xs text-textTertiary">
												Available
												Deposit
											</div>

											<div className="text-lg font-extrabold text-success">
												৳
												{p.deposit.toLocaleString()}
											</div>
										</div>
									</div>
								</div>

								{p.status ===
									"PENDING" && (
										<div className="flex shrink-0 flex-col gap-2">
											<button
												onClick={() =>
													approvePenalty(
														p.id,
													)
												}
												disabled={
													submitting
												}
												className="flex items-center gap-2 rounded-xl bg-success px-4 py-2 text-sm font-bold text-white shadow transition hover:opacity-90 disabled:opacity-60">
												<CheckCircle2 className="h-4 w-4" />
												Approve
											</button>

											<button
												onClick={() => {
													setModifyId(
														p.id,
													);

													setModifyAmount(
														String(
															p.amount,
														),
													);
												}}
												className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primaryLight px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/20">
												<Edit2 className="h-4 w-4" />
												Modify
											</button>

											<button
												onClick={() =>
													waivePenalty(
														p.id,
													)
												}
												disabled={
													submitting
												}
												className="flex items-center gap-2 rounded-xl border border-outlineVariant bg-surfaceVariant px-4 py-2 text-sm font-bold text-textSecondary transition hover:bg-borderLight disabled:opacity-60">
												<XCircle className="h-4 w-4" />
												Waive
											</button>
										</div>
									)}
							</div>
						</div>
					),
				)}

				{penalties.length ===
					0 && (
						<div className="rounded-2xl border border-borderLight bg-surface py-16 text-center text-textTertiary">
							<DollarSign className="mx-auto mb-2 h-8 w-8 opacity-40" />
							No penalties
							found.
						</div>
					)}
			</div>
		</div>
	);
}