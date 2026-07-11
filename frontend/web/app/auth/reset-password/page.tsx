"use client";

import React, { useState, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LogoIcon } from "@/components/ui/Logo";
import api from "@/lib/api";
import { validatePasswordChecks, isPasswordStrong } from "@/lib/validation";
import AuthProgressOverlay, { AuthProgress } from "@/components/auth/AuthProgressOverlay";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";

function ResetPasswordForm() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const token = searchParams.get("token");

	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [progress, setProgress] = useState<AuthProgress | null>(null);
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
			setProgress({ message: "Updating your password…", state: "loading" });
			await api.post("/auth/reset-password", { token, newPassword });
			setProgress(null);
			setSuccess(true);
			setTimeout(() => {
				router.push("/auth/login");
			}, 2500);
		} catch (err: any) {
			setProgress(null);
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
				<h2 className="text-xl font-bold leading-tight text-textPrimary sm:text-2xl">Password reset <span className="text-gradient-brand italic">complete.</span></h2>
				<p className="text-sm text-textSecondary sm:text-base">You will be redirected to the login page shortly.</p>
				<Link href="/auth/login" className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold italic text-onPrimary shadow-sm transition-colors duration-300 hover:bg-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
					Go to Login
				</Link>
			</div>
		);
	}

	return (
		<form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
			<AuthProgressOverlay progress={progress} />
			{error && (
				<div role="alert" className="rounded-xl border border-error/40 bg-errorLight px-4 py-3 text-sm font-medium leading-relaxed text-errorDark">
					{error}
				</div>
			)}
			<div className="space-y-1.5">
				<label htmlFor="rp-new" className="block text-[11px] font-bold uppercase tracking-[0.1em] text-primary">New Password <span className="text-error">*</span></label>
				<div className="relative">
					<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-textTertiary">
						<Lock className="h-5 w-5" />
					</div>
					<input
						id="rp-new"
						type={showPassword ? "text" : "password"}
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-10 text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-textTertiary"
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
				<label htmlFor="rp-confirm" className="block text-[11px] font-bold uppercase tracking-[0.1em] text-primary">Confirm Password <span className="text-error">*</span></label>
				<div className="relative">
					<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-textTertiary">
						<Lock className="h-5 w-5" />
					</div>
					<input
						id="rp-confirm"
						type={showPassword ? "text" : "password"}
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-textTertiary"
						placeholder="Confirm new password"
						minLength={8}
						maxLength={128}
						required
					/>
				</div>
			</div>

			<Button type="submit" loading={loading} fullWidth className="mt-2">
				{loading ? "Resetting…" : "Reset Password"}
			</Button>
		</form>
	);
}

export default function ResetPasswordPage() {
	return (
		<div className="graph-grid relative flex min-h-screen items-center justify-center bg-background px-4 py-8 sm:px-6 lg:px-8">
			<Reveal className="relative z-10 w-full max-w-md px-1 sm:px-0">
				<TiltCard maxTilt={1} className="glass-surface rounded-2xl p-5 shadow-md sm:p-6 md:p-8">
					<div className="mb-6 text-center sm:mb-8">
						<div className="mb-4 flex justify-center">
							<LogoIcon size={48} />
						</div>
						<h1 className="text-2xl font-bold leading-tight tracking-tight text-textPrimary sm:text-3xl">
							Set new <span className="text-gradient-brand italic">password.</span>
						</h1>
						<p className="mt-2 text-sm text-textSecondary">
							Enter a new strong password below.
						</p>
					</div>

					<Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
						<ResetPasswordForm />
					</Suspense>
				</TiltCard>
			</Reveal>
		</div>
	);
}
