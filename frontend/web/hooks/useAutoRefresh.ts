"use client";

import { useEffect, useRef } from "react";

interface AutoRefreshOptions {
	/** Poll every N ms (only while the tab is visible). Omit for focus-only refresh. */
	intervalMs?: number;
	/** Gate the whole behavior (e.g. pause while a modal/edit form is open). Default true. */
	enabled?: boolean;
	/** Refetch when the tab/window regains focus. Default true. */
	refetchOnFocus?: boolean;
	/** Minimum gap between focus-triggered refetches, to avoid alt-tab spam. Default 8s. */
	focusThrottleMs?: number;
}

/**
 * Centralized, lightweight auto-refresh.
 *
 * Initial load and route changes are already handled by each page's own mount
 * effect (Next.js remounts the page component on navigation), so this hook is
 * purely additive: it transparently refetches on window/tab focus (throttled)
 * and, optionally, on a polling interval that only fires while the tab is
 * visible — never wasting requests in a backgrounded tab.
 *
 * Keep one source of truth for "when to refetch" instead of duplicating
 * listeners and timers across every page.
 *
 * @example
 * useAutoRefresh(() => fetchBookings(pageIndex), { intervalMs: 45_000 });
 */
export function useAutoRefresh(
	refetch: () => void | Promise<void>,
	{
		intervalMs,
		enabled = true,
		refetchOnFocus = true,
		focusThrottleMs = 8_000,
	}: AutoRefreshOptions = {},
) {
	// Keep the latest closure without re-subscribing listeners every render.
	const refetchRef = useRef(refetch);
	refetchRef.current = refetch;
	const lastRunRef = useRef(0);

	useEffect(() => {
		if (!enabled) return;

		const run = () => {
			lastRunRef.current = Date.now();
			void refetchRef.current();
		};

		const onFocus = () => {
			if (document.visibilityState === "hidden") return;
			if (Date.now() - lastRunRef.current < focusThrottleMs) return;
			run();
		};

		let intervalId: ReturnType<typeof setInterval> | undefined;
		if (intervalMs && intervalMs > 0) {
			intervalId = setInterval(() => {
				// Don't poll a backgrounded tab.
				if (document.visibilityState === "visible") run();
			}, intervalMs);
		}

		if (refetchOnFocus) {
			window.addEventListener("focus", onFocus);
			document.addEventListener("visibilitychange", onFocus);
		}

		return () => {
			if (intervalId) clearInterval(intervalId);
			window.removeEventListener("focus", onFocus);
			document.removeEventListener("visibilitychange", onFocus);
		};
	}, [enabled, intervalMs, refetchOnFocus, focusThrottleMs]);
}
