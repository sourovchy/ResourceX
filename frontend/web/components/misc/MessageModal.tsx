"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, MessageSquare, X } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { extractErrorMessage } from "@/lib/errorUtils";
import { useDialog } from "@/hooks/useDialog";

interface MessageModalProps {
	isOpen: boolean;
	targetUserId: number;
	targetName: string;
	bookingId?: number;
	onClose: () => void;
}

export default function MessageModal({
	isOpen,
	targetUserId,
	targetName,
	bookingId,
	onClose,
}: MessageModalProps) {
	const router = useRouter();
	const [message, setMessage] = useState("");
	const [sending, setSending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSend = async () => {
		if (!message.trim()) return;
		setSending(true);
		setError(null);
		try {
			await api.post("/conversations", {
				otherUserId: targetUserId,
				bookingId: bookingId ?? null,
				disputeId: null,
				initialMessage: message.trim(),
			});
			onClose();
			setMessage("");
			router.push("/inbox");
		} catch (err) {
			setError(extractErrorMessage(err));
		} finally {
			setSending(false);
		}
	};

	const handleClose = () => {
		if (sending) return;
		setMessage("");
		setError(null);
		onClose();
	};

	const dialogRef = useDialog({ open: isOpen, onClose: handleClose, closeOnEsc: !sending });
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	if (!isOpen || !mounted) return null;

	return createPortal(
		<div className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
				onClick={handleClose}
			/>

			{/* Modal */}
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				tabIndex={-1}
				className="relative z-10 flex max-h-[90dvh] w-full max-w-md flex-col overflow-y-auto rounded-2xl border border-borderLight bg-surface p-5 shadow-xl outline-none animate-in fade-in zoom-in-95 duration-200 sm:p-6">
				{/* Header */}
				<div className="mb-4 flex items-center justify-between gap-3">
					<div className="flex items-center gap-2">
						<MessageSquare className="h-5 w-5 text-primary" />
						<h2 className="font-bold text-textPrimary">
							Message{" "}
							<span className="text-primary">{targetName}</span>
						</h2>
					</div>
					<button
						onClick={handleClose}
						disabled={sending}
						className="rounded-lg p-1.5 text-textSecondary transition-colors hover:bg-surfaceVariant disabled:opacity-50"
						aria-label="Close">
						<X className="h-5 w-5" />
					</button>
				</div>

				{error && (
					<div className="mb-4 rounded-xl border border-error/30 bg-errorLight px-4 py-3 text-sm text-errorDark">
						{error}
					</div>
				)}

				<textarea
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					rows={4}
					maxLength={4000}
					placeholder={`Write your first message to ${targetName}…`}
					className="mb-1 w-full resize-none rounded-xl border border-borderLight bg-surfaceVariant px-4 py-3 text-sm text-textPrimary placeholder-textSecondary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
					autoFocus
				/>
				<p className="mb-4 text-right text-xs text-textSecondary">
					{message.length}/4000
				</p>

				<div className="flex gap-3">
					<button
						onClick={handleClose}
						disabled={sending}
						className="flex-1 rounded-xl border border-borderLight px-4 py-2.5 text-sm font-semibold text-textSecondary transition-colors hover:bg-surfaceVariant disabled:opacity-50">
						Cancel
					</button>
					<button
						onClick={handleSend}
						disabled={sending || !message.trim()}
						className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-50">
						{sending ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Sending…
							</>
						) : (
							<>
								<MessageSquare className="h-4 w-4" />
								Send Message
							</>
						)}
					</button>
				</div>
			</div>
		</div>,
		document.body,
	);
}
