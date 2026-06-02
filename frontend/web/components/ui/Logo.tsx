"use client";

import React from "react";
import Image from "next/image";

interface LogoProps {
	className?: string;
	size?: number;
	showText?: boolean;
	/** Opt-in eager loading for above-the-fold placements (auth / landing heroes). */
	priority?: boolean;
}

/**
 * Branding source of truth.
 *
 * `/icon.svg` is the transparent, coral monogram emblem (no baked-in wordmark).
 * It is the only image rendered in-app, so the "ResourceX" wordmark always comes
 * from the adjacent text span — crisp, theme-adaptive, and never duplicated.
 * (`/logo.svg` is the full lockup *with* text — reserved for external/large use.)
 */

/**
 * Square emblem only. Use where space is constrained: collapsed sidebar,
 * compact areas, etc.
 */
export function LogoIcon({
	className = "",
	size = 32,
	priority = false,
}: {
	className?: string;
	size?: number;
	priority?: boolean;
}) {
	return (
		<div
			className={`relative shrink-0 flex items-center justify-center ${className}`}
			style={{ width: size, height: size }}>
			<Image
				src="/icon.svg"
				alt="ResourceX"
				width={size}
				height={size}
				className="object-contain"
				priority={priority}
			/>
		</div>
	);
}

/**
 * Full lockup: emblem + "ResourceX" wordmark text.
 * Used for headers, footer, auth pages, and empty states.
 */
export function Logo({ className = "", size = 32, showText = true, priority = false }: LogoProps) {
	return (
		<div className={`flex items-center gap-2.5 min-w-0 ${className}`}>
			<div
				className="relative shrink-0 flex items-center justify-center"
				style={{ width: size, height: size }}>
				<Image
					src="/icon.svg"
					alt="ResourceX"
					width={size}
					height={size}
					className="object-contain"
					priority={priority}
				/>
			</div>
			{showText && (
				<span className="whitespace-nowrap text-lg font-black tracking-tight text-textPrimary">
					ResourceX
				</span>
			)}
		</div>
	);
}

/**
 * Reduced-width lockup: smaller emblem + a label hidden on the smallest screens.
 */
export function LogoCompact({ className = "", size = 28, showText = true, priority = false }: LogoProps) {
	return (
		<div className={`flex items-center gap-2 min-w-0 ${className}`}>
			<div
				className="relative shrink-0 flex items-center justify-center"
				style={{ width: size, height: size }}>
				<Image
					src="/icon.svg"
					alt="ResourceX"
					width={size}
					height={size}
					className="object-contain"
					priority={priority}
				/>
			</div>
			{showText && (
				<span className="hidden sm:inline whitespace-nowrap text-sm font-bold tracking-tight text-textPrimary">
					ResourceX
				</span>
			)}
		</div>
	);
}

/**
 * Switches automatically between collapsed (emblem only) and expanded
 * (emblem + wordmark) layouts.
 */
export function ResponsiveLogo({
	collapsed,
	className = "",
	size = 32,
	priority = false,
}: {
	collapsed: boolean;
	className?: string;
	size?: number;
	priority?: boolean;
}) {
	if (collapsed) {
		return <LogoIcon size={size} className={className} priority={priority} />;
	}
	return <Logo size={size} className={className} priority={priority} />;
}
