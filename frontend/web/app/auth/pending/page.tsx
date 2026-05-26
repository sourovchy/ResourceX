"use client";

import React from "react";
import Link from "next/link";
import { Clock, ArrowLeft } from "lucide-react";

export default function PendingApprovalPage() {
	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
			{/* Background decoration */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-primary opacity-20 blur-3xl sm:h-96 sm:w-96" />
				<div className="absolute bottom-[-10%] right-[-10%] h-72 w-72 rounded-full bg-warning opacity-20 blur-3xl sm:h-[30rem] sm:w-[30rem]" />
			</div>

			<div className="relative z-10 w-full max-w-2xl px-1 sm:px-0">
				<div className="rounded-2xl border border-borderLight bg-surface p-5 text-center shadow-xl sm:p-6 md:p-8">
					{/* Icon */}
					<div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-warning/30 bg-warningLight sm:mb-6 sm:h-16 sm:w-16">
						<Clock className="h-6 w-6 text-warning sm:h-7 sm:w-7" />
					</div>

					{/* Title */}
					<h1 className="text-xl font-bold leading-tight text-textPrimary sm:text-3xl">
						Account Pending Approval
					</h1>

					{/* Description */}
					<p className="mt-3 text-sm leading-relaxed text-textSecondary sm:text-base">
						Your account has been created successfully, but it is currently under review.
						<br className="hidden sm:block" />
						Please wait until an admin approves your request.
					</p>

					{/* Info box */}
					<div className="mt-5 rounded-xl border border-border bg-surfaceVariant p-4 text-sm leading-relaxed text-textSecondary shadow-lg sm:mt-6 sm:p-5">
						This usually takes a few hours. You will be notified once your account is approved.
					</div>

					{/* Action */}
					<div className="mt-6 sm:mt-8">
						<Link
							href="/auth/login"
							className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-onPrimary shadow-md transition hover:bg-primaryDark sm:w-auto sm:px-6">
							<ArrowLeft className="h-4 w-4" />
							Back to Login
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
