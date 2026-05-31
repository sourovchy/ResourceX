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

export default function StudentDisputes() {
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
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-textSecondary">
				<Loader2 className="h-6 w-6 animate-spin text-primary" />
				<span className="text-sm font-medium">Loading disputes…</span>
			</div>
		);
	}

	return (
		<div className="w-full space-y-6 px-4 pb-20 sm:px-6 lg:px-8">
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-textPrimary">Disputes</h1>
				<p className="mt-1 text-sm text-textSecondary">
					View your dispute history or raise a new issue for admin review.
				</p>
			</div>

			{error && (
				<div className="flex items-center gap-3 rounded-xl border border-error/40 bg-errorLight px-4 py-3 text-sm font-medium text-error">
					<AlertTriangle className="h-4 w-4 shrink-0" />
					<span>{error}</span>
				</div>
			)}

			{disputes.length === 0 ? (
				<PageEmpty
					icon={CheckCircle2}
					title="No disputes on record"
					description="You have no open or past disputes. If something goes wrong with a booking, you can raise a dispute from the Bookings page."
				/>
			) : (
				<div className="overflow-hidden rounded-xl border border-borderLight bg-surface shadow-sm">
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
								<div
									key={d.disputeId}
									className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-surfaceVariant/60 sm:flex-row sm:items-center sm:justify-between">
									<div className="min-w-0 flex-1">
										<div className="font-bold text-textPrimary">
											{d.title ?? `Booking #${d.bookingId}`}
										</div>
										<div className="mt-0.5 text-sm text-textSecondary">
											DSP-{d.disputeId}
											{d.reason ? ` • ${d.reason}` : ""}
										</div>
										<div className="mt-1 text-xs text-textTertiary">
											Filed: {formatShortDate(d.createdAt)}
										</div>
									</div>
									<span
										className={`inline-flex w-fit shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusClass}`}>
										{d.status}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
