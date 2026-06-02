"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ShieldAlert, CheckCircle2, X, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { formatShortDate } from "@/lib/dateUtils";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { useToast } from "@/context/ToastContext";
import { extractErrorMessage } from "@/lib/errorUtils";
import { PageEmpty } from "@/components/ui/PageEmpty";

type DisputeStatus = "OPEN" | "RESOLVED";

interface Dispute {
	id: string | number;
	bookingId: string | number;
	raisedBy: string;
	against: string;
	reason: string;
	evidence: string;
	status: DisputeStatus;
	date: string;
	resolution?: string;
}

interface DisputeApiResponse {
	id?: string | number;
	disputeId?: string | number;

	bookingId?: string | number;
	booking?: {
		bookingId?: string | number;
	};

	raisedBy?: string;
	complainantName?: string;
	reporterName?: string;
	userName?: string;

	against?: string;
	defendantName?: string;
	targetUserName?: string;

	reason?: string;
	description?: string;

	evidence?: string;
	evidenceText?: string;

	status?: string;

	date?: string;
	createdAt?: string;

	resolution?: string;
	adminDecision?: string;
}

function normalizeStatus(status?: string): DisputeStatus {
	return status?.toUpperCase() === "RESOLVED" ? "RESOLVED" : "OPEN";
}

function normalizeDispute(data: DisputeApiResponse): Dispute {
	return {
		id: data.id ?? data.disputeId ?? "",
		bookingId: data.bookingId ?? data.booking?.bookingId ?? "-",

		raisedBy:
			data.raisedBy ??
			data.complainantName ??
			data.reporterName ??
			data.userName ??
			"Unknown",

		against:
			data.against ?? data.defendantName ?? data.targetUserName ?? "Unknown",

		reason: data.reason ?? data.description ?? "No reason provided.",

		evidence: data.evidence ?? data.evidenceText ?? "No evidence uploaded",

		status: normalizeStatus(data.status),

		date: data.date ?? data.createdAt ?? new Date().toISOString(),

		resolution: data.resolution ?? data.adminDecision,
	};
}

function formatDate(value: string) {
	if (!value) return "-";

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return formatShortDate(date);
}

export default function AdminDisputesPage() {
	const [disputes, setDisputes] = useState<Dispute[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { toast } = useToast();

	const [activeDispute, setActiveDispute] = useState<string | number | null>(
		null,
	);

	const [decision, setDecision] = useState("");

	const [filterOpen, setFilterOpen] = useState<"ALL" | "OPEN" | "RESOLVED">(
		"ALL",
	);

	const fetchDisputes = async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await api.get("/disputes");

			const raw = response.data;

			const list = Array.isArray(raw)
				? raw
				: Array.isArray(raw?.data)
					? raw.data
					: Array.isArray(raw?.content)
						? raw.content
						: [];

			setDisputes(list.map(normalizeDispute));
		} catch (err) {
			console.error(err);
			setError("Failed to load disputes.");
			setDisputes([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchDisputes();
	}, []);

	// Auto-refresh on tab focus + light polling
	useAutoRefresh(fetchDisputes, { intervalMs: 45_000 });

	const filtered = useMemo(() => {
		return disputes.filter(
			(d) => filterOpen === "ALL" || d.status === filterOpen,
		);
	}, [disputes, filterOpen]);

	const openCount = useMemo(() => {
		return disputes.filter((d) => d.status === "OPEN").length;
	}, [disputes]);

	const submitResolution = async () => {
		if (!activeDispute) return;

		if (!decision.trim()) {
			setError("Please provide an admin decision.");
			return;
		}

		try {
			setSubmitting(true);
			setError(null);

			await api.patch(`/disputes/${activeDispute}/resolve`, {
				resolution: decision.trim(),
				status: "RESOLVED",
			});

			await fetchDisputes();

			setActiveDispute(null);
			setDecision("");
			toast("Dispute resolved. The parties have been notified.");
		} catch (err) {
			const msg = extractErrorMessage(err);
			setError(msg);
			toast(msg, "error");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="w-full space-y-6 px-4 pb-20 sm:px-6 lg:px-8">
			{/* Header – consistent with admin pages */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary tracking-tight">
						Dispute Center
					</h1>
					<p className="mt-1 text-sm text-textSecondary">
						Review and resolve disputes from the live backend system.
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					{openCount > 0 && (
						<div className="inline-flex items-center gap-2 rounded-xl border border-error/30 bg-errorLight px-4 py-2 text-sm font-bold text-error shadow-sm">
							<ShieldAlert className="h-4 w-4" />
							{openCount} Open
						</div>
					)}
				</div>
			</div>

			{/* Error banner – same as admin home */}
			{error && (
				<div className="flex items-center gap-3 rounded-xl border border-error/40 bg-errorLight px-4 py-3 text-sm font-medium text-error">
					<ShieldAlert className="h-4 w-4 shrink-0" />
					{error}
				</div>
			)}

			{/* Filters – responsive wrap, consistent button styling */}
			<div className="flex flex-wrap gap-2">
				{(["ALL", "OPEN", "RESOLVED"] as const).map((f) => (
					<button
						key={f}
						onClick={() => setFilterOpen(f)}
						className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
							filterOpen === f
								? f === "OPEN"
									? "border-error bg-error text-white shadow"
									: "border-primary bg-primary text-onPrimary shadow"
								: "border-outlineVariant bg-surface text-textSecondary hover:bg-surfaceVariant"
						}`}>
						{f}
					</button>
				))}
			</div>

			{/* Dispute Cards / Loading */}
			{loading ? (
				<div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-textSecondary">
					<Loader2 className="h-6 w-6 animate-spin text-primary" />
					<span className="text-sm font-medium">Loading disputes…</span>
				</div>
			) : (
				<div className="space-y-4">
					{filtered.map((d) => (
						<div
							key={d.id}
							className={`overflow-hidden rounded-xl border bg-surface shadow-sm transition ${
								d.status === "OPEN" ? "border-error/40" : "border-borderLight"
							}`}>
							<div className="p-5">
								<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap items-center gap-2">
											<span className="font-mono text-xs font-bold text-textTertiary">
												D-{d.id}
											</span>
											<span className="font-mono text-xs text-textTertiary">
												Booking: BK-{d.bookingId}
											</span>
											<span
												className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
													d.status === "OPEN"
														? "bg-errorLight text-error"
														: "bg-successLight text-success"
												}`}>
												{d.status}
											</span>
										</div>

										<div className="mt-2 flex flex-wrap items-center gap-1 text-sm">
											<span className="font-semibold text-textPrimary">
												{d.raisedBy}
											</span>
											<span className="text-textTertiary">vs</span>
											<span className="font-semibold text-textPrimary">
												{d.against}
											</span>
											<span className="ml-1 text-xs text-textTertiary">
												· {formatDate(d.date)}
											</span>
										</div>

										<p className="mt-2 leading-relaxed text-sm text-textSecondary">
											{d.reason}
										</p>

										<div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-textTertiary">
											<span className="font-bold">Evidence:</span>
											<span className="break-all">{d.evidence}</span>
										</div>

										{d.resolution && (
											<div className="mt-3 rounded-lg border border-success/20 bg-successLight px-4 py-2 text-xs text-success">
												<span className="font-bold">Resolution:</span>{" "}
												{d.resolution}
											</div>
										)}
									</div>

									{d.status === "OPEN" && (
										<button
											onClick={() => setActiveDispute(d.id)}
											className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow transition hover:opacity-90">
											<CheckCircle2 className="h-4 w-4" />
											Resolve
										</button>
									)}
								</div>
							</div>

							{/* Resolve Panel */}
							{activeDispute === d.id && (
								<div className="space-y-3 border-t border-borderLight bg-surfaceVariant/50 p-5">
									<div className="flex items-center justify-between">
										<h3 className="text-sm font-bold text-textPrimary">
											Admin Decision
										</h3>
										<button
											onClick={() => setActiveDispute(null)}
											className="rounded p-1 hover:bg-surface">
											<X className="h-4 w-4 text-textTertiary transition hover:text-textPrimary" />
										</button>
									</div>

									<p className="text-xs text-textSecondary">
										This decision will notify both parties.
									</p>

									<textarea
										value={decision}
										onChange={(e) => setDecision(e.target.value)}
										rows={4}
										placeholder="Write resolution decision..."
										className="w-full resize-none rounded-xl border border-outlineVariant bg-surface px-3 py-2.5 text-sm text-textPrimary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
									/>

									<div className="flex flex-wrap gap-3">
										<button
											onClick={() => {
												setActiveDispute(null);
												setDecision("");
											}}
											className="rounded-xl border border-outlineVariant px-4 py-2.5 text-sm font-semibold text-textSecondary transition hover:bg-surface">
											Cancel
										</button>
										<button
											onClick={submitResolution}
											disabled={submitting}
											className="rounded-xl bg-success px-5 py-2.5 text-sm font-bold text-white shadow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
											{submitting ? "Submitting…" : "Submit Decision & Resolve"}
										</button>
									</div>
								</div>
							)}
						</div>
					))}

					{filtered.length === 0 && (
						<PageEmpty
							icon={ShieldAlert}
							title="No disputes found"
							description="There are currently no disputes matching this category."
						/>
					)}
				</div>
			)}
		</div>
	);
}
