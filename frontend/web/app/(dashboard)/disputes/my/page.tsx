"use client";

import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { FileText, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

type Dispute = {
	disputeId: number;
	bookingId: number;
	status: string;
	createdAt?: string;
	reason?: string;
	title?: string;
};

type DisputeApiResponse =
	| {
		disputes?: unknown;
		data?: unknown;
		content?: unknown;
	}
	| unknown;

const DISPUTE_ENDPOINTS = ["/disputes/my", "/disputes", "/api/disputes/my", "/api/disputes"];

function normalizeDispute(raw: any): Dispute {
	return {
		disputeId: Number(raw?.disputeId ?? raw?.id ?? raw?.dispute_id ?? 0),
		bookingId: Number(raw?.bookingId ?? raw?.booking_id ?? raw?.booking?.bookingId ?? 0),
		status: String(raw?.status ?? "open"),
		createdAt: raw?.createdAt ?? raw?.created_at ?? raw?.createdOn,
		reason: raw?.reason ?? raw?.description ?? raw?.message ?? raw?.details,
		title: raw?.title ?? raw?.subject ?? raw?.issueTitle,
	};
}

function extractDisputes(payload: DisputeApiResponse) {
	const root: any = payload && typeof payload === "object" ? payload : {};
	const source = root.disputes ?? root.data ?? root.content ?? payload;

	if (!Array.isArray(source)) return [] as Dispute[];
	return source.map((item: any) => normalizeDispute(item));
}

function getAuthHeaders(): Record<string, string> {
	if (typeof window === "undefined") return {};

	const token = localStorage.getItem("resourcex_token");
	return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchDisputesFromEndpoint(endpoint: string) {
	const response = await api.get<DisputeApiResponse>(endpoint, {
		headers: {
			"Content-Type": "application/json",
			...getAuthHeaders(),
		},
	});

	return extractDisputes(response.data);
}

function formatDate(date?: string) {
	if (!date) return "—";
	return new Date(date).toLocaleDateString();
}

export default function MyDisputesPage() {
	const [disputes, setDisputes] = useState<Dispute[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		const loadDisputes = async () => {
			setLoading(true);
			setError(null);

			try {
				let loadedDisputes: Dispute[] = [];

				for (const endpoint of DISPUTE_ENDPOINTS) {
					try {
						const normalized = await fetchDisputesFromEndpoint(endpoint);
						if (normalized.length > 0) {
							loadedDisputes = normalized;
							break;
						}
					} catch {
						// try next endpoint
					}
				}

				if (!active) return;
				setDisputes(loadedDisputes);
			} catch (err) {
				if (!active) return;
				setError(err instanceof Error ? err.message : "Failed to load disputes.");
			} finally {
				if (active) setLoading(false);
			}
		};

		void loadDisputes();

		return () => {
			active = false;
		};
	}, []);

	const resolvedCount = useMemo(
		() => disputes.filter((dispute) => dispute.status.toLowerCase() === "resolved").length,
		[disputes],
	);

	if (loading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center gap-3 px-4 text-center text-textSecondary">
				<Loader2 className="h-5 w-5 animate-spin" />
				<span className="text-sm font-medium sm:text-base">Loading disputes...</span>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-5xl space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0">
			<div>
				<h1 className="text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
					My Disputes &amp; Case History
				</h1>
				<p className="mt-1 text-sm text-textSecondary">
					View all disputes tied to your authenticated account.
				</p>
			</div>

			{error && (
				<div className="flex items-start gap-3 rounded-xl border border-error bg-errorLight/20 p-4 text-sm text-errorDark">
					<AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
					<span>{error}</span>
				</div>
			)}

			<div className="overflow-hidden rounded-2xl border border-borderLight bg-surface shadow-sm">
				<div className="border-b border-borderLight bg-surfaceVariant px-4 py-4 sm:px-6">
					<h2 className="text-sm font-bold uppercase tracking-wider text-textPrimary">
						Your Dispute Records
					</h2>
				</div>

				<div className="divide-y divide-borderLight">
					{disputes.length === 0 ? (
						<div className="px-4 py-16 text-center text-textSecondary sm:px-6 sm:py-20">
							<CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-success" />
							<p className="text-sm font-medium sm:text-base">You have no open or past disputes.</p>
							<p className="mt-2 text-xs text-textTertiary sm:text-sm">
								Resolved disputes: {resolvedCount}
							</p>
						</div>
					) : (
						disputes.map((d) => {
							const status = d.status.toLowerCase();
							const statusClass =
								status === "resolved"
									? "bg-successLight text-success"
									: status === "rejected"
										? "bg-errorLight text-error"
										: "bg-warningLight text-warningDark";

							return (
								<div key={d.disputeId} className="p-4 sm:p-6">
									<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
										<div className="min-w-0">
											<div className="flex flex-wrap items-center gap-2">
												<h3 className="break-words text-lg font-bold text-textPrimary">
													{d.title ?? `Booking #${d.bookingId}`}
												</h3>
												<span
													className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass}`}>
													{d.status}
												</span>
											</div>

											<div className="mt-1 text-xs font-semibold text-textSecondary">
												Ticket: DSP-{d.disputeId}
												{d.createdAt ? ` · Filed ${formatDate(d.createdAt)}` : ""}
											</div>
										</div>
									</div>

									<div className="flex items-start gap-3 rounded-xl bg-surfaceVariant p-4 text-sm text-textSecondary">
										<FileText className="mt-0.5 h-4 w-4 shrink-0" />
										<span className="break-words">
											{d.reason ?? "Dispute details are available in the ResourceX system."}
										</span>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>
		</div>
	);
}
