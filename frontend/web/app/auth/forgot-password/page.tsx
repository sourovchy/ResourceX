"use client";

import React from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			{/* Background decoration */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary opacity-20 rounded-full blur-3xl"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-accent opacity-20 rounded-full blur-3xl"></div>
			</div>

			<div className="relative z-10 w-full max-w-md">
				<div className="bg-surface border border-borderLight p-8 rounded-2xl shadow-xl">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-textPrimary tracking-tight">
							Forgot Password
						</h1>
						<p className="text-textSecondary mt-2">
							Enter your email address and we'll send you a link to reset your
							password.
						</p>
					</div>

					<form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
						<div className="space-y-1.5">
							<label className="text-sm font-medium text-textPrimary">
								Email
							</label>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textTertiary">
									<Mail className="w-5 h-5" />
								</div>
								<input
									type="email"
									className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outlineVariant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-textPrimary"
									placeholder="Enter your email"
								/>
							</div>
						</div>

						<button
							type="submit"
							className="w-full mt-2 flex items-center justify-center gap-2 bg-primary hover:bg-primaryDark text-onPrimary py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg focus:ring-4 focus:ring-primaryLight outline-none">
							Send Reset Link
							{/* <ArrowRight className="w-4 h-4" /> */}
						</button>
					</form>

					<div className="mt-8 text-center">
						<Link
							href="/auth/login"
							className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primaryDark transition-colors">
							<ArrowLeft className="w-4 h-4" />
							Back to Sign In
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
