"use client";

import React from "react";
import Link from "next/link";
import { Clock, CheckCircle2, ArrowRight } from "lucide-react";

export default function PendingApprovalPage() {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-[-10%] right-[-10%] w-[32rem] h-[32rem] bg-accent opacity-20 rounded-full blur-3xl"></div>
				<div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-primary opacity-20 rounded-full blur-3xl"></div>
			</div>

			<div className="relative z-10 w-full max-w-md">
				<div className="bg-surface border border-borderLight p-8 rounded-2xl shadow-xl text-center">
					<div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-warningLight border border-warning/20">
						<Clock className="w-10 h-10 text-warning" />
					</div>

					<h1 className="text-3xl font-bold text-textPrimary">
						Account Pending
					</h1>

					<div className="mt-4 space-y-4">
						<div className="flex items-start gap-3 text-left bg-successLight/30 p-4 rounded-xl border border-success/10">
							<CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
							<div>
								<p className="font-bold text-success text-sm">Email Verified</p>
								<p className="text-xs text-textSecondary mt-0.5">
									Your email has been successfully verified.
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3 text-left bg-surfaceVariant/50 p-4 rounded-xl border border-outlineVariant/30">
							<Clock className="w-5 h-5 text-warning shrink-0 mt-0.5" />
							<div>
								<p className="font-bold text-textPrimary text-sm">
									Admin Approval
								</p>
								<p className="text-xs text-textSecondary mt-0.5">
									An administrator is reviewing your registration details and ID
									card. This usually takes 24-48 hours.
								</p>
							</div>
						</div>
					</div>

					<p className="text-textSecondary mt-8 text-sm">
						Once approved, you will be able to log in to your account.
					</p>

					<div className="mt-8 space-y-3">
						<Link
							href="/auth/login"
							className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primaryDark text-onPrimary py-3 rounded-lg font-medium transition shadow-md hover:shadow-lg focus:ring-4 focus:ring-primaryLight">
							Return to Login
							<ArrowRight className="w-4 h-4" />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
