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
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-primary opacity-20 blur-3xl sm:h-96 sm:w-96" />
				<div className="absolute bottom-[-10%] right-[-10%] h-72 w-72 rounded-full bg-accent opacity-20 blur-3xl sm:h-[30rem] sm:w-[30rem]" />
			</div>

			<div className="relative z-10 w-full max-w-md px-1 sm:px-0">
				<div className="rounded-2xl border border-borderLight bg-surface p-5 shadow-xl sm:p-6 md:p-8">
					<div className="mb-6 text-center sm:mb-8">
						<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primaryLight sm:h-16 sm:w-16">
							<MailCheck className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
						</div>
						<h1 className="text-2xl font-bold leading-tight text-textPrimary sm:text-3xl">
							Verify Email
						</h1>
						<p className="mt-2 text-sm text-textSecondary sm:text-base">
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
								Email Code
							</label>
							<input
								type="text"
								inputMode="numeric"
								maxLength={6}
								value={otp}
								onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
								className="w-full rounded-lg border border-outlineVariant bg-surface px-4 py-3 text-center text-xl tracking-[0.35em] text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
								placeholder="000000"
								autoComplete="one-time-code"
								required
							/>
						</div>

						<button
							type="submit"
							disabled={loading || !email}
							className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-onPrimary shadow-md transition shadow-md hover:bg-primaryDark hover:shadow-lg focus:ring-4 focus:ring-primaryLight disabled:cursor-not-allowed disabled:opacity-70">
							{loading ? "Verifying..." : "Verify Email"}
							{!loading && <ArrowRight className="h-4 w-4" />}
						</button>
					</form>

					<div className="mt-6 flex flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
						<button
							type="button"
							onClick={handleResend}
							disabled={isResendDisabled}
							className="inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:text-primaryDark disabled:cursor-not-allowed disabled:opacity-70">
							<RefreshCw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} />
							{getResendButtonText()}
						</button>

						<Link href="/auth/login" className="font-semibold text-textSecondary transition-colors hover:text-primary">
							Back to login
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
