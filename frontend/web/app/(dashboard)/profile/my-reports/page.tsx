"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { formatShortDate } from "@/lib/dateUtils";
import {
	AlertTriangle,
	ArrowLeft,
	Clock,
	CheckCircle,
	Loader2,
} from "lucide-react";

interface Report {
	reportId: number;
	entityType: string;
	entityId: number;
	entityName: string;
	reason: string;
	status: string; // PENDING, RESOLVED
	createdAt: string;
}

const REASON_LABELS: Record<string, string> = {
	INAPPROPRIATE_CONTENT: "Inappropriate Content / Language",
	FRAUD_OR_SCAM: "Fraud or Scam",
	MISLEADING_INFO: "Misleading Information",
	STOLEN_PROPERTY: "Stolen Property",
	PROHIBITED_ITEM: "Prohibited Item / Dangerous Goods",
	OTHER: "Other Reason",
};

export default function MyReportsPage() {
	const [reports, setReports] = useState<Report[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		const loadReports = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await api.get<Report[]>("/api/reports/my");
				if (!active) return;
				setReports(res.data || []);
			} catch (err) {
				console.error("Failed to load your reports", err);
				if (active) setError("Failed to retrieve your reporting history.");
			} finally {
				if (active) setLoading(false);
			}
		};

		void loadReports();
		return () => { active = false; };
	}, []);

	if (loading) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center text-textSecondary">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
				<span className="text-sm font-semibold">Loading your reports...</span>
			</div>
		);
	}

	return (
		<div className="w-full space-y-6 px-4 pb-20 sm:px-6 lg:px-8">
			{/* Back link */}
			<div>
				<Link
					href="/profile"
					className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary transition hover:text-textPrimary"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Profile
				</Link>
			</div>

			<div className="flex flex-col gap-1">
				<h1 className="text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
					My Reports History
				</h1>
				<p className="text-sm text-textSecondary">
					View and track the status of listings or users you have flagged for moderation review.
				</p>
			</div>

			{error && (
				<div className="flex items-center gap-3 rounded-xl border border-error/30 bg-errorLight px-4 py-3.5 text-sm font-medium text-error animate-slide-down shadow-sm">
					<AlertTriangle className="h-5 w-5 shrink-0" />
					{error}
				</div>
			)}

			<div className="space-y-4">
				{reports.length === 0 ? (
					<div className="rounded-2xl border border-borderLight bg-surface px-4 py-16 text-center shadow-sm sm:p-20">
						<div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-successLight">
							<CheckCircle className="w-10 h-10 text-success" />
						</div>
						<h3 className="text-lg font-bold text-textPrimary sm:text-xl">
							No reports submitted
						</h3>
						<p className="mx-auto mt-2 max-w-md px-2 text-sm text-textSecondary">
							Thank you for keeping our community safe. You have not flagged any listings or items yet.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{reports.map((report) => {
							const isPending = report.status === "PENDING";
							const label = REASON_LABELS[report.reason] || report.reason;

							return (
								<div
									key={report.reportId}
									className="rounded-2xl border border-borderLight bg-surface p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow"
								>
									<div className="flex items-start justify-between gap-4">
										<div>
											<span className="text-[10px] uppercase font-bold text-textTertiary tracking-wider">
												Report Type: {report.entityType}
											</span>
											<h3 className="text-base font-bold text-textPrimary mt-0.5 line-clamp-1">
												{report.entityName}
											</h3>
										</div>
										<span
											className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider
												${
													isPending
														? "bg-warningLight text-warningDark border border-warning/10"
														: "bg-successLight text-success border border-success/10"
												}
											`}
										>
											{isPending ? (
												<Clock className="w-3 h-3" />
											) : (
												<CheckCircle className="w-3 h-3" />
											)}
											{report.status}
										</span>
									</div>

									<div className="border-t border-borderLight pt-3 space-y-2">
										<div>
											<div className="text-[10px] font-bold text-textTertiary uppercase">Reason Flagged</div>
											<div className="text-xs font-semibold text-textSecondary mt-0.5">{label}</div>
										</div>
										<div>
											<div className="text-[10px] font-bold text-textTertiary uppercase">Submitted Date</div>
											<div className="text-xs font-semibold text-textSecondary mt-0.5">
												{formatShortDate(report.createdAt)}
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
