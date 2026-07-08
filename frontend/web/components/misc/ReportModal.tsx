"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Loader2, X } from "lucide-react";
import api from "@/lib/api";
import { extractErrorMessage } from "@/lib/errorUtils";
import { useToast } from "@/context/ToastContext";
import { useDialog } from "@/hooks/useDialog";
import { TiltCard } from "@/components/ui/TiltCard";

interface ReportModalProps {
	isOpen: boolean;
	entityType: string;
	entityId: number;
	onClose: () => void;
}

const REPORT_REASONS = [
	{ value: "INAPPROPRIATE_CONTENT", label: "Inappropriate Content / Language", desc: "Contains offensive text, images, or general toxicity." },
	{ value: "FRAUD_OR_SCAM", label: "Fraud or Scam", desc: "Fake items, duplicate accounts, or phishing attempts." },
	{ value: "MISLEADING_INFO", label: "Misleading Information", desc: "Incorrect descriptions, condition, or pricing." },
	{ value: "STOLEN_PROPERTY", label: "Stolen Property", desc: "The item belongs to someone else or has been flagged as stolen." },
	{ value: "PROHIBITED_ITEM", label: "Prohibited Item / Dangerous Goods", desc: "Weapons, chemicals, illegal substances, or restricted materials." },
	{ value: "OTHER", label: "Other Reasons", desc: "Any other issues not listed above." },
];

export default function ReportModal({
	isOpen,
	entityType,
	entityId,
	onClose,
}: ReportModalProps) {
	const { toast } = useToast();
	const [selectedReason, setSelectedReason] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async () => {
		if (!selectedReason) return;
		setSubmitting(true);
		setError(null);
		try {
			await api.post("/reports", {
				entityType,
				entityId,
				reason: selectedReason,
			});
			toast("Report submitted successfully for moderation review.");
			handleClose();
		} catch (err) {
			setError(extractErrorMessage(err));
		} finally {
			setSubmitting(false);
		}
	};

	const handleClose = () => {
		if (submitting) return;
		setSelectedReason("");
		setError(null);
		onClose();
	};

	const dialogRef = useDialog({ open: isOpen, onClose: handleClose, closeOnEsc: !submitting });
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	if (!isOpen || !mounted) return null;

	return createPortal(
		<div className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/35 backdrop-blur-md animate-in fade-in duration-200"
				onClick={handleClose}
			/>

			{/* Modal Box */}
			<TiltCard
				ref={dialogRef as any}
				role="dialog"
				aria-modal="true"
				tabIndex={-1}
				maxTilt={2}
				hoverScale={1.01}
				glare={false}
				className="relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-borderLight/60 bg-surface/90 shadow-2xl backdrop-blur-md outline-none animate-in fade-in zoom-in-95 duration-200"
			>
				{/* Header */}
				<div className="flex items-center justify-between border-b border-borderLight p-4 sm:p-5">
					<div className="flex items-center gap-2 text-error">
						<AlertTriangle className="h-5 w-5" />
						<h2 className="font-bold text-textPrimary">Report Listing</h2>
					</div>
					<button
						onClick={handleClose}
						disabled={submitting}
						className="rounded-lg p-1.5 text-textSecondary transition-colors hover:bg-surfaceVariant disabled:opacity-50"
						aria-label="Close"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Body Content */}
				<div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
					<p className="text-xs text-textSecondary">
						Help us keep our community safe. Please select the primary reason you are flagging this listing for investigation.
					</p>

					{error && (
						<div className="rounded-xl border border-error/30 bg-errorLight px-4 py-3 text-xs text-errorDark">
							{error}
						</div>
					)}

					<div className="space-y-2.5">
						{REPORT_REASONS.map((opt) => {
							const isSelected = selectedReason === opt.value;
							return (
								<label
									key={opt.value}
									className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all hover:bg-surfaceVariant/50
										${isSelected ? "border-error bg-errorLight/10 ring-1 ring-error/20" : "border-borderLight bg-card"}
									`}
								>
									<input
										type="radio"
										name="report-reason"
										value={opt.value}
										checked={isSelected}
										onChange={() => setSelectedReason(opt.value)}
										disabled={submitting}
										className="mt-1 h-4 w-4 shrink-0 text-error focus:ring-error border-borderLight"
									/>
									<div>
										<div className={`text-xs font-bold ${isSelected ? "text-errorDark" : "text-textPrimary"}`}>
											{opt.label}
										</div>
										<div className="text-[11px] text-textTertiary mt-0.5 leading-snug">
											{opt.desc}
										</div>
									</div>
								</label>
							);
						})}
					</div>
				</div>

				{/* Footer Actions */}
				<div className="flex border-t border-borderLight p-4 sm:p-5 gap-3">
					<button
						onClick={handleClose}
						disabled={submitting}
						className="flex-1 rounded-xl border border-borderLight px-4 py-2.5 text-sm font-semibold text-textSecondary transition-colors hover:bg-surfaceVariant disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						onClick={handleSubmit}
						disabled={submitting || !selectedReason}
						className="flex-[1.5] flex items-center justify-center gap-2 rounded-xl bg-error px-4 py-2.5 text-sm font-bold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
					>
						{submitting ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Submitting…
							</>
						) : (
							<>
								<AlertTriangle className="h-4 w-4" />
								Submit Report
							</>
						)}
					</button>
				</div>
			</TiltCard>
		</div>,
		document.body,
	);
}
