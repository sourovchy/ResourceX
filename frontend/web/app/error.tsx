"use client";

import React, { useEffect } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function GlobalErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to console
		console.error("[Global Error Exception]:", error);
	}, [error]);

	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12 text-center sm:px-6 lg:px-8">
			{/* Background gradient blur */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute left-[10%] top-[10%] h-72 w-72 rounded-full bg-error opacity-[0.06] blur-3xl sm:h-96 sm:w-96" />
				<div className="absolute bottom-[10%] right-[10%] h-72 w-72 rounded-full bg-accent opacity-[0.06] blur-3xl sm:h-[30rem] sm:w-[30rem]" />
			</div>

			<div className="relative z-10 w-full max-w-md">
				{/* Brand Logo Header */}
				<div className="mb-8 flex justify-center">
					<Logo size={44} />
				</div>

				{/* Error status card */}
				<div className="rounded-3xl border border-borderLight bg-surface p-6 shadow-xl sm:p-8">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
						<AlertTriangle className="h-6 w-6" />
					</div>

					<h1 className="text-2xl font-black tracking-tight text-textPrimary sm:text-3xl">
						Something went wrong
					</h1>
					<p className="mt-4 text-sm leading-relaxed text-textSecondary sm:text-base">
						An unexpected application error has occurred. Our team has been notified.
					</p>

					{error && error.message && (
						<div className="mt-4 rounded-xl border border-error/20 bg-errorLight px-4 py-3 text-left text-xs font-mono text-error break-all">
							{error.message}
						</div>
					)}

					<div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-center">
						<button
							onClick={reset}
							className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-onPrimary shadow-md transition hover:bg-primaryDark hover:shadow-lg focus:ring-4 focus:ring-primaryLight sm:w-auto"
						>
							<RefreshCw className="h-4 w-4" />
							Try Again
						</button>
						<a
							href="/dashboard"
							className="inline-flex w-full items-center justify-center rounded-xl border border-borderLight bg-surface px-5 py-3 text-sm font-semibold text-textPrimary transition hover:bg-surfaceVariant sm:w-auto"
						>
							Back to Dashboard
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
