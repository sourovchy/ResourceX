"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, RefreshCw, Smartphone } from "lucide-react";

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
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute right-[-10%] top-[-10%] h-72 w-72 rounded-full bg-accent opacity-20 blur-3xl sm:h-[32rem] sm:w-[32rem]"></div>
				<div className="absolute bottom-[-10%] left-[-10%] h-72 w-72 rounded-full bg-primary opacity-20 blur-3xl sm:h-[30rem] sm:w-[30rem]"></div>
			</div>

			<div className="relative z-10 w-full max-w-md px-1 sm:px-0">
				<div className="rounded-2xl border border-borderLight bg-surface p-5 shadow-xl sm:p-6 md:p-8">
					<div className="mb-6 text-center sm:mb-8">
						<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primaryLight sm:h-16 sm:w-16">
							<Smartphone className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
						</div>

						<h1 className="text-2xl font-bold leading-tight text-textPrimary sm:text-3xl">
							Verify Phone
						</h1>

						<p className="mt-2 text-sm text-textSecondary sm:text-base">
							Enter the code sent to {phone}.
						</p>
					</div>

					<form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
						{error && (
							<div className="rounded-lg border border-error bg-errorLight px-3 py-2 text-sm leading-relaxed text-error">
								{error}
							</div>
						)}

						{message && (
							<div className="rounded-lg border border-success bg-successLight px-3 py-2 text-sm leading-relaxed text-success">
								{message}
							</div>
						)}

						<div className="space-y-1.5">
							<label className="block text-sm font-medium text-textPrimary">
								Phone Code
							</label>

							<input
								type="text"
								inputMode="numeric"
								maxLength={6}
								value={otp}
								onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
								className="w-full rounded-lg border border-outlineVariant bg-surface px-4 py-3 text-center text-xl tracking-[0.35em] text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
								placeholder="000000"
								required
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-onPrimary shadow-md transition hover:bg-primaryDark hover:shadow-lg focus:ring-4 focus:ring-primaryLight disabled:cursor-not-allowed disabled:opacity-70">
							{loading ? "Verifying..." : "Verify Phone"}
							{!loading && <ArrowRight className="h-4 w-4" />}
						</button>
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
				</div>
			</div>
		</div>
	);
}
