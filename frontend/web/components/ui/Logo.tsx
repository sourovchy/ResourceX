"use client";

import React, { useId } from "react";

interface LogoProps {
	className?: string;
	size?: number;
	showText?: boolean;
	/** Tailwind text-color class for the emblem (currentColor). Defaults to brand green. */
	colorClass?: string;
	/** Retained for API compatibility (inline SVG has no network load). */
	priority?: boolean;
}

/**
 * Branding source of truth.
 *
 * The R-X monogram is rendered inline as an SVG using `currentColor`, so it
 * adapts to the active theme (forest green in light, lifted green in dark) and
 * incurs no network request or load flash. The "ResourceX" wordmark always
 * comes from the adjacent text span — crisp, theme-adaptive, never duplicated.
 *
 * (`/icon.svg` remains the favicon; `/logo.svg` is the external full lockup.)
 */
function Emblem({
	size = 32,
	colorClass = "text-primary",
	className = "",
}: {
	size?: number;
	colorClass?: string;
	className?: string;
}) {
	// Unique clip-path ids so multiple emblems on one page never collide.
	const uid = useId().replace(/:/g, "");
	const mainId = `rx-main-${uid}`;
	const xLegId = `rx-xleg-${uid}`;
	return (
		<svg
			viewBox="0 0 373 373"
			width={size}
			height={size}
			role="img"
			aria-label="ResourceX"
			fill="none"
			className={`shrink-0 ${colorClass} ${className}`}
		>
			<defs>
				<clipPath id={mainId}>
					<rect x="76" y="46" width="250" height="266" />
				</clipPath>
				<clipPath id={xLegId}>
					<rect x="0" y="179" width="373" height="133" />
				</clipPath>
			</defs>
			<g
				stroke="currentColor"
				strokeWidth={32}
				strokeLinecap="butt"
				strokeLinejoin="miter"
			>
				<path
					d="M 92,330 L 92,62 L 192,62 L 192,102 L 92,202 L 222,332"
					clipPath={`url(#${mainId})`}
					fill="none"
				/>
				<line x1="130" y1="330" x2="300" y2="160" clipPath={`url(#${xLegId})`} />
			</g>
		</svg>
	);
}

/**
 * Square emblem only. Use where space is constrained: collapsed sidebar,
 * compact areas, etc.
 */
export function LogoIcon({
	className = "",
	size = 32,
	colorClass,
}: {
	className?: string;
	size?: number;
	colorClass?: string;
	priority?: boolean;
}) {
	return (
		<div
			className={`relative shrink-0 flex items-center justify-center ${className}`}
			style={{ width: size, height: size }}
		>
			<Emblem size={size} colorClass={colorClass} />
		</div>
	);
}

/**
 * Full lockup: emblem + "ResourceX" wordmark text.
 * Used for headers, footer, auth pages, and empty states.
 */
export function Logo({ className = "", size = 32, showText = true, colorClass }: LogoProps) {
	return (
		<div className={`flex items-center gap-2.5 min-w-0 ${className}`}>
			<Emblem size={size} colorClass={colorClass} />
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
export function LogoCompact({ className = "", size = 28, showText = true }: LogoProps) {
	return (
		<div className={`flex items-center gap-2 min-w-0 ${className}`}>
			<Emblem size={size} />
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
}: {
	collapsed: boolean;
	className?: string;
	size?: number;
	priority?: boolean;
}) {
	if (collapsed) {
		return <LogoIcon size={size} className={className} />;
	}
	return <Logo size={size} className={className} />;
}
