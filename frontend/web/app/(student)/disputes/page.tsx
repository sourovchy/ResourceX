"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { CheckCircle2, FileText, Loader2, Scale } from "lucide-react";

type Dispute = {
	disputeId: number;
	bookingId: number;
	status: string;
	createdAt?: string;
};

export default function DisputesPage() {
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
			<div className="flex flex-col items-start gap-4">
				<div>
					<h1 className="text-2xl font-bold text-textPrimary tracking-tight">Disputes</h1>
					<p className="text-sm text-textSecondary mt-1">View your dispute history or raise a new issue for admin review.</p>
				</div>
				<div className="flex items-center gap-2">
					<Link href="/disputes/my" className="flex items-center gap-2 px-4 py-2 bg-surface border border-borderLight text-textPrimary rounded-xl font-semibold text-sm hover:bg-surfaceVariant transition">
						<FileText className="w-4 h-4" /> My Disputes
					</Link>
					<Link href="/disputes/raise" className="flex items-center gap-2 px-4 py-2 bg-error text-white rounded-xl font-bold text-sm shadow-sm hover:bg-errorDark transition-colors">
						<Scale className="w-4 h-4" /> Raise a Dispute
					</Link>
				</div>
			</div>

			<div className="bg-surface border border-borderLight rounded-lg p-6">
				{disputes.length === 0 ? (
					<div className="text-center py-12">
						<CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
						<p className="text-textSecondary">You have no open or past disputes.</p>
					</div>
				) : (
					<div className="divide-y divide-borderLight">
						{disputes.map((dispute) => (
							<div key={dispute.disputeId} className="py-4 flex items-center justify-between">
								<div>
									<div className="font-bold text-textPrimary">Booking #{dispute.bookingId}</div>
									<div className="text-sm text-textSecondary">DSP-{dispute.disputeId}</div>
								</div>
								<span className="px-2.5 py-1 rounded-full text-xs font-bold bg-warningLight text-warningDark">{dispute.status}</span>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
