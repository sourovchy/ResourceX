"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function DepositTrackerPage() {
	return (
		<div className="mx-auto max-w-4xl space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0">
			<Link
				href="/borrow"
				className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary transition-colors hover:text-primary">
				<ArrowLeft className="h-4 w-4" />
				Back to Borrow
			</Link>

			<div className="space-y-1">
				<h1 className="text-xl font-extrabold text-textPrimary sm:text-2xl">
					Deposit Tracker
				</h1>
				<p className="text-sm text-textSecondary">
					Track deposits held for your active rentals.
				</p>
			</div>

			<div className="flex flex-col items-center justify-center rounded-2xl border border-borderLight bg-surface px-6 py-16 text-center shadow-sm sm:py-20">
				<div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primaryLight">
					<Shield className="h-10 w-10 text-primary opacity-60" />
				</div>
				<h2 className="text-lg font-bold text-textPrimary sm:text-xl">
					Deposit tracking coming soon
				</h2>
				<p className="mx-auto mt-2 max-w-sm text-sm text-textSecondary sm:text-base">
					We&apos;re building deposit tracking for your rentals. Check back soon.
				</p>
			</div>
		</div>
	);
}
