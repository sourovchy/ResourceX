"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, RefreshCw } from "lucide-react";
import { LogoIcon } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import AuthProgressOverlay, { AuthProgress } from "@/components/auth/AuthProgressOverlay";
import api from "@/lib/api";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import {
	PENDING_EMAIL_KEY,
	getOtpLastSendTimestamp,
	setOtpLastSendTimestamp,
	clearOtpLastSendTimestamp,
} from "@/lib/auth";

const RESEND_COOLDOWN_SECONDS = 180;
const FALLBACK_RESEND_COOLDOWN_SECONDS = 60;
const MAX_RESEND_ATTEMPTS = 3;

export default function EmailVerificationPage() {
	const router = useRouter();
	const resendInFlightRef = useRef(false);

	const [otp, setOtp] = useState("");
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [progress, setProgress] = useState<AuthProgress | null>(null);
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
			setProgress({ message: "Verifying code…", state: "loading" });
			const res = await api.post("/otp/verify", { email, otp });
			const data = res.data;

			if (!data?.success) {
				throw new Error(data?.message || "Invalid OTP");
			}

			clearOtpLastSendTimestamp();
			localStorage.removeItem(PENDING_EMAIL_KEY);
			localStorage.removeItem("otp_resend_perma_disabled");
			localStorage.removeItem(`otp_resend_attempts_${email}`);

			setProgress({ message: "Email verified", state: "success" });
			await new Promise((r) => setTimeout(r, 750));
			setProgress({ message: "Redirecting…", state: "loading" });
			router.replace("/auth/pending-approval");
		} catch (err: any) {
			setProgress(null);
			const msg =
				err?.response?.data?.message || err?.message || "Verification failed";
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	const handleResend = async () => {
		if (!email || timer > 0 || resendPermaDisabled || resending || resendInFlightRef.current) return;

		setError("");
		setMessage("");
		resendInFlightRef.current = true;
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
			const status = err?.response?.status;
			let msg = err?.response?.data?.message || err?.message || "Failed to resend code";

			if (status === 429) {
				msg = "Too many requests. Please wait one minute before trying again.";
			} else if (status === 503) {
				msg = "We couldn't send the email right now. Please try again in a minute.";
			}
			setError(msg);

			const cooldown = parseCooldownFromMessage(msg);
			if (cooldown > 0) {
				const anchor = Date.now() - (RESEND_COOLDOWN_SECONDS - cooldown) * 1000;
				setCooldownAnchor(anchor);
				setOtpLastSendTimestamp(anchor);
			} else if (status === 429 || status === 503) {
				// Fallback cooldown to prevent spamming on rate-limits or email delivery failures
				const anchor = Date.now() - (RESEND_COOLDOWN_SECONDS - FALLBACK_RESEND_COOLDOWN_SECONDS) * 1000;
				setCooldownAnchor(anchor);
				setOtpLastSendTimestamp(anchor);
			}

			const lowered = msg.toLowerCase();
			if (status !== 429 && status !== 503) {
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
			}
		} finally {
			resendInFlightRef.current = false;
			setResending(false);
		}
	};

	return (
		<div className="graph-grid relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
			<AuthProgressOverlay progress={progress} />

			<Reveal className="relative z-10 w-full max-w-md px-1 sm:px-0">
				<TiltCard maxTilt={1} className="glass-surface rounded-2xl p-5 shadow-md sm:p-6 md:p-8">
					<div className="mb-6 text-center sm:mb-8">
						<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primaryLight sm:h-16 sm:w-16">
							<LogoIcon size={32} />
						</div>
						<h1 className="text-2xl font-bold leading-tight text-textPrimary sm:text-3xl">
							Verify <span className="text-gradient-brand italic">email.</span>
						</h1>
						<p className="mt-2 text-sm text-textSecondary">
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
							<label htmlFor="ve-otp" className="block text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
								Email Code <span className="text-error">*</span>
							</label>
							<input
								id="ve-otp"
								type="text"
								inputMode="numeric"
								maxLength={6}
								value={otp}
								onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
								className="w-full rounded-xl border border-border bg-card px-4 py-3 text-center text-xl tracking-[0.35em] text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-textTertiary"
								placeholder="000000"
								autoComplete="one-time-code"
								required
							/>
						</div>

						<Button type="submit" loading={loading} disabled={!email} fullWidth rightIcon={<ArrowRight className="h-4 w-4" />} className="mt-2">
							{loading ? "Verifying…" : "Verify Email"}
						</Button>
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
				</TiltCard>
			</Reveal>
		</div>
	);
}
