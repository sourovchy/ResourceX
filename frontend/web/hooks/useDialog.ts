"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
	'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessibility + UX wiring for modals / drawers:
 * - locks body scroll while open
 * - moves focus into the dialog on open and restores it to the trigger on close
 * - traps Tab focus inside the dialog
 * - closes on Escape
 *
 * Returns a ref to attach to the dialog's content container.
 */
export function useDialog({
	open,
	onClose,
	closeOnEsc = true,
	trapFocus = true,
}: {
	open: boolean;
	onClose: () => void;
	closeOnEsc?: boolean;
	/** Disable for drawers that host a nested dialog (e.g. inbox info → block confirm). */
	trapFocus?: boolean;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const previouslyFocused = useRef<HTMLElement | null>(null);

	// Keep mutable refs to avoid re-triggering the focus management effect when these change
	const handlersRef = useRef({ onClose, closeOnEsc, trapFocus });
	useEffect(() => {
		handlersRef.current = { onClose, closeOnEsc, trapFocus };
	}, [onClose, closeOnEsc, trapFocus]);

	useEffect(() => {
		if (!open) return;

		previouslyFocused.current = document.activeElement as HTMLElement | null;

		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		// Focus the first focusable element (or the container itself).
		const node = ref.current;
		const firstFocusable = node?.querySelector<HTMLElement>(FOCUSABLE);
		(firstFocusable ?? node)?.focus();

		const onKeyDown = (e: KeyboardEvent) => {
			const { onClose: latestOnClose, closeOnEsc: latestCloseOnEsc, trapFocus: latestTrapFocus } = handlersRef.current;

			if (latestCloseOnEsc && e.key === "Escape") {
				e.stopPropagation();
				latestOnClose();
				return;
			}
			if (latestTrapFocus && e.key === "Tab" && node) {
				const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
				if (items.length === 0) {
					e.preventDefault();
					return;
				}
				const first = items[0];
				const last = items[items.length - 1];
				const active = document.activeElement;
				if (e.shiftKey && (active === first || active === node)) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && active === last) {
					e.preventDefault();
					first.focus();
				}
			}
		};

		document.addEventListener("keydown", onKeyDown, true);

		return () => {
			document.removeEventListener("keydown", onKeyDown, true);
			document.body.style.overflow = prevOverflow;
			previouslyFocused.current?.focus?.();
		};
	}, [open]);

	return ref;
}
