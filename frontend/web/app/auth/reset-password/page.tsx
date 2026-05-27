"use client";

import React, { useState, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";
import { validatePasswordChecks, isPasswordStrong } from "@/lib/validation";

function ResetPasswordForm() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const token = searchParams.get("token");

	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const passwordChecks = useMemo(() => validatePasswordChecks(newPassword), [newPassword]);
	const passwordIsStrong = useMemo(() => isPasswordStrong(newPassword), [newPassword]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!token) {
			setError("Invalid or missing reset token.");
			return;
		}

		if (newPassword !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		if (!passwordIsStrong) {
			setError("Please ensure your password meets all requirements.");
			return;
		}

		setLoading(true);
		try {
			await api.post("/auth/reset-password", { token, newPassword });
			setSuccess(true);
			setTimeout(() => {
				router.push("/auth/login");
			}, 3000);
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to reset password. The link might have expired.");
		} finally {
			setLoading(false);
		}
	};

	if (success) {
		return (
			<div className="space-y-4 text-center">
				<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success sm:h-16 sm:w-16">
					<svg className="h-7 w-7 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
					</svg>
				</div>
				<h2 className="text-xl font-bold leading-tight text-textPrimary sm:text-2xl">Password Reset Successful!</h2>
				<p className="text-sm text-textSecondary sm:text-base">You will be redirected to the login page shortly.</p>
				<Link href="/auth/login" className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 font-bold text-onPrimary sm:px-6">
					Go to Login
				</Link>
			</div>
		);
	}

	return (
		<form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
			{error && (
				<div className="rounded-xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700">
					{error}
				</div>
			)}
			<div className="space-y-1.5">
				<label className="block text-sm font-medium text-textPrimary">New Password</label>
				<div className="relative">
					<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-textTertiary">
						<Lock className="h-5 w-5" />
					</div>
					<input
						type={showPassword ? "text" : "password"}
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						className="w-full rounded-lg border border-outlineVariant bg-surface py-3 pl-10 pr-10 text-textPrimary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary"
						placeholder="New password"
						minLength={8}
						maxLength={128}
						required
					/>
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="absolute inset-y-0 right-0 flex items-center pr-3 text-textTertiary hover:text-textPrimary"
					>
						{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
					</button>
				</div>
				<div className="grid grid-cols-1 gap-1.5 pt-1 sm:grid-cols-2 sm:gap-2">
					{passwordChecks.map((check) => (
						<div
							key={check.label}
							className={`text-xs font-medium ${
								check.valid ? "text-success" : "text-textTertiary"
							}`}>
							{check.valid ? "OK" : "-"} {check.label}
						</div>
					))}
				</div>
			</div>

			<div className="space-y-1.5">
				<label className="block text-sm font-medium text-textPrimary">Confirm Password</label>
				<div className="relative">
					<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-textTertiary">
						<Lock className="h-5 w-5" />
					</div>
					<input
						type={showPassword ? "text" : "password"}
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						className="w-full rounded-lg border border-outlineVariant bg-surface py-3 pl-10 pr-4 text-textPrimary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary"
						placeholder="Confirm new password"
						minLength={8}
						maxLength={128}
						required
					/>
				</div>
			</div>

			<button
				type="submit"
				disabled={loading}
				className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-onPrimary shadow-md transition-colors hover:bg-primaryDark hover:shadow-lg focus:ring-4 focus:ring-primaryLight outline-none disabled:cursor-not-allowed disabled:opacity-70"
			>
				{loading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : "Reset Password"}
			</button>
		</form>
	);
}

export default function ResetPasswordPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4 py-8 sm:px-6 lg:px-8">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-primary opacity-20 blur-3xl sm:h-96 sm:w-96"></div>
				<div className="absolute bottom-[-10%] right-[-10%] h-72 w-72 rounded-full bg-accent opacity-20 blur-3xl sm:h-[30rem] sm:w-[30rem]"></div>
			</div>

			<div className="relative z-10 w-full max-w-md px-1 sm:px-0">
				<div className="rounded-2xl border border-borderLight bg-surface p-5 shadow-xl sm:p-6 md:p-8">
					<div className="mb-6 text-center sm:mb-8">
						<h1 className="text-2xl font-bold leading-tight tracking-tight text-textPrimary sm:text-3xl">
							Set New Password
						</h1>
						<p className="mt-2 text-sm text-textSecondary sm:text-base">
							Enter a new strong password below.
						</p>
					</div>

					<Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
						<ResetPasswordForm />
					</Suspense>

					<div className="mt-6 text-center sm:mt-8">
						
					</div>
				</div>
			</div>
		</div>
	);
}
