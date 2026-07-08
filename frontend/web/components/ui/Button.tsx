import React from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "ghost" | "danger" | "subtle";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	loading?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	/** Stretch to fill the container width. */
	fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
	// Forest-green pill — the canonical CTA.
	primary:
		"bg-primary text-onPrimary hover:bg-primaryDark focus-visible:ring-primary/40 shadow-sm",
	// Outlined ghost on cream.
	ghost:
		"bg-transparent text-primary border border-primary/30 hover:bg-primaryLight focus-visible:ring-primary/30",
	// Destructive.
	danger:
		"bg-error text-white hover:bg-errorDark focus-visible:ring-error/40 shadow-sm",
	// Quiet neutral action.
	subtle:
		"bg-surface text-textPrimary border border-border hover:bg-surfaceVariant focus-visible:ring-primary/30",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
	sm: "px-4 py-2 text-xs gap-1.5",
	md: "px-6 py-3 text-sm gap-2",
	lg: "px-8 py-4 text-base gap-2.5",
};

/**
 * Shared button class string — use on non-`<button>` elements (e.g. a `<Link>`)
 * that should look like a Button, instead of re-implementing the styles inline.
 */
export function buttonClasses(
	variant: ButtonVariant = "primary",
	size: ButtonSize = "md",
	extra = "",
	fullWidth = false,
): string {
	return `inline-flex items-center justify-center rounded-full font-bold italic
		transition-all duration-200 ease-out outline-none
			enabled:hover:-translate-y-[1px] enabled:hover:shadow-md enabled:active:translate-y-0 enabled:active:scale-[0.96]
		focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background
		disabled:cursor-not-allowed disabled:opacity-50
		${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? "w-full" : ""} ${extra}`.trim();
}

/**
 * Standardized button primitive — pill-shaped, JetBrains-Mono, italic CTA.
 * Use everywhere instead of re-implementing inline button styles.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			variant = "primary",
			size = "md",
			loading = false,
			leftIcon,
			rightIcon,
			fullWidth = false,
			disabled,
			className = "",
			children,
			...props
		},
		ref,
	) => {
		const isDisabled = disabled || loading;
		return (
			<button
				ref={ref}
				disabled={isDisabled}
				className={buttonClasses(variant, size, className, fullWidth)}
				{...props}
			>
				{loading ? (
					<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
				) : (
					leftIcon
				)}
				{children}
				{!loading && rightIcon}
			</button>
		);
	},
);

Button.displayName = "Button";

export default Button;
