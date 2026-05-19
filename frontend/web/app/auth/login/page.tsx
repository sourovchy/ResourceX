"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Eye, EyeOff, User } from "lucide-react";
import { AxiosError } from "axios";
import api from "@/lib/api";

type AuthResponse = {
	message: string;
	token: string;
	user: {
		userId: number;
		studentId: string;
		name: string;
		email: string;
		phone: string;
		trustScore: number;
		verified: boolean;
	};
};

type ErrorResponse = {
	message?: string;
};

export default function LoginPage() {
	const router = useRouter();

	const [form, setForm] = useState({
		email: "",
		password: "",
	});

	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const validate = () => {
		if (!form.email.includes("@")) return "Invalid email address";
		if (form.password.length < 6)
			return "Password must be at least 6 characters";
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
			const { data } = await api.post<AuthResponse>("/auth/login", {
				email: form.email.trim(),
				password: form.password,
			});

			localStorage.setItem("campusvault_token", data.token);
			localStorage.setItem("campusvault_user", JSON.stringify(data.user));
			router.push("/dashboard");
		} catch (err) {
			const axiosError = err as AxiosError<ErrorResponse>;
			setError(
				axiosError.response?.data?.message ||
					"Could not sign in. Please check your email and password."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			{/* Background */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary opacity-20 rounded-full blur-3xl"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-accent opacity-20 rounded-full blur-3xl"></div>
			</div>

			<div className="relative z-10 w-full max-w-md">
				<div className="bg-surface border border-borderLight p-8 rounded-2xl shadow-xl">
					{/* Header */}
					<div className="text-center mb-8">
						<div className="flex justify-center mb-3">
							<User className="w-10 h-10 text-primary" />
						</div>

						<h1 className="text-3xl font-bold text-textPrimary">
							Student Login
						</h1>

						<p className="text-textSecondary mt-2">
							Please enter your details to sign in.
						</p>
					</div>

					{/* Form */}
					<form className="space-y-5" onSubmit={handleSubmit}>
						{/* Error Message */}
						{error && (
							<div className="text-sm text-error bg-errorLight border border-error px-3 py-2 rounded-lg">
								{error}
							</div>
						)}

						{/* Email */}
						<div className="space-y-1.5">
							<label className="text-sm font-medium text-textPrimary">
								Email
							</label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textTertiary" />
								<input
									type="email"
									value={form.email}
									onChange={(e) => setForm({ ...form, email: e.target.value })}
									className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outlineVariant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textPrimary"
									placeholder="yourname@university.edu"
									required
								/>
							</div>
						</div>

						{/* Password */}
						<div className="space-y-1.5">
							<div className="flex items-center justify-between">
								<label className="text-sm font-medium text-textPrimary">
									Password
								</label>
								<Link
									href="/auth/forgot-password"
									className="text-xs font-semibold text-primary hover:text-primaryDark">
									Forgot password?
								</Link>
							</div>

							<div className="relative">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textTertiary" />
								<input
									type={showPassword ? "text" : "password"}
									value={form.password}
									onChange={(e) =>
										setForm({ ...form, password: e.target.value })
									}
									className="w-full pl-10 pr-10 py-2.5 bg-surface border border-outlineVariant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textPrimary"
									placeholder="••••••••"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute inset-y-0 right-0 pr-3 flex items-center text-textSecondary hover:text-primary transition-colors">
									{showPassword ? (
										<EyeOff className="w-5 h-5 text-textTertiary" />
									) : (
										<Eye className="w-5 h-5 text-textTertiary" />
									)}
								</button>
							</div>
						</div>

						{/* Submit */}
						<button
							type="submit"
							disabled={loading}
							className="w-full mt-2 flex items-center justify-center gap-2 bg-primary hover:bg-primaryDark disabled:opacity-70 disabled:cursor-not-allowed text-onPrimary py-3 rounded-lg font-medium transition shadow-md hover:shadow-lg focus:ring-4 focus:ring-primaryLight">
							{loading ? "Signing in..." : "Sign In"}
							{!loading && <ArrowRight className="w-4 h-4" />}
						</button>
					</form>

					{/* Footer */}
					<p className="mt-8 text-center text-sm text-textSecondary">
						Don&apos;t have an account?{" "}
						<Link
							href="/auth/register"
							className="font-semibold text-primary hover:text-primaryDark">
							Sign up
						</Link>
					</p>

					{/* Admin Access */}
					<p className="mt-6 text-center text-sm text-textSecondary">
						Are you an admin?{" "}
						<Link
							href="/AdminLogin"
							className="font-semibold text-primary hover:text-primaryDark">
							Login as Admin
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
