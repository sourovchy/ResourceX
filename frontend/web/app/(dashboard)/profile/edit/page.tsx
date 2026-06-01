"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	Save,
	Lock,
	UploadCloud,
	Eye,
	EyeOff,
	Loader2,
	CheckCircle2
} from "lucide-react";
import api, { getFileUrl } from "@/lib/api";
import { isPasswordStrong, validatePhone, normalizePhone } from "@/lib/validation";
import { useAuth } from "@/context/AuthContext";
import { useImageUpload } from "@/hooks/useImageUpload";

type UserProfile = {
	userId?: number;
	name: string;
	email: string;
	studentId: string;
	phone: string;
	avatarUrl?: string | null;
	roles?: string[];
};

const STAFF_ROLES = ["ROLE_SUPER_ADMIN", "ROLE_ADMIN", "ROLE_MODERATOR"];

export default function EditProfilePage() {
	const router = useRouter();
	const { roles } = useAuth();

	const isStaff = useMemo(
		() => roles?.some((r) => STAFF_ROLES.includes(r)) ?? false,
		[roles],
	);
	const isStudent = !isStaff;

	const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);
	const [profile, setProfile] = useState<UserProfile>({
		name: "",
		email: "",
		studentId: "",
		phone: "",
		avatarUrl: null,
	});

	const {
		previews: avatarPreviews,
		setPreviews: setAvatarPreviews,
		uploadAll: uploadAvatar,
		uploading: uploadingAvatar,
	} = useImageUpload({ purpose: "PROFILE_IMAGE", maxFiles: 1, maxSizeMB: 2 });

	const [profileCurrentPassword, setProfileCurrentPassword] = useState("");

	const [passwordForm, setPasswordForm] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const [loading, setLoading] = useState(true);

	// Separate saving states
	const [savingProfile, setSavingProfile] = useState(false);
	const [savingPassword, setSavingPassword] = useState(false);

	const [profileError, setProfileError] = useState("");
	const [profileSuccess, setProfileSuccess] = useState(false);

	const [passwordError, setPasswordError] = useState("");
	const [passwordSuccess, setPasswordSuccess] = useState(false);

	const [showProfilePassword, setShowProfilePassword] = useState(false);
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	useEffect(() => {
		const loadProfile = async () => {
			setLoading(true);
			setProfileError("");

			try {
				const res = await api.get<UserProfile>("/users/me");

				const studentId =
					(res.data as any)?.studentProfile?.studentId ??
					(res.data as any)?.studentId ??
					"";

				const phone =
					(res.data as any)?.studentProfile?.phone ??
					(res.data as any)?.phone ??
					"";

				const loadedProfile = {
					name: res.data.name ?? "",
					email: res.data.email ?? "",
					studentId: studentId,
					phone: phone,
					avatarUrl: (res.data as any)?.avatarUrl ?? null,
				};

				setOriginalProfile(loadedProfile);
				setProfile(loadedProfile);
			} catch (err: any) {
				const status = err?.response?.status;

				if (status === 401) {
					router.push("/auth/login");
					return;
				}

				setProfileError(
					err?.response?.data?.message ||
						"Could not load your profile. Please try again.",
				);
			} finally {
				setLoading(false);
			}
		};

		loadProfile();
	}, [router]);

	// For students: phone changed requires password. Staff: email changed requires password.
	const isPhoneChanged = useMemo(() => {
		if (!originalProfile || !isStudent) return false;
		return profile.phone !== originalProfile.phone;
	}, [profile, originalProfile, isStudent]);

	const isEmailChanged = useMemo(() => {
		if (!originalProfile || !isStaff) return false;
		return profile.email !== originalProfile.email;
	}, [profile, originalProfile, isStaff]);

	const requiresPasswordVerification = isPhoneChanged || isEmailChanged;

	const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			setProfileError("Avatar must be an image file");
			return;
		}

		if (file.size > 2 * 1024 * 1024) {
			setProfileError("Avatar image must be under 2 MB");
			return;
		}

		setProfileError("");

		// Revoke previous blob URL before replacing
		const prev = avatarPreviews[0];
		if (prev?.file && prev.url.startsWith("blob:")) {
			URL.revokeObjectURL(prev.url);
		}
		setAvatarPreviews([{ file, url: URL.createObjectURL(file) }]);
	}, [avatarPreviews, setAvatarPreviews]);

	const handleProfileSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!profile.name.trim()) {
			setProfileError("Full name is required");
			return;
		}

		if (profile.name.length > 50) {
			setProfileError("Full name must be under 50 characters");
			return;
		}

		if (requiresPasswordVerification && !profileCurrentPassword) {
			setProfileError(
				isPhoneChanged
					? "Current password is required to change your phone number."
					: "Current password is required to change your email address.",
			);
			return;
		}

		setProfileError("");
		setSavingProfile(true);

		try {
			let uploadedAvatarUrl = profile.avatarUrl;

			// Upload avatar if a new file was selected
			if (avatarPreviews[0]?.file) {
				const urls = await uploadAvatar();
				if (urls[0]) {
					uploadedAvatarUrl = urls[0];
				} else {
					throw new Error("Failed to upload avatar. Please try again.");
				}
			}

			// Build the update payload based on role
			const payload: Record<string, any> = {
				name: profile.name.trim(),
			};

			if (uploadedAvatarUrl) {
				payload.avatarUrl = uploadedAvatarUrl;
			}

			// Staff: can change email (no phone — not in their DB schema)
			if (isStaff) {
				if (isEmailChanged) {
					payload.email = profile.email.trim();
					payload.currentPassword = profileCurrentPassword;
				}
			}

			// Students: can change phone (no email change allowed)
			if (isStudent) {
				if (!validatePhone(profile.phone)) {
					setProfileError("Please enter a valid Bangladesh mobile number (e.g., 01XXXXXXXXX)");
					setSavingProfile(false);
					return;
				}
				payload.phone = normalizePhone(profile.phone.trim());
				if (isPhoneChanged) {
					payload.currentPassword = profileCurrentPassword;
				}
			}

			const res = await api.put<UserProfile>("/users/me", payload);

			const updatedStudentId =
				(res.data as any)?.studentProfile?.studentId ??
				(res.data as any)?.studentId ??
				"";

			const updatedPhone =
				(res.data as any)?.studentProfile?.phone ??
				(res.data as any)?.phone ??
				"";

			const newlySavedProfile = {
				name: res.data.name ?? "",
				email: res.data.email ?? "",
				studentId: updatedStudentId,
				phone: updatedPhone,
				avatarUrl: (res.data as any)?.avatarUrl ?? null,
			};

			setProfile(newlySavedProfile);
			setOriginalProfile(newlySavedProfile);
			setProfileCurrentPassword("");
			setAvatarPreviews([]);
			setProfileSuccess(true);
			setTimeout(() => setProfileSuccess(false), 2500);
		} catch (err: any) {
			setProfileError(
				err?.response?.data?.message ||
					err?.message ||
					"Could not save profile changes. Please try again.",
			);
		} finally {
			setSavingProfile(false);
		}
	};

	const handlePasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setPasswordError("");

		if (!passwordForm.currentPassword.trim()) {
			setPasswordError("Current password is required");
			return;
		}
		if (!passwordForm.newPassword.trim()) {
			setPasswordError("New password is required");
			return;
		}
		if (!isPasswordStrong(passwordForm.newPassword)) {
			setPasswordError("New password must meet all strength requirements");
			return;
		}
		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			setPasswordError("New password and confirmation do not match");
			return;
		}

		setSavingPassword(true);

		try {
			await api.put("/users/me/password", {
				currentPassword: passwordForm.currentPassword,
				newPassword: passwordForm.newPassword
			});

			setPasswordForm({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});

			setPasswordSuccess(true);
			setTimeout(() => setPasswordSuccess(false), 2500);
		} catch (err: any) {
			setPasswordError(
				err?.response?.data?.message ||
					"Could not update password. Please check your current password and try again.",
			);
		} finally {
			setSavingPassword(false);
		}
	};

	const avatarInitial = profile.name?.trim()?.charAt(0)?.toUpperCase() || "U";

	if (loading) {
		return (
			<div className="mx-auto max-w-3xl space-y-6 px-4 pb-20 sm:px-6 lg:px-8">
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
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full space-y-8 px-4 pb-20 sm:px-6 lg:px-8">
			<div className="space-y-2">
				
				<h1 className="text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
					Account Settings
				</h1>
			</div>

			{/* ──── Profile Information Form ──── */}
			<form
				onSubmit={handleProfileSubmit}
				className="space-y-8 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6 md:p-8">

				<div className="border-b border-borderLight pb-4">
					<h2 className="text-lg font-bold text-textPrimary">Profile Information</h2>
					<p className="text-sm text-textSecondary">Update your personal details and photo.</p>
				</div>

				{profileSuccess && (
					<div className="flex items-center gap-2 rounded-xl bg-successLight px-4 py-3 text-sm font-bold text-success">
						<CheckCircle2 className="h-5 w-5" /> Profile updated successfully!
					</div>
				)}

				{profileError && (
					<div className="break-words rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						{profileError}
					</div>
				)}

				{/* Avatar Upload */}
				<div className="flex flex-col items-center gap-4 border-b border-borderLight pb-6 sm:pb-8">
					<label className="group relative cursor-pointer">
						<div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-transparent bg-primaryLight text-2xl font-extrabold text-primary transition-colors group-hover:border-primary sm:h-24 sm:w-24 sm:text-3xl">
							{avatarPreviews[0]?.url || profile.avatarUrl ? (
								<img
									src={avatarPreviews[0]?.url || (profile.avatarUrl ? getFileUrl(profile.avatarUrl) : "")}
									alt="Profile avatar"
									className="h-full w-full object-cover"
								/>
							) : (
								avatarInitial
							)}
						</div>

						<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
							{uploadingAvatar ? (
								<Loader2 className="h-5 w-5 animate-spin text-white sm:h-6 sm:w-6" />
							) : (
								<UploadCloud className="h-5 w-5 text-white sm:h-6 sm:w-6" />
							)}
						</div>

						<input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
					</label>

					<div className="text-center text-sm font-bold text-primary">
						{avatarPreviews[0]?.file?.name ?? "Change Avatar / Photo"}
					</div>
				</div>

				{/* Editable Fields */}
				<div className="space-y-6">
					{/* Full Name — always editable */}
					<div className="space-y-2">
						<label className="text-sm font-bold text-textPrimary">
							Full Name
						</label>
						<input
							value={profile.name}
							onChange={(e) => setProfile({ ...profile, name: e.target.value })}
							type="text"
							className="w-full rounded-xl border border-borderLight bg-surface px-3 py-3 sm:px-4 text-md text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
							maxLength={50}
							required
						/>
					</div>

					{/* Role-specific fields */}
					{isStudent ? (
						<>
							{/* Student ID — read-only */}
							<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
								<div className="space-y-2 overflow-hidden opacity-70">
									<label className="flex items-center gap-2 text-sm font-bold text-textPrimary">
										Student ID <Lock className="h-3 w-3" />
									</label>
									<input
										value={profile.studentId}
										type="text"
										className="w-full cursor-not-allowed overflow-hidden text-ellipsis rounded-xl border border-borderLight bg-surfaceVariant px-4 py-3 text-sm text-primary"
										readOnly
										disabled
									/>
								</div>

								{/* Email — read-only for students */}
								<div className="space-y-2 overflow-hidden opacity-70">
									<label className="flex items-center gap-2 text-sm font-bold text-textPrimary">
										Email Address <Lock className="h-3 w-3" />
									</label>
									<input
										value={profile.email}
										type="email"
										className="w-full cursor-not-allowed overflow-hidden text-ellipsis rounded-xl border border-borderLight bg-surfaceVariant px-4 py-3 text-sm text-primary"
										readOnly
										disabled
									/>
								</div>
							</div>

							{/* Phone Number — editable for students */}
							<div className="space-y-2">
								<label className="text-sm font-bold text-textPrimary">
									Phone Number
								</label>
								<input
									value={profile.phone}
									onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
									type="tel"
									placeholder="+1234567890"
									className="w-full rounded-xl border border-borderLight bg-surface px-3 py-3 sm:px-4 text-md text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</div>

							<p className="break-words text-xs leading-relaxed text-textSecondary">
								Student ID and email cannot be changed as they are verified academic
								credentials.
							</p>
						</>
					) : (
						<>
							{/* Email — editable for staff */}
							<div className="space-y-2">
								<label className="text-sm font-bold text-textPrimary">
									Email Address
								</label>
								<input
									value={profile.email}
									onChange={(e) => setProfile({ ...profile, email: e.target.value })}
									type="email"
									className="w-full rounded-xl border border-borderLight bg-surface px-3 py-3 sm:px-4 text-md text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									required
								/>
							</div>
						</>
					)}

					{/* Security verification prompt — shown when email or phone changed */}
					{requiresPasswordVerification && (
						<div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
							<p className="text-sm font-semibold text-amber-800 mb-3">
								Security Verification Required
							</p>
							<p className="text-xs text-amber-700 mb-4">
								{isPhoneChanged
									? "You are changing your phone number. Please enter your current password to confirm."
									: "You are changing your email address. Please enter your current password to confirm."}
							</p>
							<div className="relative">
								<input
									type={showProfilePassword ? "text" : "password"}
									value={profileCurrentPassword}
									onChange={(e) => setProfileCurrentPassword(e.target.value)}
									placeholder="Current Password"
									className="w-full rounded-xl border border-amber-300 bg-white px-3 py-3 sm:px-4 pr-10 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
								/>
								<button
									type="button"
									onClick={() => setShowProfilePassword(!showProfilePassword)}
									className="absolute inset-y-0 right-0 flex items-center pr-3 text-textSecondary transition-colors hover:text-primary"
								>
									{showProfilePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</button>
							</div>
						</div>
					)}
				</div>

				<div className="flex justify-end pt-4">
					<button
						type="submit"
						disabled={savingProfile}
						className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-70"
					>
						{savingProfile ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								{uploadingAvatar ? "Uploading photo..." : "Saving..."}
							</>
						) : uploadingAvatar ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Uploading photo...
							</>
						) : (
							<>
								<Save className="h-4 w-4" /> Save Profile
							</>
						)}
					</button>
				</div>
			</form>

			{/* ──── Security / Password Form ──── */}
			<form
				onSubmit={handlePasswordSubmit}
				className="space-y-8 rounded-2xl border border-borderLight bg-surface p-4 shadow-sm sm:p-6 md:p-8">

				<div className="border-b border-borderLight pb-4">
					<h2 className="text-lg font-bold text-textPrimary">Security</h2>
					<p className="text-sm text-textSecondary">Update your account password.</p>
				</div>

				{passwordSuccess && (
					<div className="flex items-center gap-2 rounded-xl bg-successLight px-4 py-3 text-sm font-bold text-success">
						<CheckCircle2 className="h-5 w-5" /> Password updated successfully!
					</div>
				)}

				{passwordError && (
					<div className="break-words rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						{passwordError}
					</div>
				)}

				<div className="space-y-6">
					<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
						<div className="space-y-2">
							<label className="text-sm font-bold text-textPrimary">
								Current Password
							</label>
							<div className="relative">
								<input
									type={showCurrentPassword ? "text" : "password"}
									value={passwordForm.currentPassword}
									onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
									placeholder="••••••••"
									className="w-full rounded-xl border border-borderLight bg-surface px-3 py-3 sm:px-4 pr-10 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									maxLength={128}
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
									value={passwordForm.newPassword}
									onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
									placeholder="••••••••"
									className="w-full rounded-xl border border-borderLight bg-surface px-3 py-3 sm:px-4 pr-10 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									maxLength={128}
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
									value={passwordForm.confirmPassword}
									onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
									placeholder="••••••••"
									className="w-full rounded-xl border border-borderLight bg-surface px-3 py-3 sm:px-4 pr-10 text-sm text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									maxLength={128}
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

					<div className="rounded-2xl border border-borderLight bg-surfaceVariant px-4 py-4 text-sm">
						<p className="font-medium text-textPrimary mb-2">Password requirements</p>
						<ul className="space-y-1 text-textSecondary text-xs">
							<li>• At least 8 characters long</li>
							<li>• Includes uppercase and lowercase letters</li>
							<li>• Includes at least one number</li>
							<li>• Includes at least one special character</li>
						</ul>
					</div>
				</div>

				<div className="flex justify-end pt-4">
					<button
						type="submit"
						disabled={savingPassword}
						className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-70"
					>
						{savingPassword ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" /> Updating...
							</>
						) : (
							<>
								<Lock className="h-4 w-4" /> Update Password
							</>
						)}
					</button>
				</div>
			</form>
		</div>
	);
}
