"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { formatShortDate } from "@/lib/dateUtils";
import {
	AlertTriangle,
	ArrowLeft,
	CheckCircle,
	XCircle,
	ExternalLink,
	User,
	Tag,
	Clock,
	ShieldAlert,
	Loader2,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { PageLoader } from "@/components/ui/PageLoader";
import { PageError } from "@/components/ui/PageError";

interface Report {
	reportId: number;
	reporterId: number;
	reporterName: string;
	reporterEmail: string;
	entityType: string;
	entityId: number;
	entityName: string;
	ownerId?: number;
	ownerName?: string;
	ownerEmail?: string;
	reason: string;
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

export default function InvestigatePage({ params }: { params: { id: string } }) {
	const router = useRouter();
	const { toast } = useToast();
	const [report, setReport] = useState<Report | null>(null);
	const [relatedReports, setRelatedReports] = useState<Report[]>([]);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		const loadData = async () => {
			setLoading(true);
			setError(null);
			try {
				// 1. Load details of this report
				const reportRes = await api.get<any>(`/admin/reports/${params.id}`);
				if (!active) return;
				
				const rawReport = reportRes.data;
				if (!rawReport) {
					throw new Error("No report data returned");
				}
				
				const isUserReport = rawReport.reportedUserId != null;
				const mappedReport: Report = {
					reportId: rawReport.reportId,
					reporterId: rawReport.reporterId,
					reporterName: rawReport.reporterName,
					reporterEmail: rawReport.reporterEmail,
					entityType: isUserReport ? "USER" : "ITEM",
					entityId: isUserReport ? rawReport.reportedUserId : rawReport.reportedItemId,
					entityName: isUserReport ? rawReport.reportedUserName : rawReport.reportedItemTitle,
					ownerId: isUserReport ? rawReport.reportedUserId : undefined,
					ownerName: isUserReport ? rawReport.reportedUserName : rawReport.reportedItemOwnerName,
					ownerEmail: isUserReport ? rawReport.reportedUserEmail : undefined,
					reason: rawReport.reason,
					createdAt: rawReport.createdAt,
				};
				setReport(mappedReport);

				// 2. Load other reports on the same entity using the correct backend endpoint
				const endpoint = isUserReport
					? `/admin/reports/user/${mappedReport.entityId}`
					: `/admin/reports/item/${mappedReport.entityId}`;

				const relatedRes = await api.get<any[]>(endpoint);
				if (!active) return;

				const mappedRelated = (relatedRes.data || []).map((r) => ({
					reportId: r.reportId,
					reporterId: r.reporterId,
					reporterName: r.reporterName,
					reporterEmail: r.reporterEmail,
					entityType: r.reportedUserId != null ? "USER" : "ITEM",
					entityId: r.reportedUserId != null ? r.reportedUserId : r.reportedItemId,
					entityName: r.reportedUserId != null ? r.reportedUserName : r.reportedItemTitle,
					reason: r.reason,
					createdAt: r.createdAt,
				}));

				// Filter out current report to prevent showing it in related
				setRelatedReports(
					mappedRelated.filter((r) => r.reportId !== mappedReport.reportId)
				);
			} catch (err) {
				console.error("Failed to load investigation details", err);
				if (active) setError("Could not find moderation record.");
			} finally {
				if (active) setLoading(false);
			}
		};

		void loadData();
		return () => { active = false; };
	}, [params.id]);

	const handleAction = async (confirmed: boolean, penalizeReporter: boolean, actionLabel: string) => {
		if (!report) return;
		setActionLoading(true);
		try {
			await api.patch(
				`/admin/reports/${report.reportId}/resolve?confirmed=${confirmed}&penalizeReporter=${penalizeReporter}`
			);
			toast(`Report resolved: ${actionLabel}`);
			router.push("/moderation");
		} catch (err) {
			console.error("Failed to submit action", err);
			toast("Failed to update report status.", "error");
		} finally {
			setActionLoading(false);
		}
	};

	if (loading) {
		return <PageLoader message="Loading investigation file..." />;
	}

	if (error || !report) {
		return <PageError message={error ?? "This report record does not exist."} onRetry={() => window.location.reload()} />;
	}

	const reasonLabel = REASON_LABELS[report.reason] || report.reason;

	return (
		<div className="space-y-6 pb-20 sm:pb-6 animate-fade-in graph-grid page-enter">
			{/* Back Link */}
			<div>
				<Link
					href="/moderation"
					className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary transition hover:text-textPrimary"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to List
				</Link>
			</div>

			{/* Title Banner */}
			<div className="glass-surface relative overflow-hidden rounded-2xl p-6 shadow-sm">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<div className="flex items-center gap-2.5">
							<span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-warningLight text-warningDark border border-warning/10">
								ACTIVE
							</span>
							<span className="text-xs text-textTertiary">
								Report ID: #{report.reportId}
							</span>
						</div>
						<h2 className="mt-0.5 text-2xl font-bold tracking-tighter text-textPrimary">
							Investigation: <span className="text-gradient-brand italic">{reasonLabel}.</span>
						</h2>
						<p className="mt-1 text-sm text-textSecondary">
							Flagged {formatShortDate(report.createdAt)} against {report.entityType} #{report.entityId}
						</p>
					</div>

					{/* Action Buttons inside Banner */}
					<div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
						<button
							onClick={() => handleAction(true, false, "Violation Confirmed")}
							disabled={actionLoading}
							className="flex items-center gap-1.5 rounded-xl bg-error px-4 py-2.5 text-xs font-bold text-white shadow hover:opacity-90 disabled:opacity-50"
						>
							<CheckCircle className="h-4 w-4" />
							Confirm Violation
						</button>
						<button
							onClick={() => handleAction(false, false, "Dismissed without Penalty")}
							disabled={actionLoading}
							className="flex items-center gap-1.5 rounded-xl border border-borderLight bg-card px-4 py-2.5 text-xs font-bold text-textSecondary transition hover:bg-surfaceVariant hover:text-textPrimary disabled:opacity-50"
						>
							<XCircle className="h-4 w-4" />
							Dismiss Report
						</button>
						<button
							onClick={() => handleAction(false, true, "Reporter Flagged for Abuse")}
							disabled={actionLoading}
							className="flex items-center gap-1.5 rounded-xl border border-error/25 bg-errorLight/10 px-4 py-2.5 text-xs font-bold text-error transition hover:bg-errorLight/25 disabled:opacity-50"
						>
							<ShieldAlert className="h-4 w-4" />
							Flag Abusive Reporter
						</button>
					</div>
				</div>
			</div>

			{/* Main Grid */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Left Columns - Detailed Information */}
				<div className="lg:col-span-2 space-y-6">
					{/* Flagged Entity Details */}
					<Card padding="none" className="p-5 space-y-4" interactive={true}>
						<h3 className="text-sm font-bold uppercase tracking-wider text-textSecondary flex items-center gap-2">
							<Tag className="h-4 w-4 text-primary" />
							Reported Entity Details
						</h3>

						<div className="rounded-xl border border-borderLight bg-card p-4 space-y-3">
							<div className="flex items-start justify-between gap-4">
								<div>
									<div className="text-xs font-bold text-textTertiary uppercase">
										{report.entityType} Title / Name
									</div>
									<div className="text-base font-bold text-textPrimary mt-0.5">
										{report.entityName || "N/A"}
									</div>
								</div>
								{report.entityType === "ITEM" && (
									<Link
										href={`/items/${report.entityId}`}
										target="_blank"
										className="inline-flex items-center gap-1 rounded-lg border border-primaryLight bg-primaryLight/50 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition"
									>
										View Listing
										<ExternalLink className="h-3 w-3" />
									</Link>
								)}
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-borderLight pt-3">
								<div>
									<div className="text-[10px] font-bold text-textTertiary uppercase">Entity Owner Name</div>
									<div className="text-xs font-semibold text-textSecondary mt-0.5">{report.ownerName || "N/A"}</div>
								</div>
								<div>
									<div className="text-[10px] font-bold text-textTertiary uppercase">Entity Owner Email</div>
									<div className="text-xs font-semibold text-textSecondary mt-0.5">{report.ownerEmail || "N/A"}</div>
								</div>
							</div>
						</div>
					</Card>

					{/* Reporter Details */}
					<Card padding="none" className="p-5 space-y-4" interactive={true}>
						<h3 className="text-sm font-bold uppercase tracking-wider text-textSecondary flex items-center gap-2">
							<User className="h-4 w-4 text-primary" />
							Reporter Information
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-borderLight bg-card p-4">
							<div>
								<div className="text-[10px] font-bold text-textTertiary uppercase">Reporter Name</div>
								<div className="text-xs font-semibold text-textSecondary mt-0.5">{report.reporterName}</div>
							</div>
							<div>
								<div className="text-[10px] font-bold text-textTertiary uppercase">Reporter Email</div>
								<div className="text-xs font-semibold text-textSecondary mt-0.5">{report.reporterEmail}</div>
							</div>
							<div>
								<div className="text-[10px] font-bold text-textTertiary uppercase">Submitted Date</div>
								<div className="text-xs font-semibold text-textSecondary mt-0.5">{formatShortDate(report.createdAt)}</div>
							</div>
						</div>
					</Card>

					{/* Flagged Reason */}
					<Card padding="none" className="p-5 space-y-3" interactive={true}>
						<h3 className="text-sm font-bold uppercase tracking-wider text-textSecondary">
							Moderation Note / Reason
						</h3>
						<div className="rounded-xl border border-borderLight bg-card p-4 text-sm text-textSecondary leading-relaxed whitespace-pre-line">
							{report.reason}
						</div>
					</Card>

				</div>

				{/* Right Column - Related Reports */}
				<div className="space-y-6">
					<Card padding="none" className="p-5 space-y-4 min-h-[300px]" interactive={true}>
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-bold uppercase tracking-wider text-textSecondary flex items-center gap-2">
								<Clock className="h-4 w-4 text-error" />
								Related Reports
							</h3>
							<span className="rounded-full bg-errorLight px-2 py-0.5 text-[10px] font-bold text-error">
								{relatedReports.length} other{relatedReports.length !== 1 ? "s" : ""}
							</span>
						</div>

						<p className="text-xs text-textSecondary leading-snug">
							Other reports filed against the same {report.entityType} #{report.entityId} listing.
						</p>

						<div className="space-y-3">
							{relatedReports.length === 0 ? (
								<div className="rounded-xl border border-dashed border-borderLight p-6 text-center text-xs text-textTertiary">
									No other reports have been submitted against this item.
								</div>
							) : (
								relatedReports.map((item) => (
									<div
										key={item.reportId}
										className="rounded-xl border border-borderLight bg-card p-3 space-y-2 text-xs"
									>
										<div className="flex items-center justify-between">
											<span className="font-bold text-textPrimary">
												{REASON_LABELS[item.reason] || item.reason}
											</span>
											<span className="text-[10px] text-textTertiary">
												{formatShortDate(item.createdAt)}
											</span>
										</div>
										<div className="text-textSecondary flex items-center justify-between">
											<span>By: {item.reporterName}</span>
										</div>
									</div>
								))
							)}
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
