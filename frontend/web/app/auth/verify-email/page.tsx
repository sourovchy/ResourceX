"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, MailCheck, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import {
	PENDING_EMAIL_KEY,
	getOtpLastSendTimestamp,
	setOtpLastSendTimestamp,
	clearOtpLastSendTimestamp,
} from "@/lib/auth";

const RESEND_COOLDOWN_SECONDS = 180;
const MAX_RESEND_ATTEMPTS = 3;

export default function EmailVerificationPage() {
	const router = useRouter();

	const [otp, setOtp] = useState("");
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [resending, setResending] = useState(false);
	const [timer, setTimer] = useState(0);
	const [cooldownAnchor, setCooldownAnchor] = useState<number | null>(null);
	const [resendPermaDisabled, setResendPermaDisabled] = useState(false);

	const displayedEmail = email || "your student email";

	useEffect(() => {
		if (typeof window === "undefined") return;

		const pendingEmail = localStorage.getItem(PENDING_EMAIL_KEY);
		if (pendingEmail) {
			setEmail(pendingEmail);
		}

		const permaDisabled = localStorage.getItem("otp_resend_perma_disabled");
		if (permaDisabled === "true") {
			setResendPermaDisabled(true);
			setError(
				"Maximum resend attempts exceeded. Please contact support or start a new verification.",
			);
		}

		const lastSend = getOtpLastSendTimestamp();
		if (lastSend) {
			setCooldownAnchor(lastSend);
		}
	}, []);

	useEffect(() => {
		if (!cooldownAnchor) {
			setTimer(0);
			return;
		}

		const syncTimer = () => {
			const elapsed = Math.floor((Date.now() - cooldownAnchor) / 1000);
			const remaining = Math.max(RESEND_COOLDOWN_SECONDS - elapsed, 0);
			setTimer(remaining);
		};

		syncTimer();
		const intervalId = window.setInterval(syncTimer, 1000);

		return () => window.clearInterval(intervalId);
	}, [cooldownAnchor]);

	const isResendDisabled = useMemo(
		() => resending || timer > 0 || resendPermaDisabled || !email,
		[resending, timer, resendPermaDisabled, email],
	);

	const parseCooldownFromMessage = (msg: string) => {
		const match = msg?.match(/(\d+)\s*(?:seconds?|secs?|s)\b/i);
		return match ? Number(match[1]) : 0;
	};

	const formatCooldown = (seconds: number) => {
		const safeSeconds = Math.max(seconds, 0);
		const minutes = Math.floor(safeSeconds / 60);
		const secs = safeSeconds % 60;
		return `${minutes}:${secs.toString().padStart(2, "0")}`;
	};

	const getResendButtonText = () => {
		if (resending) return "Sending...";
		if (resendPermaDisabled) return "Resend unavailable";
		if (!email) return "No email found";
		if (timer > 0) return `Resend in ${formatCooldown(timer)}`;
		return "Resend code";
	};

	const markPermaDisabled = () => {
		setResendPermaDisabled(true);
		localStorage.setItem("otp_resend_perma_disabled", "true");
		setError(
			"Maximum resend attempts exceeded. Please contact support or start a new verification.",
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email) {
			setError("No pending email found. Please start verification again.");
			return;
		}

		if (otp.length !== 6) {
			setError("Enter the 6-digit code sent to your email");
			return;
		}

		setError("");
		setMessage("");
		setLoading(true);

		try {
			const res = await api.post("/otp/verify", { email, otp });
			const data = res.data;

			if (!data?.success) {
				throw new Error(data?.message || "Invalid OTP");
			}

			clearOtpLastSendTimestamp();
			localStorage.removeItem(PENDING_EMAIL_KEY);
			localStorage.removeItem("otp_resend_perma_disabled");
			localStorage.removeItem(`otp_resend_attempts_${email}`);
			router.replace("/auth/pending-approval");
		} catch (err: any) {
			const msg =
				err?.response?.data?.message || err?.message || "Verification failed";
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	const handleResend = async () => {
		if (!email || timer > 0 || resendPermaDisabled || resending) return;

		setError("");
		setMessage("");
		setResending(true);

		try {
			const res = await api.post("/otp/request", { email });
			const data = res.data;

			if (!data?.success) {
				throw new Error(data?.message || "Failed to resend code");
			}

			const now = Date.now();
			setMessage(`A new email code has been sent to ${email}.`);
			setCooldownAnchor(now);
			setOtpLastSendTimestamp(now);

			const attemptsKey = `otp_resend_attempts_${email}`;
			const attemptsData = localStorage.getItem(attemptsKey);
			const attempts = attemptsData ? parseInt(attemptsData, 10) : 0;
			const nextAttempts = attempts + 1;

			localStorage.setItem(attemptsKey, nextAttempts.toString());

			if (nextAttempts >= MAX_RESEND_ATTEMPTS) {
				markPermaDisabled();
			}
		} catch (err: any) {
			const msg =
				err?.response?.data?.message || err?.message || "Failed to resend code";
			setError(msg);

			const cooldown = parseCooldownFromMessage(msg);
			if (cooldown > 0) {
				const anchor = Date.now() - (RESEND_COOLDOWN_SECONDS - cooldown) * 1000;
				setCooldownAnchor(anchor);
				setOtpLastSendTimestamp(anchor);
			}

			const lowered = msg.toLowerCase();
			if (
				lowered.includes("maximum") ||
				lowered.includes("limit") ||
				lowered.includes("too many") ||
				lowered.includes("attempts") ||
				lowered.includes("resend")
			) {
				if (
					lowered.includes("maximum") ||
					lowered.includes("limit") ||
					lowered.includes("too many") ||
					lowered.includes("attempts")
				) {
					markPermaDisabled();
				}
			}
		} finally {
			setResending(false);
		}
	};

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary opacity-20 rounded-full blur-3xl" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-accent opacity-20 rounded-full blur-3xl" />
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
							<span className="font-semibold text-textPrimary">
								{displayedEmail}
							</span>
							.
						</p>
						{timer > 0 && (
							<p className="mt-3 text-sm text-textSecondary">
								You can request a new code in{" "}
								<span className="font-semibold text-textPrimary">
									{formatCooldown(timer)}
								</span>
								.
							</p>
						)}
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
								autoComplete="one-time-code"
								required
							/>
						</div>

						<button
							type="submit"
							disabled={loading || !email}
							className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primaryDark disabled:opacity-70 disabled:cursor-not-allowed text-onPrimary py-3 rounded-lg font-medium transition shadow-md hover:shadow-lg focus:ring-4 focus:ring-primaryLight">
							{loading ? "Verifying..." : "Verify Email"}
							{!loading && <ArrowRight className="w-4 h-4" />}
						</button>
					</form>

					<div className="mt-6 flex items-center justify-between text-sm gap-4">
						<button
							type="button"
							onClick={handleResend}
							disabled={isResendDisabled}
							className="inline-flex items-center gap-2 font-semibold text-primary hover:text-primaryDark disabled:opacity-70 disabled:cursor-not-allowed">
							<RefreshCw
								className={`w-4 h-4 ${resending ? "animate-spin" : ""}`}
							/>
							{getResendButtonText()}
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
