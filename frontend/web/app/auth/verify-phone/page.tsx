"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, RefreshCw } from "lucide-react";
import { LogoIcon } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";

export default function PhoneVerificationPage() {
	const router = useRouter();
	const [otp, setOtp] = useState("");
	const [phone, setPhone] = useState("your mobile number");
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [resending, setResending] = useState(false);

	useEffect(() => {
		setError("Phone verification is not enabled for this ResourceX backend yet.");
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (otp.length !== 6) {
			setError("Enter the 6-digit code sent to your phone");
			return;
		}

		setError("");
		setMessage("");
		setLoading(true);

		setError("Phone verification is not enabled. Please continue with email approval.");
		setLoading(false);
		router.push("/auth/pending-approval");
	};

	const handleResend = () => {
		setError("");
		setMessage("");
		setResending(true);

		setResending(false);
		setMessage("Phone OTP is not configured for this backend.");
	};

	return (
		<div className="graph-grid relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
			<Reveal className="relative z-10 w-full max-w-md px-1 sm:px-0">
				<TiltCard className="glass-surface rounded-2xl p-5 shadow-md sm:p-6 md:p-8">
					<div className="mb-6 text-center sm:mb-8">
						<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primaryLight sm:h-16 sm:w-16">
							<LogoIcon size={32} />
						</div>

						<h1 className="text-2xl font-bold leading-tight text-textPrimary sm:text-3xl">
							Verify <span className="text-gradient-brand italic">phone.</span>
						</h1>

						<p className="mt-2 text-sm text-textSecondary">
							Enter the code sent to {phone}.
						</p>
					</div>

					<form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
						{error && (
							<div role="alert" className="rounded-xl border border-error/40 bg-errorLight px-3 py-2 text-sm font-medium leading-relaxed text-errorDark">
								{error}
							</div>
						)}

						{message && (
							<div role="status" className="rounded-xl border border-success/40 bg-successLight px-3 py-2 text-sm font-medium leading-relaxed text-successDark">
								{message}
							</div>
						)}

						<div className="space-y-1.5">
							<label htmlFor="vp-otp" className="block text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
								Phone Code <span className="text-error">*</span>
							</label>

							<input
								id="vp-otp"
								type="text"
								inputMode="numeric"
								maxLength={6}
								value={otp}
								onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
								className="w-full rounded-xl border border-border bg-card px-4 py-3 text-center text-xl tracking-[0.35em] text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-textTertiary"
								placeholder="000000"
								required
							/>
						</div>

						<Button type="submit" loading={loading} fullWidth rightIcon={<ArrowRight className="h-4 w-4" />} className="mt-2">
							{loading ? "Verifying…" : "Verify Phone"}
						</Button>
					</form>

					<div className="mt-6 flex flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">
						<button
							type="button"
							onClick={handleResend}
							disabled={resending}
							className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primaryDark disabled:cursor-not-allowed disabled:opacity-70">
							<RefreshCw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} />
							{resending ? "Sending..." : "Resend code"}
						</button>

						<Link
							href="/auth/verify-email"
							className="font-semibold text-textSecondary transition-colors hover:text-primary">
							Back to email
						</Link>
					</div>
				</TiltCard>
			</Reveal>
		</div>
	);
}
