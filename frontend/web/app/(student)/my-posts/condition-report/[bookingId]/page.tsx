"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
	ArrowLeft,
	CheckCircle2,
	UploadCloud,
	ClipboardCheck,
} from "lucide-react";

export default function ConditionReportPage() {
	const params = useParams();
	const searchParams = useSearchParams();

	const bookingId = params?.bookingId as string;

	const phaseRaw = searchParams.get("phase");
	const phase =
		phaseRaw === "BEFORE" ? "Pre-handover" : "Post-return";

	const [submitted, setSubmitted] = useState(false);
	const [images, setImages] = useState<File[]>([]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// important for backend
		console.log({
			bookingId,
			phase: phaseRaw,
			images,
		});

		setSubmitted(true);
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setImages(Array.from(e.target.files));
		}
	};

	if (submitted) {
		return (
			<div className="max-w-xl mx-auto py-20 text-center space-y-6">
				<div className="w-20 h-20 bg-successLight text-success rounded-full flex items-center justify-center mx-auto mb-4">
					<CheckCircle2 className="w-10 h-10" />
				</div>
				<h1 className="text-3xl font-extrabold text-textPrimary">
					Report Submitted!
				</h1>
				<p className="text-textSecondary">
					The {phase.toLowerCase()} condition report has been securely saved.
				</p>
				<Link
					href="/my-posts/active-rentals"
					className="inline-block mt-4 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-primaryDark transition-colors">
					Back to Active Rentals
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
					<ClipboardCheck className="w-6 h-6 text-primary" /> Condition Report
				</h1>
				<p className="text-sm font-bold text-primary mt-1 uppercase tracking-wider">
					{phase} Phase
				</p>
			</div>

			<form
				onSubmit={handleSubmit}
				className="bg-surface border border-borderLight p-6 md:p-8 rounded-2xl shadow-sm space-y-6">

				<div className="space-y-3">
					<label className="text-sm font-bold text-textPrimary">
						Checklist
					</label>
					<div className="space-y-2">
						{[
							"Item powers on properly",
							"No visible scratches / dents",
							"All accessories included",
							"Clean and functioning",
						].map((ch) => (
							<label
								key={ch}
								className="flex items-center gap-3 p-3 border border-borderLight rounded-xl cursor-pointer hover:bg-surfaceVariant transition-colors">
								<input type="checkbox" className="w-5 h-5 accent-primary" />
								<span className="text-sm text-textPrimary font-medium">
									{ch}
								</span>
							</label>
						))}
					</div>
				</div>

				<div className="space-y-3">
					<label className="text-sm font-bold text-textPrimary">
						Photo Proof
					</label>

					<label className="border-2 border-dashed border-borderLight bg-surfaceVariant rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-primary transition-colors cursor-pointer">
						<UploadCloud className="w-8 h-8 text-primary mb-2" />
						<p className="text-sm font-bold text-textPrimary">
							Upload Photos
						</p>

						<input
							type="file"
							multiple
							className="hidden"
							onChange={handleFileChange}
						/>
					</label>

					{images.length > 0 && (
						<p className="text-xs text-textSecondary">
							{images.length} file(s) selected
						</p>
					)}
				</div>

				<div className="space-y-3">
					<label className="text-sm font-bold text-textPrimary">
						Additional Notes
					</label>
					<textarea
						rows={4}
						placeholder="Note any specific observations..."
						className="w-full px-4 py-3 bg-surfaceVariant border border-borderLight rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"></textarea>
				</div>

				<button
					type="submit"
					className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-primaryDark transition-colors">
					Save Report
				</button>
			</form>
		</div>
	);
}