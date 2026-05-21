"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { FileText, Loader2, Scale } from "lucide-react";

type Dispute = {
	disputeId: number;
	bookingId: number;
	status: string;
	createdAt?: string;
};

export default function MyDisputesPage() {
	const [disputes, setDisputes] = useState<Dispute[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		api
			.get<Dispute[]>("/disputes")
			.then((res) => setDisputes(res.data ?? []))
			.finally(() => setLoading(false));
	}, []);

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

			<div className="bg-surface border border-borderLight rounded-lg shadow-sm overflow-hidden">
				<div className="px-6 py-4 border-b border-borderLight bg-surfaceVariant">
					<h2 className="font-bold text-sm text-textPrimary uppercase tracking-wider">Your Dispute Records</h2>
				</div>
				<div className="divide-y divide-borderLight">
					{disputes.length === 0 ? (
						<div className="p-12 text-center text-textSecondary">You have no open or past disputes.</div>
					) : (
						disputes.map((d) => (
							<div key={d.disputeId} className="p-6">
								<div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
									<div>
										<div className="flex items-center gap-3">
											<h3 className="font-bold text-textPrimary text-lg">Booking #{d.bookingId}</h3>
											<span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-warningLight text-warningDark">
												{d.status}
											</span>
										</div>
										<div className="text-xs font-semibold text-textSecondary mt-1">
											Ticket: DSP-{d.disputeId} {d.createdAt ? `· Filed ${new Date(d.createdAt).toLocaleDateString()}` : ""}
										</div>
									</div>
								</div>
								<div className="bg-surfaceVariant rounded-xl p-4 text-sm text-textSecondary flex items-start gap-3">
									<FileText className="w-4 h-4 shrink-0 mt-0.5" />
									Dispute details are stored in the ResourceX database.
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
