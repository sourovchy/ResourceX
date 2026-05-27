"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setMessage("");

		if (!email.trim() || !email.includes("@")) {
			setError("Please enter a valid email address.");
			return;
		}

		setLoading(true);
		try {
			const res = await api.post("/auth/forgot-password", {
				email: email.trim(),
			});
			setMessage(
				res.data?.message || "Password reset email sent. Please check your inbox.",
			);
		} catch (err: any) {
			setError(
				err.response?.data?.message || "Failed to send reset link. Please try again.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-primary opacity-20 blur-3xl sm:h-96 sm:w-96" />
				<div className="absolute bottom-[-10%] right-[-10%] h-72 w-72 rounded-full bg-accent opacity-20 blur-3xl sm:h-[30rem] sm:w-[30rem]" />
			</div>

			<div className="relative z-10 w-full max-w-md px-1 sm:px-0">
				<div className="rounded-2xl border border-borderLight bg-surface p-5 shadow-xl sm:p-6 md:p-8">
					<div className="mb-6 text-center sm:mb-8">
						<div className="mb-3 flex justify-center">
							<Mail className="h-10 w-10 text-primary" />
						</div>

						<h1 className="text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
							Forgot Password
						</h1>

						<p className="mt-2 text-sm text-textSecondary sm:text-base">
							Enter your email address and we&apos;ll send you a link to reset your password.
						</p>
					</div>

					<form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
						{error && (
							<div className="rounded-lg border border-error bg-errorLight px-3 py-2 text-sm text-error">
								{error}
							</div>
						)}

						{message && (
							<div className="rounded-lg border border-success bg-successLight px-3 py-2 text-sm text-successDark">
								{message}
							</div>
						)}

						<div className="space-y-1.5">
							<label className="block text-sm font-medium text-textPrimary">
								Email
							</label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textTertiary" />
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full rounded-lg border border-outlineVariant bg-surface py-3 pl-10 pr-4 text-textPrimary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary"
									placeholder="Enter your email"
									maxLength={100}
									required
								/>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-onPrimary shadow-md transition-colors hover:bg-primaryDark hover:shadow-lg focus:ring-4 focus:ring-primaryLight outline-none disabled:cursor-not-allowed disabled:opacity-70">
							{loading ? (
								<Loader2 className="h-5 w-5 animate-spin" />
							) : (
								"Send Reset Link"
							)}
						</button>
					</form>

					<div className="mt-6 text-center sm:mt-8">
						
					</div>
				</div>
			</div>
		</div>
	);
}