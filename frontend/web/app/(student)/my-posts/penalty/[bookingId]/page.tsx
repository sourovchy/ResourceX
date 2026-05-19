"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, AlertOctagon, CheckCircle2 } from "lucide-react";

export default function PenaltyRequestPage() {
	const params = useParams();
	const bookingId = params?.bookingId as string;

	const [submitted, setSubmitted] = useState(false);

	// Mock
	const itemName = "Arduino Mega 2560 Kit";
	const depositLimit = 500;

	const [amount, setAmount] = useState("");
	const [reason, setReason] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// safety clamp
		const finalAmount = Math.min(Number(amount), depositLimit);

		console.log({
			bookingId,
			amount: finalAmount,
			reason,
		});

		setSubmitted(true);
	};

	if (submitted) {
		return (
			<div className="max-w-xl mx-auto py-20 text-center space-y-6">
				<div className="w-20 h-20 bg-warningLight text-warningDark rounded-full flex items-center justify-center mx-auto mb-4">
					<CheckCircle2 className="w-10 h-10" />
				</div>
				<h1 className="text-3xl font-extrabold text-textPrimary">
					Penalty Request Submitted
				</h1>
				<p className="text-textSecondary">
					CampusVault admins will review your request. The renter's deposit is
					held during this investigation.
				</p>
				<Link
					href="/my-posts/active-rentals"
					className="inline-block mt-4 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-primaryDark transition-colors">
					Back to Rentals
				</Link>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto space-y-6 pb-20">
			<Link
				href="/my-posts/active-rentals"
				className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary hover:text-primary transition-colors">
				<ArrowLeft className="w-4 h-4" /> Back to Rentals
			</Link>

			<div>
				<h1 className="text-2xl font-bold text-textPrimary tracking-tight flex items-center gap-2">
					<AlertOctagon className="w-6 h-6 text-error" /> Report Damage /
					Request Penalty
				</h1>
				<p className="text-sm text-textSecondary mt-2">
					Submit this form if {itemName} was returned damaged or had issues.
					This deducts from the renter's deposit upon admin approval.
				</p>
			</div>

			<form
				onSubmit={handleSubmit}
				className="bg-surface border border-error/20 p-6 md:p-8 rounded-2xl shadow-sm space-y-6">

				<div className="bg-errorLight text-error p-4 rounded-xl text-sm font-semibold flex gap-2">
					<AlertOctagon className="w-5 h-5 shrink-0" />
					Note: Maximum deduction limit is the held deposit amount: ৳{" "}
					{depositLimit}.
				</div>

				<div className="space-y-2">
					<label className="text-sm font-bold text-textPrimary">
						Penalty Amount Requested (৳)
					</label>
					<input
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						type="number"
						min="0"
						max={depositLimit}
						placeholder="e.g. 150"
						className="w-full px-4 py-3 bg-surfaceVariant border border-borderLight rounded-xl text-sm focus:outline-none focus:border-error focus:ring-1 focus:ring-error transition-all"
						required
					/>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-bold text-textPrimary">
						Detailed Reason
					</label>
					<textarea
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						rows={5}
						placeholder="Describe the damage..."
						className="w-full px-4 py-3 bg-surfaceVariant border border-borderLight rounded-xl text-sm focus:outline-none focus:border-error focus:ring-1 focus:ring-error resize-none transition-all"
						required></textarea>
				</div>

				<button
					type="submit"
					className="w-full py-4 bg-error text-white font-bold rounded-xl shadow-sm hover:bg-errorDark transition-colors">
					Submit Penalty Request
				</button>
			</form>
		</div>
	);
}