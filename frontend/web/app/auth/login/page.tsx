"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Eye, EyeOff, User, Loader2 } from "lucide-react";
import { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type ErrorResponse = {
	message?: string;
};

export default function LoginPage() {
	const { login, user, loading: authLoading } = useAuth();
	const router = useRouter();

	const [form, setForm] = useState({ email: "", password: "" });
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	// Redirect already-authenticated users away from login
	useEffect(() => {
		if (!authLoading && user) {
			router.replace("/dashboard");
		}
	}, [authLoading, user, router]);

	// Render nothing while auth is hydrating or redirecting
	if (authLoading || user) return null;

	const validate = () => {
		if (!form.email.includes("@")) return "Invalid email address";
		if (form.password.length < 6) return "Password must be at least 6 characters";
		return "";
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const err = validate();
		if (err) {
			setError(err);
			return;
		}

		setError("");
		setLoading(true);

		try {
			await login(form.email.trim(), form.password);
		} catch (err) {
			const axiosError = err as AxiosError<ErrorResponse>;
			
			if (!axiosError.response) {
				setError("Network error. Please check your connection.");
			} else if (axiosError.response.status >= 500) {
				setError("Server error. Please try again later.");
			} else if (axiosError.response.status === 401 || axiosError.response.status === 403 || axiosError.response.status === 404) {
				const errorMsg = axiosError.response?.data?.message;
				
				if (errorMsg === "Your account is pending admin review.") {
					router.push("/auth/pending-approval");
					return;
				}
				
				setError(errorMsg || "Invalid email or password.");
			} else {
				setError(
					axiosError.response?.data?.message ||
						"Invalid email or password.",
				);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
			{/* Background */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-primary opacity-20 blur-3xl sm:h-96 sm:w-96" />
				<div className="absolute bottom-[-10%] right-[-10%] h-72 w-72 rounded-full bg-accent opacity-20 blur-3xl sm:h-[30rem] sm:w-[30rem]" />
			</div>

			<div className="relative z-10 w-full max-w-md px-1 sm:px-0">
				<div className="rounded-2xl border border-borderLight bg-surface p-5 shadow-xl sm:p-6 md:p-8">
					{/* Header */}
					<div className="mb-6 text-center sm:mb-8">
						<div className="mb-3 flex justify-center">
							<User className="h-10 w-10 text-primary" />
						</div>

						<h1 className="text-2xl font-bold text-textPrimary sm:text-3xl">
							ResourceX Login
						</h1>

						<p className="mt-2 text-sm text-textSecondary sm:text-base">
							Please enter your details to sign in.
						</p>
					</div>

					{/* Form */}
					<form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
						{/* Error Message */}
						{error && (
							<div className="rounded-lg border border-error bg-errorLight px-3 py-2 text-sm text-error">
								{error}
							</div>
						)}

						{/* Email */}
						<div className="space-y-1.5">
							<label className="block text-sm font-medium text-textPrimary">
								Email
							</label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textTertiary" />
								<input
									type="email"
									value={form.email}
									onChange={(e) => setForm({ ...form, email: e.target.value })}
									className="w-full rounded-lg border border-outlineVariant bg-surface py-3 pl-10 pr-4 text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
									placeholder="yourname@university.edu"
									maxLength={100}
									required
								/>
							</div>
						</div>

						{/* Password */}
						<div className="space-y-1.5">
							<div className="flex items-center justify-between gap-3">
								<label className="block text-sm font-medium text-textPrimary">
									Password
								</label>
								<Link
									href="/auth/forgot-password"
									className="text-xs font-semibold text-primary transition-colors hover:text-primaryDark">
									Forgot password?
								</Link>
							</div>

							<div className="relative">
								<Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textTertiary" />
								<input
									type={showPassword ? "text" : "password"}
									value={form.password}
									onChange={(e) => setForm({ ...form, password: e.target.value })}
									className="w-full rounded-lg border border-outlineVariant bg-surface py-3 pl-10 pr-10 text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
									placeholder="••••••••"
									maxLength={128}
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute inset-y-0 right-0 flex items-center pr-3 text-textSecondary transition-colors hover:text-primary"
									aria-label={showPassword ? "Hide password" : "Show password"}>
									{showPassword ? (
										<EyeOff className="h-5 w-5 text-textTertiary" />
									) : (
										<Eye className="h-5 w-5 text-textTertiary" />
									)}
								</button>
							</div>
						</div>

						{/* Terms and Conditions */}
						<div className="space-y-1.5 pb-1 pt-1 sm:pt-2">
							<label className="flex cursor-pointer items-start gap-3">
								<input
									type="checkbox"
									className="mt-1 h-4 w-4 rounded border-outlineVariant bg-surface text-primary focus:ring-primary"
									required
								/>
								<span className="text-sm leading-relaxed text-textSecondary">
									I agree to the{" "}
									<Link
										href="/terms"
										target="_blank"
										rel="noreferrer"
										className="font-semibold text-primary underline-offset-4 hover:underline">
										Terms &amp; Conditions
									</Link>{" "}
									and Privacy Policy.
								</span>
							</label>
						</div>

						{/* Submit */}
						<button
							type="submit"
							disabled={loading}
							className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-onPrimary shadow-md transition hover:bg-primaryDark hover:shadow-lg focus:ring-4 focus:ring-primaryLight disabled:cursor-not-allowed disabled:opacity-70">
							{loading ? (
								<>
									<Loader2 className="h-5 w-5 animate-spin" />
									Signing in...
								</>
							) : (
								<>
									Sign In
									<ArrowRight className="h-4 w-4" />
								</>
							)}
						</button>
					</form>

					{/* Footer */}
					<p className="mt-6 text-center text-sm text-textSecondary sm:mt-8">
						Don&apos;t have an account?{" "}
						<Link href="/auth/register" className="font-semibold text-primary transition-colors hover:text-primaryDark">
							Sign up
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
