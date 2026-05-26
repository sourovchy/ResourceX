"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
	CheckCircle2,
	FileText,
	Loader2,
	Scale,
	AlertTriangle,
} from "lucide-react";

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

const DISPUTE_ENDPOINTS = ["/disputes", "/api/disputes", "/student/disputes"];

function normalizeDispute(raw: any): Dispute {
	return {
		disputeId: Number(raw?.disputeId ?? raw?.id ?? raw?.dispute_id ?? 0),
		bookingId: Number(
			raw?.bookingId ?? raw?.booking_id ?? raw?.booking?.bookingId ?? 0,
		),
		status: String(raw?.status ?? "open"),
		createdAt: raw?.createdAt ?? raw?.created_at ?? raw?.createdOn,
		reason: raw?.reason ?? raw?.description ?? raw?.message ?? raw?.details,
		title: raw?.title ?? raw?.subject ?? raw?.issueTitle,
	};
}

function extractDisputes(payload: DisputeApiResponse) {
	const root: any = payload && typeof payload === "object" ? payload : {};
	const source = root.disputes ?? root.data ?? root.content ?? payload;

	if (!Array.isArray(source)) {
		return [] as Dispute[];
	}

	return source.map((item: any) => normalizeDispute(item));
}

function getAuthHeaders(): Record<string, string> {
	if (typeof window === "undefined") return {};

	const token = localStorage.getItem("resourcex_token");

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

export default function DisputesPage() {
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
					err instanceof Error ? err.message : "Failed to load disputes.",
				);
			} finally {
				if (active) setLoading(false);
			}
		};

		void loadDisputes();

		return () => {
			active = false;
		};
	}, []);

	const openCount = useMemo(
		() =>
			disputes.filter((dispute) => dispute.status.toLowerCase() !== "resolved")
				.length,
		[disputes],
	);

	if (loading) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-textSecondary">
				<Loader2 className="h-6 w-6 animate-spin text-primary" />
				<span className="text-sm font-medium">Loading disputes…</span>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl space-y-6 px-4 pb-20 sm:px-6 lg:px-8">
			{/* Header section – matches admin layout */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary tracking-tight">
						Disputes
					</h1>
					<p className="mt-1 text-sm text-textSecondary">
						View your dispute history or raise a new issue for admin review.
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					<Link
						href="/disputes/my"
						className="inline-flex items-center gap-2 rounded-xl border border-outlineVariant bg-surface px-4 py-2 text-sm font-semibold text-textSecondary transition hover:bg-surfaceVariant">
						<FileText className="h-4 w-4" /> My Disputes
					</Link>
					<Link
						href="/disputes/raise"
						className="inline-flex items-center gap-2 rounded-xl bg-error px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-errorDark">
						<Scale className="h-4 w-4" /> Raise a Dispute
					</Link>
				</div>
			</div>

			{/* Error banner – consistent with admin error style */}
			{error && (
				<div className="flex items-center gap-3 rounded-xl border border-error/40 bg-errorLight px-4 py-3 text-sm font-medium text-error">
					<AlertTriangle className="h-4 w-4 shrink-0" />
					<span>{error}</span>
				</div>
			)}

			{/* Disputes list card – matches pending approvals panel */}
			<div className="overflow-hidden rounded-xl border border-borderLight bg-surface shadow-sm">
				{disputes.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-3 px-5 py-12 text-center">
						<CheckCircle2 className="h-12 w-12 text-success" />
						<p className="text-textSecondary">
							You have no open or past disputes.
						</p>
						<p className="text-xs text-textTertiary">
							Open disputes: {openCount}
						</p>
					</div>
				) : (
					<div className="divide-y divide-borderLight">
						{disputes.map((dispute) => (
							<div
								key={dispute.disputeId}
								className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-surfaceVariant/60 sm:flex-row sm:items-center sm:justify-between">
								<div className="min-w-0 flex-1">
									<div className="font-bold text-textPrimary">
										{dispute.title ?? `Booking #${dispute.bookingId}`}
									</div>
									<div className="mt-0.5 text-sm text-textSecondary">
										DSP-{dispute.disputeId}
										{dispute.reason ? ` • ${dispute.reason}` : ""}
									</div>
									<div className="mt-1 text-xs text-textTertiary">
										Created: {formatDate(dispute.createdAt)}
									</div>
								</div>
								<span className="inline-flex w-fit shrink-0 items-center rounded-full bg-warningLight px-2.5 py-1 text-xs font-bold capitalize text-warning">
									{dispute.status}
								</span>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
