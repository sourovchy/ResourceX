"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function NotFoundPage() {
	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12 text-center sm:px-6 lg:px-8">
			{/* Background gradient blur */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute left-[10%] top-[10%] h-72 w-72 rounded-full bg-primary opacity-[0.08] blur-3xl sm:h-96 sm:w-96" />
				<div className="absolute bottom-[10%] right-[10%] h-72 w-72 rounded-full bg-accent opacity-[0.08] blur-3xl sm:h-[30rem] sm:w-[30rem]" />
			</div>

			<div className="relative z-10 w-full max-w-md">
				{/* Brand Logo Header */}
				<div className="mb-8 flex justify-center">
					<Logo size={44} />
				</div>

				{/* Error status card */}
				<div className="rounded-3xl border border-borderLight bg-surface p-6 shadow-xl sm:p-8">
					<div className="text-sm font-black uppercase tracking-widest text-primary mb-2">
						404 Error
					</div>
					<h1 className="text-3xl font-black tracking-tight text-textPrimary sm:text-4xl">
						Page not found
					</h1>
					<p className="mt-4 text-sm leading-relaxed text-textSecondary sm:text-base">
						Sorry, we couldn&apos;t find the page you are looking for. It might have been moved, deleted, or the URL might be incorrect.
					</p>

					<div className="mt-8">
						<Link
							href="/dashboard"
							className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-onPrimary shadow-md transition hover:bg-primaryDark hover:shadow-lg focus:ring-4 focus:ring-primaryLight sm:w-auto"
						>
							<ArrowLeft className="h-4 w-4" />
							Back to Dashboard
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
