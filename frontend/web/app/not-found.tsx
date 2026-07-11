"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { TiltCard } from "@/components/ui/TiltCard";
import { Background } from "@/components/ui/Background";

export default function NotFoundPage() {
	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12 text-center sm:px-6 lg:px-8">
			<Background />
			<div className="relative z-10 w-full max-w-md">
				{/* Brand Logo Header */}
				<div className="mb-8 flex justify-center">
					<Logo size={44} />
				</div>

				{/* Error status card */}
				<TiltCard maxTilt={1} className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm transition hover:border-primary/20">
					<h1 className="text-3xl font-normal tracking-[-1px] text-textPrimary sm:text-4xl">
						Page not <span className="text-primary italic">found.</span>
					</h1>
					<p className="mt-4 text-sm leading-relaxed text-textSecondary">
						Sorry, we couldn&apos;t find the page you are looking for. It might have been moved, deleted, or the URL might be incorrect.
					</p>

					<div className="mt-8 flex justify-center">
						<Link
							href="/"
							className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full font-bold italic bg-primary text-onPrimary hover:bg-primaryDark focus-visible:ring-2 focus-visible:ring-primary/40 outline-none px-6 py-3 text-sm transition-colors duration-300"
						>
							<ArrowLeft className="h-4 w-4" />
							Back to home
						</Link>
					</div>
				</TiltCard>
			</div>
		</div>
	);
}
