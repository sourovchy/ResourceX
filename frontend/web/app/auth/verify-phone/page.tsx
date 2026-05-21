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
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-[-10%] right-[-10%] w-[32rem] h-[32rem] bg-accent opacity-20 rounded-full blur-3xl"></div>
				<div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-primary opacity-20 rounded-full blur-3xl"></div>
			</div>

			<div className="relative z-10 w-full max-w-md">
				<div className="bg-surface border border-borderLight p-8 rounded-2xl shadow-xl">
					<div className="text-center mb-8">
						<div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primaryLight border border-primary/20">
							<Smartphone className="w-7 h-7 text-primary" />
						</div>
						<h1 className="text-3xl font-bold text-textPrimary">
							Verify Phone
						</h1>
						<p className="text-textSecondary mt-2">
							Enter the code sent to {phone}.
						</p>
					</div>

					<form className="space-y-5" onSubmit={handleSubmit}>
						{error && (
							<div className="text-sm text-error bg-errorLight border border-error px-3 py-2 rounded-lg">
								{error}
							</div>
						)}

						{message && (
							<div className="text-sm text-success bg-successLight border border-success px-3 py-2 rounded-lg">
								{message}
							</div>
						)}

						<div className="space-y-1.5">
							<label className="text-sm font-medium text-textPrimary">
								Phone Code
							</label>
							<input
								type="text"
								inputMode="numeric"
								maxLength={6}
								value={otp}
								onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
								className="w-full px-4 py-3 bg-surface border border-outlineVariant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textPrimary text-center text-xl tracking-[0.35em]"
								placeholder="000000"
								required
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primaryDark disabled:opacity-70 disabled:cursor-not-allowed text-onPrimary py-3 rounded-lg font-medium transition shadow-md hover:shadow-lg focus:ring-4 focus:ring-primaryLight">
							{loading ? "Verifying..." : "Verify Phone"}
							{!loading && <ArrowRight className="w-4 h-4" />}
						</button>
					</form>

					<div className="mt-6 flex items-center justify-between text-sm">
						<button
							type="button"
							onClick={handleResend}
							disabled={resending}
							className="inline-flex items-center gap-2 font-semibold text-primary hover:text-primaryDark disabled:opacity-70">
							<RefreshCw className="w-4 h-4" />
							{resending ? "Sending..." : "Resend code"}
						</button>

						<Link
							href="/auth/verify-email"
							className="font-semibold text-textSecondary hover:text-primary">
							Back to email
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
