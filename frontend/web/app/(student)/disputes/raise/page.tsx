"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
	ArrowLeft,
	Scale,
	UploadCloud,
	CheckCircle2,
	AlertOctagon,
} from "lucide-react";

export default function RaiseDisputePage() {
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitted(true);
	};

	if (submitted) {
		return (
			<div className="max-w-xl mx-auto py-20 text-center space-y-6">
				<div className="w-20 h-20 bg-successLight text-success rounded-full flex items-center justify-center mx-auto mb-4">
					<CheckCircle2 className="w-10 h-10" />
				</div>
				<h1 className="text-3xl font-extrabold text-textPrimary">
					Dispute Filed
				</h1>
				<p className="text-textSecondary">
					Your dispute has been escalated to ResourceX administration. We will
					review the evidence and contact you shortly. Rest assured, fairness is
					our priority.
				</p>
				<div className="flex justify-center gap-4 mt-6">
					<Link
						href="/disputes/my"
						className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-primaryDark transition-colors">
						View My Disputes
					</Link>
					<Link
						href="/dashboard"
						className="px-6 py-3 bg-surfaceVariant text-textPrimary font-bold rounded-xl hover:bg-borderLight transition-colors">
						Dashboard
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto space-y-6 pb-20">
			<Link
				href="/disputes/my"
				className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary hover:text-primary transition-colors">
				<ArrowLeft className="w-4 h-4" /> My Disputes
			</Link>

			<div>
				<h1 className="text-2xl font-bold text-textPrimary tracking-tight flex items-center gap-2">
					<Scale className="w-6 h-6 text-error" /> Raise a Dispute
				</h1>
				<p className="text-sm text-textSecondary mt-2">
					If you cannot resolve an issue directly with the other party, submit a
					dispute. A platform admin will step in to mediate.
				</p>
			</div>

			<div className="bg-errorLight text-error p-4 rounded-xl text-sm font-semibold flex items-start gap-3">
				<AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
				<div>
					Remember to include clear proof (photos, screenshots) if claiming
					damage or missing items. False dispute claims result in severe Trust
					Score penalties.
				</div>
			</div>

			<form
				onSubmit={handleSubmit}
				className="bg-surface border border-borderLight p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
				<div className="space-y-2">
					<label className="text-sm font-bold text-textPrimary">
						Select Related Booking
					</label>
					<select
						className="w-full px-4 py-3 bg-surface border border-borderLight rounded-xl text-sm focus:outline-none focus:border-error focus:ring-1 focus:ring-error"
						required>
						<option value="">-- Choose a booking --</option>
						<option value="b1">
							Arduino Kit (Owner: You, Renter: Nusrat J.)
						</option>
						<option value="b2">
							Sony Alpha Camera (Owner: Arif H., Renter: You)
						</option>
					</select>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-bold text-textPrimary">
						Describe the Issue
					</label>
					<textarea
						rows={6}
						placeholder="Be as detailed as possible. Only state facts..."
						className="w-full px-4 py-3 bg-surface border border-borderLight rounded-xl text-sm focus:outline-none focus:border-error focus:ring-1 focus:ring-error resize-none"
						required></textarea>
				</div>

				<div className="space-y-3">
					<label className="text-sm font-bold text-textPrimary">
						Evidence (Optional but recommended)
					</label>
					<div className="border-2 border-dashed border-borderLight bg-surfaceVariant rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-error transition-colors cursor-pointer">
						<UploadCloud className="w-8 h-8 text-textSecondary mb-2" />
						<p className="text-sm font-bold text-textPrimary">
							Upload Photos / Screenshots
						</p>
						<p className="text-xs text-textSecondary mt-1">
							Images must be under 5MB
						</p>
					</div>
				</div>

				<button
					type="submit"
					className="w-full py-4 bg-error text-white font-bold rounded-xl shadow-sm hover:bg-errorDark transition-colors mt-8">
					Submit to Administration
				</button>
			</form>
		</div>
	);
}
