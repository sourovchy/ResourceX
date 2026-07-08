"use client";

import React from "react";

/**
 * Shared form-field primitives.
 *
 * - `Field`   — label + optional hint + error-message chrome around any control
 *               (`Input`, `Textarea`, `Select`, `SearchableCombobox`, …).
 * - `Input`   — text/number/etc. input with standardized focus + error styling.
 * - `Textarea`— same styling, non-resizing by default.
 *
 * Use these instead of re-declaring `<label>` / `<input>` class strings inline
 * so spacing, focus rings and validation UI stay identical across every form.
 */

const FIELD_INPUT_BASE =
	"w-full rounded-xl border bg-surface px-4 py-3 text-sm text-textPrimary transition focus:outline-none focus:ring-1";

const fieldStateClasses = (error?: boolean) =>
	error
		? "border-error focus:border-error focus:ring-error"
		: "border-borderLight focus:border-primary focus:ring-primary";

/** Compose the canonical input class string (exported for the rare custom control). */
export function inputClassName(error?: boolean, extra = "") {
	return `${FIELD_INPUT_BASE} ${fieldStateClasses(error)} ${extra}`.trim();
}

export interface FieldProps {
	label?: React.ReactNode;
	htmlFor?: string;
	required?: boolean;
	/** Field-level validation message; also drives error styling when used with Input/Textarea. */
	error?: string | null;
	/** Helper text rendered between the label and the control. */
	hint?: React.ReactNode;
	className?: string;
	children: React.ReactNode;
}

export function Field({
	label,
	htmlFor,
	required,
	error,
	hint,
	className = "",
	children,
}: FieldProps) {
	return (
		<div className={`space-y-2 ${className}`.trim()}>
			{label && (
				<label
					htmlFor={htmlFor}
					className="block text-sm font-bold text-textPrimary"
				>
					{label}
					{required && <span className="text-error"> *</span>}
				</label>
			)}
			{hint && <p className="text-xs text-textSecondary">{hint}</p>}
			{children}
			{error && <p className="text-xs text-error">{error}</p>}
		</div>
	);
}

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ error, className = "", ...props }, ref) => (
		<input ref={ref} className={inputClassName(error, className)} {...props} />
	),
);
Input.displayName = "Input";

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ error, className = "", ...props }, ref) => (
		<textarea
			ref={ref}
			className={inputClassName(error, `resize-none ${className}`.trim())}
			{...props}
		/>
	),
);
Textarea.displayName = "Textarea";
