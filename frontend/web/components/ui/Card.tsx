"use client";

import React from "react";
import { TiltCard } from "@/components/ui/TiltCard";

export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Adds hover lift + pointer affordance (for clickable cards). */
	interactive?: boolean;
	padding?: CardPadding;
	maxTilt?: number;
}

const PADDING_CLASSES: Record<CardPadding, string> = {
	none: "",
	sm: "p-4",
	md: "p-6",
	lg: "p-6 sm:p-8",
};

/**
 * Standardized surface card — cream/white surface, green-pale hairline border,
 * soft radius. Use for every panel/card instead of re-declaring chrome inline.
 * Interactive cards automatically get the TiltCard effect.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
	(
		// Motion hierarchy: dashboard / utility cards default to a
		// barely-perceptible 1° tilt. Hero / showcase usages should
		// opt-in to a higher value explicitly via the `maxTilt` prop.
		{ interactive = false, padding = "md", maxTilt = 1, className = "", children, ...props },
		ref,
	) => {
		const baseClass = `rounded-2xl border border-borderLight bg-surface shadow-[0_1px_2px_-1px_rgba(31,71,54,0.08),0_8px_24px_-12px_rgba(31,71,54,0.12)]
			${PADDING_CLASSES[padding]}
			${interactive ? "transition-all duration-300 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-6px_rgba(31,71,54,0.22)]" : ""}
			${className}`.trim();

		if (interactive) {
			return (
				<TiltCard
					ref={ref}
					maxTilt={maxTilt}
					className={baseClass}
					{...props}
				>
					{children}
				</TiltCard>
			);
		}

		return (
			<div ref={ref} className={baseClass} {...props}>
				{children}
			</div>
		);
	},
);

Card.displayName = "Card";

export default Card;
