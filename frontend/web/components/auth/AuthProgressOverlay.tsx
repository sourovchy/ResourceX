"use client";

import React from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

export interface AuthProgress {
	message: string;
	state: "loading" | "success";
}

/**
 * Full-screen progress overlay for multi-step auth flows (register → OTP,
 * password reset, etc.). Communicates each async step so the flow never feels
 * frozen, and blocks interaction with the form underneath while active.
 */
export default function AuthProgressOverlay({
	progress,
}: {
	progress: AuthProgress | null;
}) {
	if (!progress) return null;

	return (
		<div
			role="status"
			aria-live="polite"
			className="fixed inset-0 z-[60] flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm animate-in fade-in duration-200">
			<div className="flex min-w-[240px] flex-col items-center gap-4 rounded-2xl border border-borderLight bg-surface px-8 py-7 text-center shadow-2xl animate-in zoom-in-95 duration-200">
				{progress.state === "success" ? (
					<CheckCircle2 className="h-10 w-10 text-success animate-in zoom-in-50 duration-300" />
				) : (
					<Loader2 className="h-10 w-10 animate-spin text-primary" />
				)}
				<p
					key={progress.message}
					className="text-sm font-semibold text-textPrimary animate-in fade-in duration-200">
					{progress.message}
				</p>
			</div>
		</div>
	);
}
