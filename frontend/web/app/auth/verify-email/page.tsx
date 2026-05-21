"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, MailCheck, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import { OTP_LAST_SEND_KEY, PENDING_EMAIL_KEY } from "@/lib/auth";

export default function EmailVerificationPage() {
	const router = useRouter();
	const [otp, setOtp] = useState("");
	const [email, setEmail] = useState("your student email");
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [resending, setResending] = useState(false);
	const [timer, setTimer] = useState(0);

	useEffect(() => {
		const pendingEmail = localStorage.getItem(PENDING_EMAIL_KEY);
		if (pendingEmail) {
			setEmail(pendingEmail);
		}

		const lastSend = localStorage.getItem(OTP_LAST_SEND_KEY);
		if (lastSend) {
			const diff = Math.floor((Date.now() - parseInt(lastSend)) / 1000);
			if (diff < 300) {
				setTimer(300 - diff);
			}
		}
	}, []);

	useEffect(() => {
		if (timer > 0) {
			const interval = setInterval(() => {
				setTimer((prev) => prev - 1);
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [timer]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (otp.length !== 6) {
			setError("Enter the 6-digit code sent to your email");
			return;
		}

		setError("");
		setMessage("");
		setLoading(true);

		try {
			// POST to /api/otp/verify
			const res = await api.post("/otp/verify", { email, otp });

			// OtpResponse has { success: boolean, message: string, timestamp: string }
			const data = res.data;

			if (!data.success) {
				throw new Error(data.message || "Invalid OTP");
			}

			localStorage.removeItem(PENDING_EMAIL_KEY);
			router.push("/auth/pending-approval");
		} catch (err: any) {
			const msg =
				err?.response?.data?.message || err?.message || "Verification failed";
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	const handleResend = async () => {
		if (timer > 0) return;

		setError("");
		setMessage("");
		setResending(true);

		try {
			// POST to /api/otp/request to resend
			const res = await api.post("/otp/request", { email });

			const data = res.data;

			if (!data.success) {
				throw new Error(data.message || "Failed to resend code");
			}

			setMessage("A new email code has been sent to " + email);
			setTimer(300);
			localStorage.setItem(OTP_LAST_SEND_KEY, Date.now().toString());
		} catch (err: any) {
			const msg =
				err?.response?.data?.message || err?.message || "Failed to resend code";
			setError(msg);

			// If the error is due to cooldown, try to extract time from message if the backend sent it
			// Or just set a default if the backend says we are in cooldown
			if (err?.response?.status === 429) {
				setTimer(300); // Default to 5 mins if we hit rate limit
			}
		} finally {
			setResending(false);
		}
	};

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary opacity-20 rounded-full blur-3xl"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-accent opacity-20 rounded-full blur-3xl"></div>
			</div>

			<div className="relative z-10 w-full max-w-md">
				<div className="bg-surface border border-borderLight p-8 rounded-2xl shadow-xl">
					<div className="text-center mb-8">
						<div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primaryLight border border-primary/20">
							<MailCheck className="w-7 h-7 text-primary" />
						</div>
						<h1 className="text-3xl font-bold text-textPrimary">
							Verify Email
						</h1>
						<p className="text-textSecondary mt-2">
							Enter the 6-digit code sent to{" "}
							<span className="font-semibold text-textPrimary">{email}</span>.
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
								Email Code
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
							{loading ? "Verifying..." : "Verify Email"}
							{!loading && <ArrowRight className="w-4 h-4" />}
						</button>
					</form>

					<div className="mt-6 flex items-center justify-between text-sm">
						<button
							type="button"
							onClick={handleResend}
							disabled={resending || timer > 0}
							className="inline-flex items-center gap-2 font-semibold text-primary hover:text-primaryDark disabled:opacity-70">
							<RefreshCw
								className={`w-4 h-4 ${resending ? "animate-spin" : ""}`}
							/>
							{resending
								? "Sending..."
								: timer > 0
									? `Resend in ${Math.floor(timer / 60)}:${(timer % 60)
											.toString()
											.padStart(2, "0")}`
									: "Resend code"}
						</button>

						<Link
							href="/auth/login"
							className="font-semibold text-textSecondary hover:text-primary">
							Back to login
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
