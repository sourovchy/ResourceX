"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
	ArrowLeft,
	Save,
	Lock,
	UploadCloud,
	UserCircle,
	Eye,
	EyeOff,
} from "lucide-react";

export default function EditProfilePage() {
	const [name, setName] = useState("Arif Hossain");
	const [submitted, setSubmitted] = useState(false);
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitted(true);
		setTimeout(() => setSubmitted(false), 3000);
	};

	return (
		<div className="max-w-2xl mx-auto space-y-6 pb-20">
			<Link
				href="/profile"
				className="inline-flex items-center gap-2 text-sm font-semibold text-textSecondary hover:text-primary transition-colors">
				<ArrowLeft className="w-4 h-4" /> Back to Profile
			</Link>

			<h1 className="text-2xl font-bold text-textPrimary tracking-tight">
				Edit Profile
			</h1>

			<form
				onSubmit={handleSubmit}
				className="bg-surface border border-borderLight p-6 md:p-8 rounded-2xl shadow-sm space-y-8">
				{submitted && (
					<div className="bg-successLight text-success px-4 py-3 rounded-xl text-sm font-bold flex justify-center">
						Changes saved successfully!
					</div>
				)}

				<div className="flex flex-col items-center gap-4 border-b border-borderLight pb-8">
					<div className="relative group cursor-pointer">
						<div className="w-24 h-24 bg-primaryLight text-primary rounded-full flex items-center justify-center font-extrabold text-3xl overflow-hidden border-2 border-primary border-transparent group-hover:border-primary transition-colors">
							{name.charAt(0)}
						</div>
						<div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
							<UploadCloud className="w-6 h-6 text-white" />
						</div>
					</div>
					<div className="text-sm font-bold text-primary hover:underline cursor-pointer">
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
							value={name}
							onChange={(e) => setName(e.target.value)}
							type="text"
							className="w-full px-4 py-3 bg-surface border border-borderLight rounded-xl text-md text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
							required
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2 opacity-60">
							<label className="text-sm font-bold text-textPrimary flex items-center gap-2">
								Campus Email <Lock className="w-3 h-3" />
							</label>
							<input
								value="arif@student.bracu.ac.bd"
								type="email"
								className="w-full px-4 py-3 bg-surfaceVariant border border-borderLight rounded-xl text-md text-primary cursor-not-allowed"
								readOnly
							/>
						</div>
						<div className="space-y-2 opacity-60">
							<label className="text-sm font-bold text-textPrimary flex items-center gap-2">
								Student ID <Lock className="w-3 h-3" />
							</label>
							<input
								value="22101234"
								type="text"
								className="w-full px-4 py-3 bg-surfaceVariant border border-borderLight rounded-xl text-md text-primary cursor-not-allowed"
								readOnly
							/>
						</div>
					</div>
					<p className="text-xs text-textSecondary">
						Email and Student ID cannot be changed as they are verified academic
						credentials.
					</p>
				</div>

				<div className="space-y-4 pt-4 border-t border-borderLight">
					<h2 className="text-sm font-bold uppercase tracking-wider text-textSecondary">
						Change Password
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-bold text-textPrimary">
								Current Password
							</label>
							<div className="relative">
								<input
									type={showCurrentPassword ? "text" : "password"}
									placeholder="••••••••"
									className="w-full px-4 py-3 bg-surface border border-borderLight rounded-xl text-sm text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowCurrentPassword(!showCurrentPassword)}
									className="absolute inset-y-0 right-0 pr-3 flex items-center text-textSecondary hover:text-primary transition-colors">
									{showCurrentPassword ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
							</div>
						</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-bold text-textPrimary">
								New Password
							</label>
							<div className="relative">
								<input
									type={showNewPassword ? "text" : "password"}
									placeholder="••••••••"
									className="w-full px-4 py-3 bg-surface border border-borderLight rounded-xl text-sm text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowNewPassword(!showNewPassword)}
									className="absolute inset-y-0 right-0 pr-3 flex items-center text-textSecondary hover:text-primary transition-colors">
									{showNewPassword ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
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
									placeholder="••••••••"
									className="w-full px-4 py-3 bg-surface border border-borderLight rounded-xl text-sm text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute inset-y-0 right-0 pr-3 flex items-center text-textSecondary hover:text-primary transition-colors">
									{showConfirmPassword ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
							</div>
						</div>
					</div>
				</div>

				<button
					type="submit"
					className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-primaryDark transition-colors mt-8 flex items-center justify-center gap-2">
					<Save className="w-5 h-5" /> Save Changes
				</button>
			</form>
		</div>
	);
}
