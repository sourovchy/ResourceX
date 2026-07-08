"use client";

import React, { useEffect, useRef, useState } from "react";

export interface CountUpProps {
	/** Target number to count to. */
	value: number;
	/** Animation duration in ms. */
	duration?: number;
	className?: string;
}

/**
 * Animates a number from its previous value to `value` once scrolled into
 * view (and again whenever `value` changes, e.g. after data loads).
 * Reduced-motion users see the final value immediately.
 */
export function CountUp({ value, duration = 900, className }: CountUpProps) {
	const ref = useRef<HTMLSpanElement>(null);
	const [display, setDisplay] = useState(0);
	const [inView, setInView] = useState(false);
	const displayRef = useRef(0);
	displayRef.current = display;

	useEffect(() => {
		const node = ref.current;
		if (!node || !("IntersectionObserver" in window)) {
			setInView(true);
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					setInView(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.3 },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!inView) return;

		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (prefersReduced || value === displayRef.current) {
			setDisplay(value);
			return;
		}

		const from = displayRef.current;
		const start = performance.now();
		let frame: number;

		const tick = (now: number) => {
			const t = Math.min((now - start) / duration, 1);
			const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
			setDisplay(Math.round(from + (value - from) * eased));
			if (t < 1) frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [inView, value, duration]);

	return (
		<span ref={ref} className={className}>
			{display.toLocaleString()}
		</span>
	);
}

export default CountUp;
