"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { FileText, Loader2, Scale, AlertTriangle, CheckCircle2 } from "lucide-react";

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

const DISPUTE_ENDPOINTS = [
	"/disputes/my",
	"/disputes",
	"/api/disputes/my",
	"/api/disputes",
];

function normalizeDispute(raw: any): Dispute {
	return {
		disputeId: Number(raw?.disputeId ?? raw?.id ?? raw?.dispute_id ?? 0),
		bookingId: Number(
			raw?.bookingId ??
				raw?.booking_id ??
				raw?.booking?.bookingId ??
				0,
		),
		status: String(raw?.status ?? "open"),
		createdAt:
			raw?.createdAt ?? raw?.created_at ?? raw?.createdOn,
		reason:
			raw?.reason ??
			raw?.description ??
			raw?.message ??
			raw?.details,
		title:
			raw?.title ?? raw?.subject ?? raw?.issueTitle,
	};
}

function extractDisputes(payload: DisputeApiResponse) {
	const root: any = payload && typeof payload === "object" ? payload : {};

	const source =
		root.disputes ??
		root.data ??
		root.content ??
		payload;

	if (!Array.isArray(source)) {
		return [] as Dispute[];
	}

	return source.map((item: any) => normalizeDispute(item));
}

function getAuthHeaders(): Record<string, string> {
	if (typeof window === "undefined") return {};

	const token =
		localStorage.getItem("resourcex_token");

	return token
		? {
			Authorization: `Bearer ${token}`,
		}
		: {};
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

				setError(
					err instanceof Error
						? err.message
						: "Failed to load disputes.",
				);
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		};

		void loadDisputes();

		return () => {
			active = false;
		};
	}, []);

	const resolvedCount = useMemo(
		() =>
			disputes.filter(
				(dispute) => dispute.status.toLowerCase() === "resolved",
			).length,
		[disputes],
	);

	if (loading) {
		return (
			<div className="py-20 flex justify-center text-textSecondary">
				<Loader2 className="w-5 h-5 animate-spin mr-2" />
				Loading disputes...
			</div>
		);
	}

	return (
		<div className="max-w-5xl mx-auto space-y-6 pb-20">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary tracking-tight">My Disputes & Case History</h1>
					<p className="text-sm text-textSecondary mt-1">View all disputes tied to your authenticated account.</p>
				</div>
				<Link href="/disputes/raise" className="flex items-center gap-2 px-5 py-2.5 bg-error text-white rounded-xl font-bold text-sm shadow-sm hover:bg-errorDark transition-colors">
					<Scale className="w-4 h-4" /> Raise a Dispute
				</Link>
			</div>

			{error && (
				<div className="flex items-start gap-3 rounded-xl border border-error bg-errorLight/20 p-4 text-sm text-errorDark">
					<AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
					<span>{error}</span>
				</div>
			)}

			<div className="bg-surface border border-borderLight rounded-lg shadow-sm overflow-hidden">
				<div className="px-6 py-4 border-b border-borderLight bg-surfaceVariant">
					<h2 className="font-bold text-sm text-textPrimary uppercase tracking-wider">Your Dispute Records</h2>
				</div>
				<div className="divide-y divide-borderLight">
					{disputes.length === 0 ? (
						<div className="p-12 text-center text-textSecondary">
							<CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
							<p>You have no open or past disputes.</p>
							<p className="text-xs text-textTertiary mt-2">
								Resolved disputes: {resolvedCount}
							</p>
						</div>
					) : (
						disputes.map((d) => (
							<div key={d.disputeId} className="p-6">
								<div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
									<div>
										<div className="flex items-center gap-3">
											<h3 className="font-bold text-textPrimary text-lg">
												{d.title ?? `Booking #${d.bookingId}`}
											</h3>
											<span
												className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
													d.status.toLowerCase() === "resolved"
														? "bg-successLight text-success"
														: d.status.toLowerCase() === "rejected"
															? "bg-errorLight text-error"
															: "bg-warningLight text-warningDark"
												}`}
											>
												{d.status}
											</span>
										</div>
										<div className="text-xs font-semibold text-textSecondary mt-1">
											Ticket: DSP-{d.disputeId}
											{d.createdAt ? ` · Filed ${formatDate(d.createdAt)}` : ""}
										</div>
									</div>
								</div>
								<div className="bg-surfaceVariant rounded-xl p-4 text-sm text-textSecondary flex items-start gap-3">
									<FileText className="w-4 h-4 shrink-0 mt-0.5" />
									{d.reason ?? "Dispute details are available in the ResourceX system."}
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
