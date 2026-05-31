"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, FileText, Loader2, AlertTriangle } from "lucide-react";
import api from "@/lib/api";
import { PageEmpty } from "@/components/ui/PageEmpty";
import { formatShortDate } from "@/lib/dateUtils";

type Dispute = {
	disputeId: number;
	bookingId: number;
	status: string;
	createdAt?: string;
	reason?: string;
	title?: string;
};

export default function MyDisputesPage() {
	const [disputes, setDisputes] = useState<Dispute[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		const load = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await api.get<Dispute[] | { content?: Dispute[] }>("/disputes");
				if (!active) return;
				const data = res.data;
				setDisputes(Array.isArray(data) ? data : (data as { content?: Dispute[] }).content ?? []);
			} catch (err) {
				if (!active) return;
				setError(err instanceof Error ? err.message : "Failed to load disputes.");
			} finally {
				if (active) setLoading(false);
			}
		};

		void load();
		return () => { active = false; };
	}, []);

	if (loading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center gap-3 px-4 text-center text-textSecondary">
				<Loader2 className="h-5 w-5 animate-spin" />
				<span className="text-sm font-medium sm:text-base">Loading disputes...</span>
			</div>
		);
	}

	return (
		<div className="w-full space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0">
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

			{disputes.length === 0 ? (
				<PageEmpty
					icon={CheckCircle2}
					title="No disputes on record"
					description="You have no open or past disputes. If something goes wrong with a booking, you can raise a dispute from your Bookings page."
				/>
			) : (
				<div className="overflow-hidden rounded-2xl border border-borderLight bg-surface shadow-sm">
					<div className="border-b border-borderLight bg-surfaceVariant px-4 py-4 sm:px-6">
						<h2 className="text-sm font-bold uppercase tracking-wider text-textPrimary">
							Your Dispute Records
						</h2>
					</div>
					<div className="divide-y divide-borderLight">
						{disputes.map((d) => {
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
												{d.createdAt ? ` · Filed ${formatShortDate(d.createdAt)}` : ""}
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
						})}
					</div>
				</div>
			)}
		</div>
	);
}
