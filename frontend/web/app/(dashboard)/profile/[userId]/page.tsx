"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
	AlertTriangle,
	Building2,
	CheckCircle2,
	GraduationCap,
	Loader2,
	Mail,
	MessageSquare,
	Package,
	Phone,
	Shield,
	Tag,
} from "lucide-react";
import api, { getFileUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import SafeImage from "@/components/ui/SafeImage";
import MessageModal from "@/components/misc/MessageModal";

// ── Helpers ────────────────────────────────────────────────────────────────────

function trustBadgeClass(score: number | null): string {
	if (score == null) return "bg-outlineVariant text-textSecondary";
	if (score >= 90) return "bg-successLight text-successDark";
	if (score >= 75) return "bg-primaryLight text-primaryDark";
	if (score >= 60) return "bg-warningLight text-warningDark";
	return "bg-errorLight text-error";
}

function trustLabel(score: number | null): string {
	if (score == null) return "";
	if (score >= 90) return "Excellent";
	if (score >= 75) return "Good";
	if (score >= 60) return "Fair";
	if (score >= 40) return "Warning";
	return "Suspended";
}

// ── Types ─────────────────────────────────────────────────────────────────────

type PublicItem = {
	itemId: number;
	title: string;
	dailyRate: number | null;
	imageUrls: string[];
	category: string | null;
	status: string;
};

type ProfileInfo = {
	userId: number;
	name: string;
	email?: string | null;
	phone?: string | null;
	status?: string | null;
	emailVerified: boolean;
	trustScore: number | null;
	university: string | null;
	department: string | null;
	avatarUrl?: string | null;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function PublicProfilePage({
	params,
}: {
	params: { userId: string };
}) {
	const { user: me } = useAuth();
	const targetId = Number(params.userId);

	const [profile, setProfile] = useState<ProfileInfo | null>(null);
	const [items, setItems] = useState<PublicItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [messageOpen, setMessageOpen] = useState(false);

	const isOwnProfile = me?.userId === targetId;

	useEffect(() => {
		if (!targetId) return;
		let active = true;
		setLoading(true);
		setError(null);

		Promise.all([
			api.get(`/users/${targetId}`),
			api.get(`/items/user/${targetId}`),
		])
			.then(([userRes, itemsRes]) => {
				if (!active) return;
				
				const u = userRes.data;
				setProfile({
					userId: u.userId ?? targetId,
					name: u.name ?? "Unknown User",
					email: u.email,
					phone: u.studentProfile?.phone,
					status: u.status,
					emailVerified: u.studentProfile?.emailVerified ?? false,
					trustScore: u.studentProfile?.trustScore ?? null,
					university: u.studentProfile?.university ?? null,
					department: u.studentProfile?.department ?? null,
					avatarUrl: u.avatarUrl,
				});

				const raw: any[] = Array.isArray(itemsRes.data)
					? itemsRes.data
					: itemsRes.data?.content ?? [];

				setItems(
					raw
						.filter((i) => i.status === "AVAILABLE")
						.map((i) => ({
							itemId: Number(i.itemId ?? i.id),
							title: String(i.title ?? "Untitled"),
							dailyRate: i.dailyRate != null ? Number(i.dailyRate) : null,
							imageUrls: Array.isArray(i.imageUrls) ? i.imageUrls : [],
							category: i.category ? String(i.category) : null,
							status: String(i.status ?? "AVAILABLE"),
						})),
				);
			})
			.catch((err) => {
				if (!active) return;
				console.error("Profile fetch error:", err);
				setError("Could not load this profile. Please try again.");
			})
			.finally(() => {
				if (active) setLoading(false);
			});

		return () => {
			active = false;
		};
	}, [targetId]);

	// ── Loading ────────────────────────────────────────────────────────────────
	if (loading) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
				<p className="text-sm text-textSecondary">Loading profile…</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="mx-auto max-w-md px-4 py-20 text-center">
				<AlertTriangle className="mx-auto mb-3 h-10 w-10 text-error" />
				<p className="font-semibold text-textPrimary">Profile unavailable</p>
				<p className="mt-1 text-sm text-textSecondary">{error}</p>
				<Link
					href="/borrow"
					className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primaryDark">
					Browse Items
				</Link>
			</div>
		);
	}

	// ── Main ────────────────────────────────────────────────────────────────────
	return (
		<>
			<div className="w-full space-y-5 px-3 pb-20 sm:space-y-6 sm:px-0">
				{/* Profile header card */}
				<div className="rounded-2xl border border-borderLight bg-surface p-5 shadow-sm sm:p-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						{/* Avatar + name block */}
						<div className="flex items-center gap-4">
							<div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primaryLight text-2xl font-extrabold text-primary">
								{profile?.avatarUrl ? (
									<SafeImage
										src={getFileUrl(profile.avatarUrl)}
										alt={profile.name}
										fill
										className="object-cover"
										sizes="64px"
									/>
								) : (
									profile?.name?.charAt(0).toUpperCase() ?? "?"
								)}
							</div>
							<div>
								<div className="flex flex-wrap items-center gap-2">
									<h1 className="text-xl font-bold text-textPrimary">
										{profile?.name}
									</h1>
									{profile?.emailVerified && (
										<CheckCircle2
											className="h-5 w-5 text-success"
											aria-label="Verified member"
										/>
									)}
								</div>

								{/* Info */}
								<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-textSecondary">
									{profile?.university && (
										<span className="flex items-center gap-1">
											<Building2 className="h-3.5 w-3.5" />
											{profile.university}
										</span>
									)}
									{profile?.department && (
										<span className="flex items-center gap-1">
											<GraduationCap className="h-3.5 w-3.5" />
											{profile.department}
										</span>
									)}
									{profile?.email && (
										<span className="flex items-center gap-1">
											<Mail className="h-3.5 w-3.5" />
											{profile.email}
										</span>
									)}
									{profile?.phone && (
										<span className="flex items-center gap-1">
											<Phone className="h-3.5 w-3.5" />
											{profile.phone}
										</span>
									)}
								</div>
							</div>
						</div>

						{/* Trust + message */}
						<div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
							{profile?.trustScore != null && (
								<span
									className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold ${trustBadgeClass(profile.trustScore)}`}>
									<Shield className="h-4 w-4" />
									{profile.trustScore} · {trustLabel(profile.trustScore)}
								</span>
							)}

							{!isOwnProfile && (
								<button
									onClick={() => setMessageOpen(true)}
									className="flex items-center gap-1.5 rounded-xl border border-primary bg-primaryLight px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white">
									<MessageSquare className="h-4 w-4" />
									Message
								</button>
							)}

							{isOwnProfile && (
								<Link
									href="/profile/edit"
									className="rounded-xl border border-borderLight px-4 py-2 text-sm font-semibold text-textSecondary transition-colors hover:bg-surfaceVariant">
									Edit Profile
								</Link>
							)}
						</div>
					</div>
				</div>

				{/* Listings section */}
				<div>
					<div className="mb-3 flex items-center justify-between gap-3">
						<h2 className="flex items-center gap-2 text-base font-bold text-textPrimary">
							<Package className="h-5 w-5 text-primary" />
							Active Listings
							{items.length > 0 && (
								<span className="rounded-full bg-primaryLight px-2 py-0.5 text-xs font-bold text-primary">
									{items.length}
								</span>
							)}
						</h2>
					</div>

					{items.length === 0 ? (
						<div className="rounded-2xl border border-dashed border-borderLight bg-surface px-4 py-14 text-center">
							<Package className="mx-auto mb-2 h-8 w-8 text-outlineVariant" />
							<p className="text-sm font-semibold text-textSecondary">
								No active listings right now.
							</p>
						</div>
					) : (
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
							{items.map((item) => (
								<Link
									key={item.itemId}
									href={`/borrow/item/${item.itemId}`}
									className="group flex flex-col gap-2 overflow-hidden rounded-2xl border border-borderLight bg-surface p-3 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
									{/* Image */}
									<div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surfaceVariant">
										{item.imageUrls[0] ? (
											<SafeImage
												src={item.imageUrls[0]}
												alt={item.title}
												fill
												className="object-cover transition-transform duration-300 group-hover:scale-105"
												sizes="(max-width: 640px) 45vw, 30vw"
											/>
										) : (
											<div className="flex h-full items-center justify-center">
												<Tag className="h-8 w-8 text-outlineVariant" />
											</div>
										)}
									</div>

									{/* Info */}
									<div className="min-w-0">
										{item.category && (
											<p className="mb-0.5 truncate text-[10px] font-bold uppercase tracking-wider text-textSecondary">
												{item.category}
											</p>
										)}
										<p className="line-clamp-2 text-sm font-bold leading-tight text-textPrimary group-hover:text-primary">
											{item.title}
										</p>
										{item.dailyRate != null && (
											<p className="mt-1 text-xs font-semibold text-primary">
												৳&thinsp;{Number(item.dailyRate).toLocaleString()}/day
											</p>
										)}
									</div>
								</Link>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Message modal */}
			{!isOwnProfile && profile && (
				<MessageModal
					isOpen={messageOpen}
					targetUserId={profile.userId}
					targetName={profile.name}
					onClose={() => setMessageOpen(false)}
				/>
			)}
		</>
	);
}
