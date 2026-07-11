"use client";

import React from "react";
import Link from "next/link";
import { Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { LogoIcon } from "@/components/ui/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";

export default function PendingApprovalPage() {
	return (
		<div className="graph-grid relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
			<Reveal className="relative z-10 w-full max-w-md px-1 sm:px-0">
				<TiltCard maxTilt={1} className="glass-surface rounded-2xl p-5 text-center shadow-md sm:p-6 md:p-8">
					<div className="mb-6 flex justify-center">
						<LogoIcon size={40} />
					</div>

					<div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-warning/30 bg-warningLight sm:mb-6 sm:h-20 sm:w-20">
						<Clock className="h-8 w-8 text-warning sm:h-10 sm:w-10" />
					</div>

					<h1 className="text-2xl font-bold leading-tight text-textPrimary sm:text-3xl">
						Account <span className="text-gradient-brand italic">Pending.</span>
					</h1>

					<div className="mt-5 space-y-3 sm:space-y-4 text-left">
						<div className="flex items-start gap-3 rounded-xl border border-success/30 bg-successLight/40 p-3 sm:p-4">
							<CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
							<div className="min-w-0">
								<p className="text-sm font-bold text-successDark">Email Verified</p>
								<p className="mt-0.5 text-xs text-textSecondary">
									Your email has been successfully verified.
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3 rounded-xl border border-outlineVariant/30 bg-surfaceVariant/50 p-3 sm:p-4">
							<Clock className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
							<div className="min-w-0">
								<p className="text-sm font-bold text-textPrimary">Admin Approval</p>
								<p className="mt-0.5 text-xs text-textSecondary">
									An administrator is reviewing your registration details and ID card. This usually takes 24-48 hours.
								</p>
							</div>
						</div>
					</div>

					<p className="mt-6 text-sm leading-relaxed text-textSecondary sm:mt-8">
						Once approved, you will be able to log in to your account.
					</p>

					<div className="mt-6 sm:mt-8">
						<Link
							href="/auth/login"
							className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold italic text-onPrimary shadow-sm transition-colors duration-300 hover:bg-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto">
							Return to Login
							<ArrowRight className="h-4 w-4" />
						</Link>
					</div>
				</TiltCard>
			</Reveal>
		</div>
	);
}
