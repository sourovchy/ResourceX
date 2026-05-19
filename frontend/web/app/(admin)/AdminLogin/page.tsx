"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Shield } from "lucide-react";

export default function AdminLoginPage() {
	const router = useRouter();

	const [form, setForm] = useState({
		email: "",
		password: "",
	});

	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setLoading(true);

		//Fake API (replace later)
		setTimeout(() => {
			setLoading(false);

			//admin dashboard route
			router.push("/home");
		}, 1000);
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
							<div className="w-12 h-12 flex items-center justify-center rounded-full bg-primaryLight border border-primary/30">
								<Shield className="w-6 h-6 text-primary" />
							</div>
						</div>

						<h1 className="text-3xl font-bold text-textPrimary">Admin Login</h1>

						<p className="text-textSecondary mt-2">
							Restricted access for administrators only.
						</p>
					</div>

					{/* Form */}
					<form className="space-y-5" onSubmit={handleSubmit}>
						{/* Error */}
						{error && (
							<div className="text-sm text-error bg-errorLight border border-error px-3 py-2 rounded-lg">
								{error}
							</div>
						)}

						{/* Email */}
						<div className="space-y-1.5">
							<label className="text-sm font-medium text-textPrimary">
								Admin Email
							</label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textTertiary" />
								<input
									type="email"
									value={form.email}
									onChange={(e) => setForm({ ...form, email: e.target.value })}
									className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outlineVariant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textPrimary"
									placeholder="admin@system.com"
								/>
							</div>
						</div>

						{/* Password */}
						<div className="space-y-1.5">
							<div className="flex items-center justify-between">
								<label className="text-sm font-medium text-textPrimary">
									Password
								</label>
							</div>

							<div className="relative">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textTertiary" />
								<input
									type="password"
									value={form.password}
									onChange={(e) =>
										setForm({ ...form, password: e.target.value })
									}
									className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outlineVariant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textPrimary"
									placeholder="••••••••"
								/>
							</div>
						</div>

						{/* Submit */}
						<button
							type="submit"
							disabled={loading}
							className="w-full mt-2 flex items-center justify-center gap-2 bg-primary hover:bg-primaryDark disabled:opacity-70 text-onPrimary py-3 rounded-lg font-medium transition shadow-md hover:shadow-lg focus:ring-4 focus:ring-primaryLight">
							{loading ? "Signing in..." : "Admin Sign In"}
							{!loading && <ArrowRight className="w-4 h-4" />}
						</button>
					</form>

					{/* Back to Student */}
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
