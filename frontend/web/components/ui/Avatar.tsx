import React from "react";
import SafeImage from "@/components/ui/SafeImage";

function initialOf(name?: string | null): string {
	const ch = name?.trim()?.charAt(0);
	return ch ? ch.toUpperCase() : "?";
}

function defaultTextClass(size: number): string {
	if (size <= 24) return "text-[9px]";
	if (size <= 32) return "text-xs";
	if (size <= 44) return "text-sm";
	if (size <= 72) return "text-lg";
	return "text-3xl";
}

export type AvatarProps = {
	/** Raw avatar URL (relative or absolute). Resolved by SafeImage — do NOT pre-call getFileUrl. */
	src?: string | null;
	/** Display name — drives the initials fallback and the image alt text. */
	name?: string | null;
	/** Square edge length in px. Default 40. */
	size?: number;
	/** Extra container classes (borders, rings, shadow, etc.). */
	className?: string;
	/** Background + text color for the initials fallback. */
	bgClass?: string;
	/** Corner radius. Default fully round. */
	rounded?: string;
	/** Override the auto-derived initials font size. */
	textClass?: string;
	/** Optional overlay (e.g. a verified/role badge) pinned bottom-right. */
	badge?: React.ReactNode;
};

/**
 * Canonical user avatar: a square container that shows the user's image
 * (via SafeImage, with automatic placeholder fallback) or their initial.
 */
export default function Avatar({
	src,
	name,
	size = 40,
	className = "",
	bgClass = "bg-primaryLight text-primary",
	rounded = "rounded-full",
	textClass,
	badge,
}: AvatarProps) {
	return (
		<div
			className={`relative flex shrink-0 items-center justify-center overflow-hidden font-bold ${rounded} ${bgClass} ${textClass ?? defaultTextClass(size)} ${className}`}
			style={{ width: size, height: size }}
		>
			{src ? (
				<SafeImage
					src={src}
					alt={name ?? "Avatar"}
					fill
					className="object-cover"
					sizes={`${size}px`}
				/>
			) : (
				initialOf(name)
			)}
			{badge && (
				<span className="absolute bottom-0 right-0 z-10">{badge}</span>
			)}
		</div>
	);
}
