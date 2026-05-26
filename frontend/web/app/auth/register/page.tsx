"use client";

import React, { useMemo, useState } from "react";
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
import { validatePasswordChecks, isPasswordStrong, validateEmail, validatePhone, normalizePhone } from "@/lib/validation";

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
	const [idCardFile, setIdCardFile] = useState<File | null>(null);

	const passwordChecks = useMemo(() => validatePasswordChecks(form.password), [form.password]);
	const passwordIsStrong = useMemo(() => isPasswordStrong(form.password), [form.password]);

	const validate = () => {
		if (!form.name.trim()) return "Full name is required";
		if (form.name.length > 50) return "Full name must be under 50 characters";
		if (!form.studentId.trim()) return "Student ID is required";
		if (form.studentId.length > 20) return "Student ID must be under 20 characters";
		if (!validatePhone(form.phone))
			return "Please enter a valid Bangladesh mobile number (e.g., 01XXXXXXXXX)";
		if (!form.university.trim()) return "University is required";
		if (form.university.length > 100) return "University name must be under 100 characters";
		if (!form.department.trim()) return "Department is required";
		if (form.department.length > 100) return "Department name must be under 100 characters";
		if (!idCardDataUrl) return "Upload your student ID card";
		if (!validateEmail(form.email)) return "Invalid email address";
		if (form.email.length > 100) return "Email must be under 100 characters";
		if (!passwordIsStrong)
			return "Please ensure your password meets all requirements";
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
			setIdCardFile(file);
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
			let uploadedIdCardUrl = "";

			if (idCardFile) {
				const formData = new FormData();
				formData.append("file", idCardFile);
				
				const uploadRes = await api.post("/files/upload?purpose=ID_CARD", formData, {
					headers: { "Content-Type": "multipart/form-data" },
				});
				
				if (uploadRes.data && uploadRes.data.fileUrl) {
					uploadedIdCardUrl = uploadRes.data.fileUrl;
				} else {
					throw new Error("Failed to upload ID card. Please try again.");
				}
			} else {
				throw new Error("Please select an ID card image");
			}

			await api.post<AuthResponse>("/auth/register", {
				studentId: form.studentId.trim(),
				name: form.name.trim(),
				email: form.email.trim(),
				password: form.password,
				phone: normalizePhone(form.phone),
				university: form.university.trim(),
				department: form.department.trim(),
				idCardDataUrl: uploadedIdCardUrl,
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
			const rawMessage: string = responseData?.message || responseData?.error || err?.message || "";

			const lower = rawMessage.toLowerCase();
			const friendlyMessage =
				lower.includes("duplicate") && lower.includes("phone")
					? "Phone number already exists"
					: lower.includes("duplicate") && lower.includes("email")
						? "Email already registered"
						: lower.includes("duplicate") && lower.includes("studentid")
							? "Student ID already registered"
							: rawMessage;

			setError(friendlyMessage || "Could not create your account. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const inputBase =
		"w-full rounded-xl border border-outlineVariant bg-surface px-4 py-3 text-textPrimary outline-none transition placeholder:text-textTertiary focus:border-primary focus:ring-2 focus:ring-primary";

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute left-[-10%] top-[-10%] h-[28rem] w-[28rem] rounded-full bg-primary opacity-10 blur-3xl" />
				<div className="absolute bottom-[-10%] left-[-10%] h-[26rem] w-[26rem] rounded-full bg-accent opacity-10 blur-3xl" />
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

			<div className="relative z-10 w-full max-w-6xl px-1 sm:px-0">
				<div className="grid overflow-hidden rounded-3xl border border-borderLight bg-surface/90 shadow-2xl backdrop-blur-xl lg:grid-cols-[0.75fr_1.25fr]">
					<div className="hidden flex-col justify-between border-r border-borderLight bg-surfaceVariant/30 p-10 lg:flex">
						<div>
							<div className="inline-flex rounded-full border border-outlineVariant px-4 py-1 text-sm font-medium text-primary">
								ResourceX
							</div>

							<h1 className="mt-8 text-5xl font-bold leading-tight text-textPrimary">
								Student Marketplace
							</h1>

							<p className="mt-5 max-w-md text-lg leading-8 text-textSecondary">
								Rent, share and exchange resources securely within your university community.
							</p>
						</div>

						<div className="space-y-4">
							<div className="rounded-2xl border border-borderLight bg-surface p-5">
								<p className="text-sm text-textSecondary">Verified students only</p>
								<h3 className="mt-1 text-lg font-semibold text-textPrimary">Safe university-based access</h3>
							</div>

							<div className="rounded-2xl border border-borderLight bg-surface p-5">
								<p className="text-sm text-textSecondary">Quick onboarding</p>
								<h3 className="mt-1 text-lg font-semibold text-textPrimary">Create account in minutes</h3>
							</div>
						</div>
					</div>

					<div className="bg-surface p-5 sm:p-6 md:p-8 lg:p-10">
						<div className="mx-auto w-full max-w-xl px-1 sm:px-0">
							<div className="mb-6 sm:mb-8">
								<h2 className="text-2xl font-bold leading-tight text-textPrimary sm:text-3xl">Create Account</h2>
								<p className="mt-2 text-sm text-textSecondary sm:text-base">Register with your university details.</p>
							</div>

							<form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
								{error && (
									<div className="rounded-xl border border-error/30 bg-errorLight px-4 py-3 text-sm leading-relaxed font-medium text-error">
										{error}
									</div>
								)}

								<div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2">
									<div className="space-y-1.5">
										<label className="block text-sm font-medium text-textPrimary">Full Name</label>
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
												maxLength={50}
												required
											/>
										</div>
									</div>

									<div className="space-y-1.5">
										<label className="block text-sm font-medium text-textPrimary">Student ID</label>
										<input
											type="text"
											value={form.studentId}
											onChange={(e) =>
												setForm({
													...form,
													studentId: e.target.value.replace(/[^a-zA-Z0-9]/g, ""),
												})
											}
											className={inputBase}
											placeholder="CSE2304082"
											maxLength={20}
											required
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2">
									<div className="space-y-1.5">
										<label className="block text-sm font-medium text-textPrimary">Mobile Number</label>
										<div className="relative">
											<input
												type="tel"
												value={form.phone}
												onChange={(e) =>
													setForm({
														...form,
														phone: e.target.value.replace(/[^\d+]/g, "").slice(0, 14),
													})
												}
												className={inputBase}
												placeholder="+8801XXXXXXXXX"
												maxLength={14}
												required
											/>
										</div>
									</div>

									<div className="space-y-1.5">
										<label className="block text-sm font-medium text-textPrimary">University</label>
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
											placeholder="Chittagong University of Engineering and Technology"
											maxLength={100}
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

								<div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2">
									<div className="space-y-1.5">
										<label className="block text-sm font-medium text-textPrimary">Department</label>
										<input
											type="text"
											list="department-list"
											value={form.department}
											onChange={(e) =>
												setForm({
													...form,
													department: e.target.value.replace(/[^a-zA-Z\s]/g, ""),
												})
											}
											className={inputBase}
											placeholder="Computer Science & Engineering"
											maxLength={100}
											required
										/>

										<datalist id="department-list">
											<option value="Computer Science and Engineering" />
											<option value="Electrical Engineering" />
											<option value="Business Administration" />
											<option value="English" />
										</datalist>
									</div>

									<div className="space-y-1.5">
										<label className="block text-sm font-medium text-textPrimary">Email</label>
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
												maxLength={100}
												required
											/>
										</div>
									</div>
								</div>

								<div className="space-y-1.5">
									<label className="block text-sm font-medium text-textPrimary">Password</label>

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
											className="absolute right-3 top-1/2 -translate-y-1/2 text-textTertiary transition hover:text-textPrimary"
											aria-label={showPassword ? "Hide password" : "Show password"}>
											{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
										</button>
									</div>

									<div className="space-y-2 rounded-2xl border border-borderLight bg-surfaceVariant px-4 py-4 text-sm">
										<p className="font-medium text-textPrimary">Password requirements</p>
										<ul className="space-y-1 text-textSecondary">
											{passwordChecks.map((check) => (
												<li key={check.label} className="flex items-center gap-2">
													<span
														className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
															check.valid
																? "bg-emerald-100 text-emerald-700"
																: "bg-slate-100 text-slate-400"
														}`}
													aria-hidden="true">
														{check.valid ? "✓" : "•"}
													</span>
													<span>{check.label}</span>
												</li>
											))}
										</ul>
									</div>
								</div>

								<div className="space-y-1.5">
									<label className="block text-sm font-medium text-textPrimary">Student ID Card</label>

									<label className="flex cursor-pointer items-start gap-3 rounded-xl border border-dashed border-outlineVariant bg-surface px-4 py-4 text-sm text-textSecondary transition hover:border-primary hover:bg-primaryLight sm:items-center">
										<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-11 sm:w-11">
											{idCardDataUrl ? <FileCheck2 className="h-4 w-4 sm:h-5 sm:w-5" /> : <Upload className="h-4 w-4 sm:h-5 sm:w-5" />}
										</div>

										<div className="min-w-0 flex-1">
											<div className="truncate font-semibold text-textPrimary">
												{idCardFileName || "Upload ID card image"}
											</div>
											<div className="text-xs text-textTertiary">JPG or PNG, up to 2 MB</div>
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
											className="h-32 w-full rounded-2xl border border-borderLight bg-surface object-cover shadow-sm sm:h-40"
										/>
									)}
								</div>

								<div className="space-y-1.5 pb-1 pt-1 sm:pt-2">
									<label className="flex cursor-pointer items-start gap-3">
										<input
											type="checkbox"
											className="mt-1 h-4 w-4 rounded border-outlineVariant bg-surface text-primary focus:ring-primary"
											required
										/>
										<span className="text-sm leading-relaxed text-textSecondary">
											I agree to the{" "}
											<Link href="/terms" className="font-semibold text-primary hover:underline" target="_blank" rel="noreferrer">
												Terms &amp; Conditions
											</Link>{" "}
											and Privacy Policy. I confirm that all provided information is accurate.
										</span>
									</label>
								</div>

								<button
									type="submit"
									disabled={loading}
									className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-onPrimary shadow-lg shadow-primary/20 transition hover:bg-primaryDark hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 focus:ring-4 focus:ring-primary/20">
									{loading ? "Creating account..." : "Sign Up"}
									{!loading && <ArrowRight className="h-4 w-4" />}
								</button>
							</form>

							<p className="mt-6 text-center text-sm text-textSecondary sm:mt-8">
								Already have an account?{" "}
								<Link href="/auth/login" className="font-semibold text-primary hover:text-primaryDark">
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
