"use client";

import React, { useEffect, useRef, useState } from "react";

export interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Transition delay in ms — use for staggered grids (i * 100). */
	delay?: number;
	/** Initial offset direction. Defaults to "up". */
	from?: "up" | "down" | "left" | "right" | "none";
}

/**
 * Scroll-triggered reveal wrapper (IntersectionObserver, fires once).
 * Styles live in globals.css under `.reveal`; reduced-motion users see
 * content immediately via the media query there.
 */
export function Reveal({
	delay = 0,
	from = "up",
	className = "",
	children,
	style,
	...props
}: RevealProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [revealed, setRevealed] = useState(false);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;

		if (!("IntersectionObserver" in window)) {
			setRevealed(true);
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					setRevealed(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			className={`reveal reveal-${from} ${revealed ? "is-revealed" : ""} ${className}`}
			style={{ ...style, ["--reveal-delay" as string]: `${delay}ms` }}
			{...props}
		>
			{children}
		</div>
	);
}

export default Reveal;
