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
import { AxiosError } from "axios";
import api from "@/lib/api";
import { saveApprovalRequest } from "@/lib/approvalRequests";

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

		if (!file) {
			return;
		}

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
			const { data } = await api.post<AuthResponse>("/auth/register", {
				studentId: form.studentId.trim(),
				name: form.name.trim(),
				email: form.email.trim(),
				password: form.password,
				phone: `+880${form.phone}`,
			});

			localStorage.setItem("campusvault_token", data.token);
			localStorage.setItem("campusvault_user", JSON.stringify(data.user));
			saveApprovalRequest({
				id: `REQ-${data.user.userId}`,
				name: form.name.trim(),
				email: form.email.trim(),
				phone: `+880${form.phone}`,
				studentId: form.studentId.trim(),
				university: form.university.trim(),
				department: form.department.trim(),
				idCardFileName,
				idCardDataUrl,
				status: "PENDING",
				submittedAt: new Date().toISOString(),
			});

			// Trigger OTP send to the registered email
			try {
				await api.post("/otp/request", { email: form.email.trim() });
			} catch {
				// OTP send failure is non-fatal; user can resend from verify-email page
			}

			router.push("/auth/verify-email");
		} catch (err: any) {
			console.error("Registration error:", err?.response?.data ?? err);
			// Try all possible message locations in the response
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

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			{/* Background */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-[-10%] right-[-10%] w-[32rem] h-[32rem] bg-accent opacity-20 rounded-full blur-3xl"></div>
				<div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-primary opacity-20 rounded-full blur-3xl"></div>
			</div>

			<div className="relative z-10 w-full max-w-md">
				<div className="bg-surface border border-borderLight p-8 rounded-2xl shadow-xl">
					{/* Header */}
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-textPrimary">
							Student Registration
						</h1>
						<p className="text-textSecondary mt-2">
							Join us to start renting or listing items.
						</p>
					</div>

					{/* Form */}
					<form className="space-y-4" onSubmit={handleSubmit}>
						{error && (
							<div className="text-sm text-error bg-errorLight border border-error px-3 py-2 rounded-lg">
								{error}
							</div>
						)}

						{/* Name */}
						<div className="space-y-1.5">
							<label className="text-sm font-medium text-textPrimary">
								Full Name
							</label>
							<div className="relative">
								<User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textTertiary" />
								<input
									type="text"
									value={form.name}
									onChange={(e) =>
										setForm({
											...form,
											name: e.target.value.replace(/[^a-zA-Z.\s]/g, ""),
										})
									}
									className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outlineVariant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textPrimary"
									placeholder="John Doe"
									required
								/>
							</div>
						</div>

						{/* Student ID */}
						<div className="space-y-1.5">
							<label className="text-sm font-medium text-textPrimary">
								Student ID
							</label>
							<input
								type="text"
								value={form.studentId}
								onChange={(e) =>
									setForm({
										...form,
										studentId: e.target.value.replace(/[^a-zA-Z0-9]/g, ""),
									})
								}
								className="w-full px-4 py-2.5 bg-surface border border-outlineVariant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textPrimary"
								placeholder="CSE2304082"
								required
							/>
						</div>

						{/* Phone */}
						<div className="space-y-1.5">
							<label className="text-sm font-medium text-textPrimary">
								Mobile Number
							</label>
							<div className="flex overflow-hidden rounded-lg border border-outlineVariant bg-surface transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
								<div className="flex items-center border-r border-outlineVariant bg-surfaceVariant px-4 font-semibold text-textPrimary">
									+880
								</div>
								<input
									type="tel"
									inputMode="numeric"
									value={form.phone}
									onChange={(e) =>
										setForm({
											...form,
											phone: e.target.value.replace(/\D/g, "").slice(0, 10),
										})
									}
									className="w-full bg-surface px-4 py-2.5 text-textPrimary outline-none"
									placeholder="1XXXXXXXXX"
									maxLength={10}
									required
								/>
							</div>
						</div>

						{/* University */}
						<div className="space-y-1.5">
							<label className="text-sm font-medium text-textPrimary">
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
								className="w-full px-4 py-2.5 bg-surface border border-outlineVariant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textPrimary"
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

						{/* Department */}
						<div className="space-y-1.5">
							<label className="text-sm font-medium text-textPrimary">
								Department
							</label>
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
								className="w-full px-4 py-2.5 bg-surface border border-outlineVariant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textPrimary"
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
							<label className="text-sm font-medium text-textPrimary">
								Email
							</label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textTertiary" />
								<input
									type="email"
									value={form.email}
									onChange={(e) =>
										setForm({
											...form,
											email: e.target.value,
										})
									}
									className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outlineVariant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textPrimary"
									placeholder="yourname@university.edu"
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
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textTertiary" />

								<input
									type={showPassword ? "text" : "password"}
									value={form.password}
									onChange={(e) =>
										setForm({
											...form,
											password: e.target.value,
										})
									}
									className="w-full pl-10 pr-10 py-2.5 bg-surface border border-outlineVariant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition text-textPrimary"
									placeholder="Strong password"
									minLength={8}
									required
								/>

								{/* Toggle Button */}
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-textTertiary hover:text-textPrimary transition">
									{showPassword ? (
										<EyeOff className="w-5 h-5" />
									) : (
										<Eye className="w-5 h-5" />
									)}
								</button>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
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
							<label className="text-sm font-medium text-textPrimary">
								Student ID Card
							</label>
							<label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-outlineVariant bg-surface px-4 py-3 text-sm text-textSecondary transition hover:border-primary hover:bg-primaryLight/30">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primaryLight text-primary">
									{idCardDataUrl ? (
										<FileCheck2 className="h-5 w-5" />
									) : (
										<Upload className="h-5 w-5" />
									)}
								</div>
								<div className="min-w-0">
									<div className="font-semibold text-textPrimary truncate">
										{idCardFileName || "Upload ID card image"}
									</div>
									<div className="text-xs text-textTertiary">
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
									className="h-32 w-full rounded-lg border border-borderLight object-cover"
								/>
							)}
						</div>

						{/* Submit */}
						<button
							type="submit"
							disabled={loading}
							className="w-full mt-4 flex items-center justify-center gap-2 bg-primary hover:bg-primaryDark disabled:opacity-70 disabled:cursor-not-allowed text-onPrimary py-3 rounded-lg font-medium transition shadow-md hover:shadow-lg focus:ring-4 focus:ring-primaryLight">
							{loading ? "Creating account..." : "Sign Up"}
							{!loading && <ArrowRight className="w-4 h-4" />}
						</button>
					</form>

					{/* Footer */}
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
	);
}
