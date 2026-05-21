"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { ArrowRight, Lock, Mail, Shield,Eye, EyeOff } from "lucide-react";

type AuthUser = {
	id?: number;
	name?: string;
	email?: string;
	role?: string;
	roles?: string[];
};

type AuthResponse = {
	accessToken?: string;
	refreshToken?: string;
	token?: string;
	user?: AuthUser;
	role?: string;
	roles?: string[];
	message?: string;
};

type ErrorResponse = {
	message?: string;
};

const api = axios.create({
	baseURL:
		process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8082",
	headers: {
		"Content-Type": "application/json",
	},
});

function isAdmin(response: AuthResponse): boolean {
	const roleCandidates = [
		response.role,
		response.user?.role,
		...(response.roles ?? []),
		...(response.user?.roles ?? []),
	].filter(Boolean);

	return roleCandidates.some((role) =>
		String(role).toUpperCase().includes("ADMIN"),
	);
}

export default function AdminLoginPage() {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);

	const [form, setForm] = useState({
		email: "",
		password: "",
	});

	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const { data } = await api.post<AuthResponse>("/api/auth/login", {
				email: form.email.trim(),
				password: form.password,
			});

			if (!isAdmin(data)) {
				localStorage.removeItem("accessToken");
				localStorage.removeItem("refreshToken");
				localStorage.removeItem("user");
				setError("This account does not have admin access.");
				return;
			}

			const accessToken = data.accessToken ?? data.token;
			const refreshToken = data.refreshToken;

			if (!accessToken) {
				setError("Login succeeded, but no access token was returned.");
				return;
			}

			localStorage.setItem("accessToken", accessToken);
			if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
			if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

			router.replace("/home");
		} catch (err) {
			const axiosError = err as AxiosError<ErrorResponse>;
			setError(
				axiosError.response?.data?.message ||
				"Could not sign in as an administrator.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="relative min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden">
			<div className="absolute inset-0 pointer-events-none">
				<div className="absolute top-[-10%] left-[-10%] h-96 w-96 rounded-full bg-primary opacity-20 blur-3xl" />
				<div className="absolute bottom-[-10%] right-[-10%] h-[30rem] w-[30rem] rounded-full bg-accent opacity-20 blur-3xl" />
			</div>

			<div className="relative z-10 w-full max-w-md">
				<div className="rounded-2xl border border-borderLight bg-surface p-8 shadow-xl">
					<div className="mb-8 text-center">
						<div className="mb-3 flex justify-center">
							<div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primaryLight">
								<Shield className="h-6 w-6 text-primary" />
							</div>
						</div>

						<h1 className="text-3xl font-bold text-textPrimary">Admin Login</h1>
						<p className="mt-2 text-textSecondary">
							Restricted access for administrators only.
						</p>
					</div>

					<form className="space-y-5" onSubmit={handleSubmit}>
						{error && (
							<div className="rounded-lg border border-error bg-errorLight px-3 py-2 text-sm text-error">
								{error}
							</div>
						)}

						<div className="space-y-1.5">
							<label className="text-sm font-medium text-textPrimary">
								Admin Email
							</label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textTertiary" />
								<input
									type="email"
									value={form.email}
									onChange={(e) =>
										setForm((prev) => ({ ...prev, email: e.target.value }))
									}
									className="w-full rounded-lg border border-outlineVariant bg-surface py-2.5 pl-10 pr-4 text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
									placeholder="admin@system.com"
									autoComplete="email"
									required
								/>
							</div>
						</div>
						{/* Password */}
						<div className="space-y-1.5">
							<label className="text-sm font-medium text-textPrimary">
								Password
							</label>

							<div className="relative">
								<Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textTertiary" />

								<input
									type={showPassword ? "text" : "password"}
									value={form.password}
									onChange={(e) =>
										setForm((prev) => ({ ...prev, password: e.target.value }))
									}
									className="w-full rounded-lg border border-outlineVariant bg-surface py-2.5 pl-10 pr-12 text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
									placeholder="••••••••"
									autoComplete="current-password"
									required
								/>

								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-textTertiary hover:text-textPrimary transition">
									{showPassword ? (
										<EyeOff className="h-5 w-5" />
									) : (
										<Eye className="h-5 w-5" />
									)}
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium text-onPrimary shadow-md transition hover:bg-primaryDark hover:shadow-lg focus:ring-4 focus:ring-primaryLight disabled:cursor-not-allowed disabled:opacity-70">
							{loading ? "Signing in..." : "Admin Sign In"}
							{!loading && <ArrowRight className="h-4 w-4" />}
						</button>
					</form>

					<p className="mt-6 text-center text-sm text-textSecondary">
						Not an admin?{" "}
						<Link
							href="/auth/login"
							className="font-semibold text-primary hover:text-primaryDark">
							Go to Student Login
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}