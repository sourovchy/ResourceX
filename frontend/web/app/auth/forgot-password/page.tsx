"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { LogoIcon } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import AuthProgressOverlay, { AuthProgress } from "@/components/auth/AuthProgressOverlay";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { PageLoader } from "@/components/ui/PageLoader";

export default function ForgotPasswordPage() {
	const router = useRouter();
	const { user, loading: authLoading } = useAuth();

	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [progress, setProgress] = useState<AuthProgress | null>(null);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		if (!authLoading && user) {
			router.replace("/dashboard");
		}
	}, [authLoading, user, router]);

	if (authLoading || user) return <PageLoader message="Verifying session..." fullScreen />;

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
			setProgress({ message: "Sending reset code…", state: "loading" });
			const res = await api.post("/auth/forgot-password", {
				email: email.trim(),
			});
			setProgress({ message: "Reset code sent", state: "success" });
			await new Promise((r) => setTimeout(r, 850));
			setProgress(null);
			setMessage(
				res.data?.message || "Password reset email sent. Please check your inbox.",
			);
		} catch (err: any) {
			setProgress(null);
			setError(
				err.response?.data?.message || "Failed to send reset link. Please try again.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="graph-grid relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
			<AuthProgressOverlay progress={progress} />

			<Reveal className="relative z-10 w-full max-w-md px-1 sm:px-0">
				<TiltCard className="glass-surface rounded-2xl p-5 shadow-md sm:p-6 md:p-8">
					<div className="mb-6 text-center sm:mb-8">
						<div className="mb-4 flex justify-center">
							<LogoIcon size={48} />
						</div>

						<h1 className="text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
							Forgot <span className="text-gradient-brand italic">password.</span>
						</h1>

						<p className="mt-2 text-sm text-textSecondary">
							Enter your email and we&apos;ll send a code to reset your password.
						</p>
					</div>

					<form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
						{error && (
							<div role="alert" className="rounded-xl border border-error/40 bg-errorLight px-3 py-2 text-sm font-medium text-errorDark">
								{error}
							</div>
						)}

						{message && (
							<div role="status" className="rounded-xl border border-success/40 bg-successLight px-3 py-2 text-sm font-medium text-successDark">
								{message}
							</div>
						)}

						<div className="space-y-1.5">
							<label htmlFor="fp-email" className="block text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
								Email <span className="text-error">*</span>
							</label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textTertiary" />
								<input
									id="fp-email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-textTertiary"
									placeholder="Enter your email"
									maxLength={100}
									required
								/>
							</div>
						</div>

						<Button type="submit" loading={loading} fullWidth className="mt-2">
							{loading ? "Sending…" : "Send Reset Link"}
						</Button>
					</form>

					<p className="mt-6 text-center text-sm text-textSecondary sm:mt-8">
						Remembered it?{" "}
						<Link href="/auth/login" className="font-semibold text-primary transition-colors hover:text-primaryDark">
							Back to login
						</Link>
					</p>
				</TiltCard>
			</Reveal>
		</div>
	);
}