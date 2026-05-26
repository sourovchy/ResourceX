"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	ArrowLeft,
	Save,
	Lock,
	UploadCloud,
	Eye,
	EyeOff,
	Loader2,
} from "lucide-react";
import api from "@/lib/api";

type UserProfile = {
	userId?: number;
	name: string;
	email: string;
	studentId: string;
	avatarUrl?: string | null;
};

export default function EditProfilePage() {
	const router = useRouter();

	const [profile, setProfile] = useState<UserProfile>({
		name: "",
		email: "",
		studentId: "",
		avatarUrl: null,
	});

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [submitted, setSubmitted] = useState(false);

	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	useEffect(() => {
		const loadProfile = async () => {
			setLoading(true);
			setError("");

			try {
				const res = await api.get<UserProfile>("/users/me");

				// backend returns `studentProfile` nested inside the user response
				const studentId =
					(res.data as any)?.studentProfile?.studentId ??
					(res.data as any)?.studentId ??
					"";

				setProfile({
					name: res.data.name ?? "",
					email: res.data.email ?? "",
					studentId: studentId,
					avatarUrl: (res.data as any)?.avatarUrl ?? null,
				});
			} catch (err: any) {
				const status = err?.response?.status;

				if (status === 401) {
					router.push("/auth/login");
					return;
				}

				setError(
					err?.response?.data?.message ||
						"Could not load your profile. Please try again.",
				);
			} finally {
				setLoading(false);
			}
		};

		loadProfile();
	}, [router]);

	const validate = () => {
		if (!profile.name.trim()) return "Full name is required";

		const passwordTouched =
			currentPassword.trim() || newPassword.trim() || confirmPassword.trim();

		if (passwordTouched) {
			if (!currentPassword.trim()) return "Current password is required";
			if (!newPassword.trim()) return "New password is required";
			if (newPassword.length < 8)
				return "New password must be at least 8 characters";
			if (newPassword !== confirmPassword)
				return "New password and confirmation do not match";
		}

		return "";
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const errMsg = validate();
		if (errMsg) {
			setError(errMsg);
			return;
		}

		setError("");
		setSaving(true);

		try {
			// Only send supported fields (name/phone). Password change is not handled by this endpoint.
			const payload: Record<string, any> = {
				name: profile.name.trim(),
			};

			const res = await api.put<UserProfile>("/users/me", payload);

			setProfile({
				name: res.data.name ?? "",
				email: res.data.email ?? "",
				studentId: res.data.studentId ?? "",
				avatarUrl: res.data.avatarUrl ?? null,
			});

			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");

			setSubmitted(true);
			setTimeout(() => setSubmitted(false), 2500);
		} catch (err: any) {
			setError(
				err?.response?.data?.message ||
					"Could not save changes. Please try again.",
			);
		} finally {
			setSaving(false);
		}
	};

	const avatarInitial = profile.name?.trim()?.charAt(0)?.toUpperCase() || "U";

	if (loading) {
		return (
			<div className="mx-auto max-w-2xl space-y-6 px-4 pb-20 sm:px-6 lg:px-8">
				<div className="h-5 w-40 animate-pulse rounded bg-surfaceVariant" />
				<div className="h-8 w-56 animate-pulse rounded bg-surfaceVariant" />
				<div className="rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6 md:p-8">
					<div className="space-y-6">
						<div className="flex flex-col items-center gap-4 border-b border-borderLight pb-6 sm:pb-8">
							<div className="h-20 w-20 animate-pulse rounded-full bg-surfaceVariant sm:h-24 sm:w-24" />
							<div className="h-4 w-36 animate-pulse rounded bg-surfaceVariant" />
						</div>
						<div className="h-12 animate-pulse rounded-xl bg-surfaceVariant" />
						<div className="h-12 animate-pulse rounded-xl bg-surfaceVariant" />
						<div className="h-12 animate-pulse rounded-xl bg-surfaceVariant" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-2xl space-y-6 px-4 pb-20 sm:px-6 lg:px-8">
			<Link
				href="/profile"
				className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary transition-colors hover:text-primary">
				<ArrowLeft className="h-4 w-4" /> Back to Profile
			</Link>

			<h1 className="text-xl font-bold tracking-tight text-textPrimary sm:text-2xl">
				Edit Profile
			</h1>

			<form
				onSubmit={handleSubmit}
				className="space-y-8 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6 md:p-8">
				{submitted && (
					<div className="flex justify-center rounded-xl bg-successLight px-4 py-3 text-center text-sm font-bold text-success">
						Changes saved successfully!
					</div>
				)}

				{error && (
					<div className="break-words rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						{error}
					</div>
				)}

				<div className="flex flex-col items-center gap-4 border-b border-borderLight pb-6 sm:pb-8">
					<div className="group relative cursor-pointer">
						<div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-transparent bg-primaryLight text-2xl font-extrabold text-primary transition-colors group-hover:border-primary sm:h-24 sm:w-24 sm:text-3xl">
							{profile.avatarUrl ? (
								<img
									src={profile.avatarUrl}
									alt="Profile avatar"
									className="h-full w-full object-cover"
								/>
							) : (
								avatarInitial
							)}
						</div>

						<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
							<UploadCloud className="h-5 w-5 text-white sm:h-6 sm:w-6" />
						</div>
					</div>

					<div className="cursor-pointer text-center text-sm font-bold text-primary hover:underline">
						Change Avatar / Photo
					</div>
				</div>

				<div className="space-y-4">
					<h2 className="text-sm font-bold uppercase tracking-wider text-textSecondary">
						Personal Information
					</h2>

					<div className="space-y-2">
						<label className="text-sm font-bold text-textPrimary">
							Full Name
						</label>
						<input
							value={profile.name}
							onChange={(e) => setProfile({ ...profile, name: e.target.value })}
							type="text"
							className="w-full rounded-xl border border-borderLight bg-surface px-3 py-3 sm:px-4 text-md text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
							required
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
						<div className="space-y-2 overflow-hidden opacity-70">
							<label className="flex items-center gap-2 text-sm font-bold text-textPrimary">
								Campus Email <Lock className="h-3 w-3" />
							</label>
							<input
								value={profile.email}
								type="email"
								className="w-full cursor-not-allowed overflow-hidden text-ellipsis rounded-xl border border-borderLight bg-surfaceVariant px-4 py-3 text-sm text-primary"
								readOnly
							/>
						</div>

						<div className="space-y-2 overflow-hidden opacity-70">
							<label className="flex items-center gap-2 text-sm font-bold text-textPrimary">
								Student ID <Lock className="h-3 w-3" />
							</label>
							<input
								value={profile.studentId}
								type="text"
								className="w-full cursor-not-allowed overflow-hidden text-ellipsis rounded-xl border border-borderLight bg-surfaceVariant px-4 py-3 text-sm text-primary"
								readOnly
							/>
						</div>
					</div>

					<p className="break-words text-xs leading-relaxed text-textSecondary">
						Email and Student ID cannot be changed as they are verified academic
						credentials.
					</p>
				</div>

				<div className="space-y-4 border-t border-borderLight pt-4">
					<h2 className="text-sm font-bold uppercase tracking-wider text-textSecondary">
						Change Password
					</h2>

					<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
						<div className="space-y-2">
							<label className="text-sm font-bold text-textPrimary">
								Current Password
							</label>
							<div className="relative">
								<input
									type={showCurrentPassword ? "text" : "password"}
									value={currentPassword}
									onChange={(e) => setCurrentPassword(e.target.value)}
									placeholder="••••••••"
									className="w-full rounded-xl border border-borderLight bg-surface px-3 py-3 sm:px-4 pr-10 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								/>
								<button
									type="button"
									onClick={() => setShowCurrentPassword(!showCurrentPassword)}
									className="absolute inset-y-0 right-0 flex items-center pr-3 text-textSecondary transition-colors hover:text-primary"
								>
									{showCurrentPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
						<div className="space-y-2">
							<label className="text-sm font-bold text-textPrimary">
								New Password
							</label>
							<div className="relative">
								<input
									type={showNewPassword ? "text" : "password"}
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									placeholder="••••••••"
									className="w-full rounded-xl border border-borderLight bg-surface px-3 py-3 sm:px-4 pr-10 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								/>
								<button
									type="button"
									onClick={() => setShowNewPassword(!showNewPassword)}
									className="absolute inset-y-0 right-0 flex items-center pr-3 text-textSecondary transition-colors hover:text-primary"
								>
									{showNewPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-bold text-textPrimary">
								Confirm New Password
							</label>
							<div className="relative">
								<input
									type={showConfirmPassword ? "text" : "password"}
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									placeholder="••••••••"
									className="w-full rounded-xl border border-borderLight bg-surface px-3 py-3 sm:px-4 pr-10 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute inset-y-0 right-0 flex items-center pr-3 text-textSecondary transition-colors hover:text-primary"
								>
									{showConfirmPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>
					</div>
				</div>

				<button
					type="submit"
					disabled={saving}
					className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-70 sm:py-4 sm:text-base"
				>
					{saving ? (
						<>
							<Loader2 className="h-5 w-5 animate-spin" /> Saving...
						</>
					) : (
						<>
							<Save className="h-5 w-5" /> Save Changes
						</>
					)}
				</button>
			</form>
		</div>
	);
}
