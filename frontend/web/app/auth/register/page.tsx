"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	Mail,
	Lock,
	ArrowRight,
	User,
	Eye,
	EyeOff,
	Upload,
	FileCheck2,
} from "lucide-react";
import api from "@/lib/api";
import { PENDING_EMAIL_KEY, setOtpLastSendTimestamp } from "@/lib/auth";

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

export default function RegisterPage() {
	const router = useRouter();

	const [form, setForm] = useState({
		name: "",
		email: "",
		password: "",
		studentId: "",
		phone: "",
		department: "",
		university: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [idCardFileName, setIdCardFileName] = useState("");
	const [idCardDataUrl, setIdCardDataUrl] = useState("");

	const passwordChecks = [
		{ label: "At least 8 characters", valid: form.password.length >= 8 },
		{
			label: "Uppercase and lowercase letters",
			valid: /[A-Z]/.test(form.password) && /[a-z]/.test(form.password),
		},
		{ label: "At least one number", valid: /\d/.test(form.password) },
		{ label: "At least one symbol", valid: /[^A-Za-z0-9]/.test(form.password) },
	];

	const passwordIsStrong = passwordChecks.every((check) => check.valid);

	const validate = () => {
		if (!form.name.trim()) return "Full name is required";
		if (!form.studentId.trim()) return "Student ID is required";
		if (!/^\d{10}$/.test(form.phone))
			return "Mobile number must be +880 followed by 10 digits";
		if (!form.university.trim()) return "University is required";
		if (!form.department.trim()) return "Department is required";
		if (!idCardDataUrl) return "Upload your student ID card";
		if (!form.email.includes("@")) return "Invalid email address";
		if (!passwordIsStrong)
			return "Use a stronger password with 8 characters, mixed letters, a number, and a symbol";
		return "";
	};

	const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];

		if (!file) return;

		if (!file.type.startsWith("image/")) {
			setError("Student ID card must be an image file");
			return;
		}

		if (file.size > 2 * 1024 * 1024) {
			setError("Student ID card image must be under 2 MB");
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			setError("");
			setIdCardFileName(file.name);
			setIdCardDataUrl(String(reader.result));
		};
		reader.readAsDataURL(file);
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
			await api.post<AuthResponse>("/auth/register", {
				studentId: form.studentId.trim(),
				name: form.name.trim(),
				email: form.email.trim(),
				password: form.password,
				phone: `+880${form.phone}`,
				university: form.university.trim(),
				department: form.department.trim(),
				idCardDataUrl,
			});

			localStorage.setItem(PENDING_EMAIL_KEY, form.email.trim());

			try {
				await api.post("/otp/request", { email: form.email.trim() });
				setOtpLastSendTimestamp(Date.now());
			} catch {
				// Non-fatal
			}

			router.push("/auth/verify-email");
		} catch (err: any) {
			console.error("Registration error:", err?.response?.data ?? err);

			const responseData = err?.response?.data;
			const rawMessage: string =
				responseData?.message || responseData?.error || err?.message || "";

			const friendlyMessage =
				rawMessage.toLowerCase().includes("duplicate") &&
				rawMessage.toLowerCase().includes("phone")
					? "Phone number already exists"
					: rawMessage.toLowerCase().includes("duplicate") &&
						  rawMessage.toLowerCase().includes("email")
						? "Email already registered"
						: rawMessage.toLowerCase().includes("duplicate") &&
							  rawMessage.toLowerCase().includes("studentid")
							? "Student ID already registered"
							: rawMessage;

			setError(
				friendlyMessage || "Could not create your account. Please try again.",
			);
		} finally {
			setLoading(false);
		}
	};

	const inputBase =
		"w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-3 text-textPrimary outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-400";
	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
			{/* Minimal Background */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				{/* Soft top glow */}
				<div className="absolute top-[-10%] right-[-10%] w-[28rem] h-[28rem] bg-primary opacity-10 rounded-full blur-3xl"></div>

				{/* Soft bottom glow */}
				<div className="absolute bottom-[-10%] left-[-10%] w-[26rem] h-[26rem] bg-accent opacity-10 rounded-full blur-3xl"></div>

				{/* Subtle grid */}
				<div
					className="absolute inset-0 opacity-[0.03]"
					style={{
						backgroundImage: `
                        linear-gradient(to right, currentColor 1px, transparent 1px),
                        linear-gradient(to bottom, currentColor 1px, transparent 1px)
                    `,
						backgroundSize: "40px 40px",
					}}
				/>
			</div>

			<div className="relative z-10 w-full max-w-6xl">
				<div className="grid overflow-hidden rounded-3xl border border-borderLight bg-surface/90 shadow-2xl backdrop-blur-xl lg:grid-cols-[0.75fr_1.25fr]">
					{/* LEFT SIDE */}
					<div className="hidden lg:flex flex-col justify-between border-r border-borderLight bg-surfaceVariant/30 p-10">
						<div>
							<div className="inline-flex rounded-full border border-outlineVariant px-4 py-1 text-sm font-medium text-primary">
								ResourceX
							</div>

							<h1 className="mt-8 text-5xl font-bold leading-tight text-textPrimary">
								Student Marketplace
							</h1>

							<p className="mt-5 max-w-md text-lg leading-8 text-textSecondary">
								Rent, share and exchange resources securely within your
								university community.
							</p>
						</div>

						<div className="space-y-4">
							<div className="rounded-2xl border border-borderLight bg-surface p-5">
								<p className="text-sm text-textSecondary">
									Verified students only
								</p>

								<h3 className="mt-1 text-lg font-semibold text-textPrimary">
									Safe university-based access
								</h3>
							</div>

							<div className="rounded-2xl border border-borderLight bg-surface p-5">
								<p className="text-sm text-textSecondary">Quick onboarding</p>

								<h3 className="mt-1 text-lg font-semibold text-textPrimary">
									Create account in minutes
								</h3>
							</div>
						</div>
					</div>

					{/* RIGHT SIDE */}
					<div className="bg-surface p-6 sm:p-8 lg:p-10">
						<div className="mx-auto w-full max-w-xl">
							{/* Header */}
							<div className="mb-8">
								<h2 className="text-3xl font-bold text-textPrimary">
									Create Account
								</h2>

								<p className="mt-2 text-textSecondary">
									Register with your university details.
								</p>
							</div>

							{/* Keep your existing form here */}
							<form className="space-y-5" onSubmit={handleSubmit}>
								{error && (
									<div className="rounded-xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
										{error}
									</div>
								)}

								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									{/* Full Name */}
									<div className="space-y-1.5">
										<label className="text-sm font-medium text-textPrimary dark:text-white">
											Full Name
										</label>
										<div className="relative">
											<User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textTertiary" />
											<input
												type="text"
												value={form.name}
												onChange={(e) =>
													setForm({
														...form,
														name: e.target.value.replace(/[^a-zA-Z.\s]/g, ""),
													})
												}
												className={`${inputBase} pl-10`}
												placeholder="John Doe"
												required
											/>
										</div>
									</div>

									{/* Student ID */}
									<div className="space-y-1.5">
										<label className="text-sm font-medium text-textPrimary dark:text-white">
											Student ID
										</label>
										<input
											type="text"
											value={form.studentId}
											onChange={(e) =>
												setForm({
													...form,
													studentId: e.target.value.replace(
														/[^a-zA-Z0-9]/g,
														"",
													),
												})
											}
											className={inputBase}
											placeholder="CSE2304082"
											required
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									{/* Mobile Number */}
									<div className="space-y-1.5">
										<label className="text-sm font-medium text-textPrimary dark:text-white">
											Mobile Number
										</label>
										<div className="flex overflow-hidden rounded-xl border border-slate-300/70 bg-white/90 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15 dark:border-white/10 dark:bg-white/5">
											<div className="flex items-center border-r border-slate-300/70 bg-slate-100 px-4 font-semibold text-textPrimary dark:border-white/10 dark:bg-white/10 dark:text-white">
												+880
											</div>
											<input
												type="tel"
												inputMode="numeric"
												value={form.phone}
												onChange={(e) =>
													setForm({
														...form,
														phone: e.target.value
															.replace(/\D/g, "")
															.slice(0, 10),
													})
												}
												className="w-full bg-transparent px-4 py-3 text-textPrimary outline-none dark:text-white"
												placeholder="1XXXXXXXXX"
												maxLength={10}
												required
											/>
										</div>
									</div>

									{/* University */}
									<div className="space-y-1.5">
										<label className="text-sm font-medium text-textPrimary dark:text-white">
											University
										</label>
										<input
											type="text"
											list="university-list"
											value={form.university}
											onChange={(e) =>
												setForm({
													...form,
													university: e.target.value,
												})
											}
											className={inputBase}
											placeholder="Type your university"
											required
										/>

										<datalist id="university-list">
											<option value="Chittagong University of Engineering and Technology" />
											<option value="North South University" />
											<option value="BRAC University" />
											<option value="Dhaka University" />
										</datalist>
									</div>
								</div>

								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									{/* Department */}
									<div className="space-y-1.5">
										<label className="text-sm font-medium text-textPrimary dark:text-white">
											Department
										</label>
										<input
											type="text"
											list="department-list"
											value={form.department}
											onChange={(e) =>
												setForm({
													...form,
													department: e.target.value.replace(
														/[^a-zA-Z\s]/g,
														"",
													),
												})
											}
											className={inputBase}
											placeholder="Computer Science"
											required
										/>

										<datalist id="department-list">
											<option value="Computer Science and Engineering" />
											<option value="Electrical Engineering" />
											<option value="Business Administration" />
											<option value="English" />
										</datalist>
									</div>

									{/* Email */}
									<div className="space-y-1.5">
										<label className="text-sm font-medium text-textPrimary dark:text-white">
											Email
										</label>
										<div className="relative">
											<Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textTertiary" />
											<input
												type="email"
												value={form.email}
												onChange={(e) =>
													setForm({
														...form,
														email: e.target.value,
													})
												}
												className={`${inputBase} pl-10`}
												placeholder="yourname@university.edu"
												required
											/>
										</div>
									</div>
								</div>

								{/* Password */}
								<div className="space-y-1.5">
									<label className="text-sm font-medium text-textPrimary dark:text-white">
										Password
									</label>

									<div className="relative">
										<Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textTertiary" />

										<input
											type={showPassword ? "text" : "password"}
											value={form.password}
											onChange={(e) =>
												setForm({
													...form,
													password: e.target.value,
												})
											}
											className={`${inputBase} pl-10 pr-10`}
											placeholder="Strong password"
											minLength={8}
											required
										/>

										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-textTertiary transition hover:text-textPrimary dark:hover:text-white">
											{showPassword ? (
												<EyeOff className="h-5 w-5" />
											) : (
												<Eye className="h-5 w-5" />
											)}
										</button>
									</div>

									<div className="grid grid-cols-1 gap-1.5 pt-1 sm:grid-cols-2">
										{passwordChecks.map((check) => (
											<div
												key={check.label}
												className={`text-xs font-medium ${
													check.valid ? "text-success" : "text-textTertiary"
												}`}>
												{check.valid ? "OK" : "-"} {check.label}
											</div>
										))}
									</div>
								</div>

								{/* Student ID Card */}
								<div className="space-y-1.5">
									<label className="text-sm font-medium text-textPrimary dark:text-white">
										Student ID Card
									</label>

									<label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300/80 bg-white/90 px-4 py-4 text-sm text-textSecondary transition hover:border-primary hover:bg-primary/5 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
										<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
											{idCardDataUrl ? (
												<FileCheck2 className="h-5 w-5" />
											) : (
												<Upload className="h-5 w-5" />
											)}
										</div>

										<div className="min-w-0 flex-1">
											<div className="truncate font-semibold text-textPrimary dark:text-white">
												{idCardFileName || "Upload ID card image"}
											</div>
											<div className="text-xs text-textTertiary dark:text-slate-400">
												JPG or PNG, up to 2 MB
											</div>
										</div>

										<input
											type="file"
											accept="image/*"
											onChange={handleIdCardChange}
											className="hidden"
											required
										/>
									</label>

									{idCardDataUrl && (
										<img
											src={idCardDataUrl}
											alt="Student ID card preview"
											className="h-40 w-full rounded-2xl border border-slate-200 object-cover shadow-sm dark:border-white/10"
										/>
									)}
								</div>

								{/* Submit */}
								<button
									type="submit"
									disabled={loading}
									className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-onPrimary shadow-lg shadow-primary/20 transition hover:bg-primaryDark hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 focus:ring-4 focus:ring-primary/20">
									{loading ? "Creating account..." : "Sign Up"}
									{!loading && <ArrowRight className="h-4 w-4" />}
								</button>
							</form>

							<p className="mt-8 text-center text-sm text-textSecondary">
								Already have an account?{" "}
								<Link
									href="/auth/login"
									className="font-semibold text-primary hover:text-primaryDark">
									Sign in
								</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
