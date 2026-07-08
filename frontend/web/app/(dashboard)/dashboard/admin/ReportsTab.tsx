"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Eye, ShieldAlert, Package, Users, Calendar } from "lucide-react";
import { ListRowSkeleton } from "@/components/ui/Skeleton";
import { formatDate } from "./activityUtils";

export type Report = {
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
};

const REASON_LABELS: Record<string, string> = {
	INAPPROPRIATE_CONTENT: "Inappropriate Content",
	FRAUD_OR_SCAM: "Fraud or Scam",
	MISLEADING_INFO: "Misleading Information",
	STOLEN_PROPERTY: "Stolen Property",
	PROHIBITED_ITEM: "Prohibited Item",
	OTHER: "Other Reason",
};

function getEntityIcon(entityType: string) {
	switch (entityType) {
		case "ITEM":
			return <Package className="h-4 w-4 text-primary" />;
		case "USER":
			return <Users className="h-4 w-4 text-blue-500" />;
		case "BOOKING":
			return <Calendar className="h-4 w-4 text-purple-500" />;
		default:
			return <AlertTriangle className="h-4 w-4 text-warning" />;
	}
}

export default function ReportsTab({
	reports,
	loading,
}: {
	reports: Report[];
	loading: boolean;
}) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-bold text-textPrimary">Awaiting Moderation Review</h3>
				<Link
					href="/moderation"
					className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
				>
					View All Active Reports
					<ArrowRight className="h-3.5 w-3.5" />
				</Link>
			</div>

			<div className="divide-y divide-borderLight border border-borderLight rounded-xl overflow-hidden bg-card">
				{loading ? (
					<ListRowSkeleton count={4} />
				) : reports.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
						<ShieldAlert className="h-8 w-8 text-success" />
						<p className="text-sm font-semibold text-textSecondary">All clear!</p>
						<p className="text-xs text-textTertiary">No pending content or user reports.</p>
					</div>
				) : (
					reports.slice(0, 5).map((report) => {
						const reasonLabel = REASON_LABELS[report.reason] || report.reason;
						return (
							<div
								key={report.reportId}
								className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-surface/50"
							>
								<div className="flex items-start gap-3 min-w-0">
									<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface border border-borderLight shadow-sm">
										{getEntityIcon(report.entityType)}
									</div>
									<div className="min-w-0">
										<div className="truncate text-xs font-bold text-textPrimary">
											{reasonLabel}
										</div>
										<div className="truncate text-[10px] text-textTertiary mt-0.5">
											Reported {report.entityType}: <span className="font-semibold text-textSecondary">{report.entityName || `#${report.entityId}`}</span>
											{report.reporterName && ` · Flagged by ${report.reporterName}`}
										</div>
										{report.createdAt && (
											<div className="text-[9px] text-textTertiary mt-0.5">
												Reported: {formatDate(report.createdAt)}
											</div>
										)}
									</div>
								</div>
								<Link
									href={`/moderation/investigate/${report.reportId}`}
									className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:opacity-90 transition shadow-sm"
								>
									<Eye className="h-3.5 w-3.5" />
									Investigate
								</Link>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}
