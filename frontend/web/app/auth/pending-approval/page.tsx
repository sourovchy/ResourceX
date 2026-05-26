"use client";

import React from "react";
import Link from "next/link";
import { Clock, CheckCircle2, ArrowRight } from "lucide-react";

export default function PendingApprovalPage() {
	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute bottom-[-10%] left-[-10%] h-72 w-72 rounded-full bg-primary opacity-20 blur-3xl sm:h-[30rem] sm:w-[30rem]" />
				<div className="absolute right-[-10%] top-[-10%] h-72 w-72 rounded-full bg-accent opacity-20 blur-3xl sm:h-[32rem] sm:w-[32rem]" />
			</div>

			<div className="relative z-10 w-full max-w-md px-1 sm:px-0">
				<div className="rounded-2xl border border-borderLight bg-surface p-5 text-center shadow-xl sm:p-6 md:p-8">
					<div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-warning/20 bg-warningLight sm:mb-6 sm:h-20 sm:w-20">
						<Clock className="h-8 w-8 text-warning sm:h-10 sm:w-10" />
					</div>

					<h1 className="text-xl font-bold leading-tight text-textPrimary sm:text-3xl">
						Account Pending
					</h1>

					<div className="mt-4 space-y-3 sm:space-y-4 text-left">
						<div className="flex items-start gap-3 rounded-xl border border-success/10 bg-successLight/30 p-3 sm:p-4">
							<CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
							<div className="min-w-0">
								<p className="text-sm font-bold text-success">Email Verified</p>
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
							className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-onPrimary shadow-md transition hover:bg-primaryDark hover:shadow-lg focus:ring-4 focus:ring-primaryLight sm:w-auto sm:px-6">
							Return to Login
							<ArrowRight className="h-4 w-4" />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
