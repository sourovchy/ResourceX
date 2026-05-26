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
			<div className="mx-auto max-w-xl space-y-5 px-3 py-16 text-center sm:px-4 sm:py-20">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-successLight text-success sm:h-20 sm:w-20">
					<CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10" />
				</div>
				<h1 className="text-2xl font-extrabold text-textPrimary sm:text-3xl">
					Report Submitted!
				</h1>
				<p className="text-sm text-textSecondary sm:text-base">
					The {phase.toLowerCase()} condition report has been securely saved.
				</p>
				<Link
					href="/my-posts/active-rentals"
					className="mt-4 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primaryDark sm:px-6">
					Back to Active Rentals
				</Link>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-2xl space-y-5 px-3 pb-16 sm:px-4 sm:pb-20 lg:px-0">
			<Link
				href="/my-posts/active-rentals"
				className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary transition-colors hover:text-primary">
				<ArrowLeft className="h-4 w-4" /> Back to Rentals
			</Link>

			<div>
				<h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
					<ClipboardCheck className="h-5 w-5 text-primary sm:h-6 sm:w-6" /> Condition Report
				</h1>
				<p className="mt-1 text-xs font-bold uppercase tracking-wider text-primary sm:text-sm">
					{phase} Phase
				</p>
			</div>

			<form
				onSubmit={handleSubmit}
				className="space-y-5 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6 md:p-8">

				<div className="space-y-3 sm:space-y-4">
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
								className="flex cursor-pointer items-center gap-3 rounded-xl border border-borderLight p-3 transition-colors hover:bg-surfaceVariant">
								<input type="checkbox" className="h-5 w-5 accent-primary" />
								<span className="text-sm font-medium text-textPrimary">
									{ch}
								</span>
							</label>
						))}
					</div>
				</div>

				<div className="space-y-3 sm:space-y-4">
					<label className="text-sm font-bold text-textPrimary">
						Photo Proof
					</label>

					<label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-borderLight bg-surfaceVariant p-5 text-center transition-colors hover:border-primary sm:p-6">
						<UploadCloud className="mb-2 h-7 w-7 text-primary sm:h-8 sm:w-8" />
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

				<div className="space-y-3 sm:space-y-4">
					<label className="text-sm font-bold text-textPrimary">
						Additional Notes
					</label>
					<textarea
						rows={4}
						placeholder="Note any specific observations..."
						className="w-full resize-none rounded-xl border border-borderLight bg-surfaceVariant px-4 py-3 text-sm text-textPrimary transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
					></textarea>
				</div>

				<button
					type="submit"
					className="w-full rounded-xl bg-primary py-3.5 font-bold text-white shadow-sm transition-colors hover:bg-primaryDark sm:py-4">
					Save Report
				</button>
			</form>
		</div>
	);
}