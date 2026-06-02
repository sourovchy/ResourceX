"use client";

import React, { ReactNode, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Smart brand link.
 *
 * - When the user is NOT on the dashboard → navigates to /dashboard (soft route
 *   transition handled by <PageTransition/>).
 * - When the user IS already on /dashboard → never hard-reloads; instead it
 *   smooth-scrolls the content area to the top and gives the logo a brief pulse.
 */
export default function LogoNav({
	children,
	className = "",
	onNavigate,
}: {
	children: ReactNode;
	className?: string;
	onNavigate?: () => void;
}) {
	const pathname = usePathname();
	const router = useRouter();
	const [pulse, setPulse] = useState(false);

	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		// Allow modifier/middle clicks to open in a new tab naturally.
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
		e.preventDefault();

		if (pathname === "/dashboard") {
			document
				.getElementById("app-scroll")
				?.scrollTo({ top: 0, behavior: "smooth" });
			// Restart the pulse even on rapid repeat clicks.
			setPulse(false);
			requestAnimationFrame(() => setPulse(true));
			window.setTimeout(() => setPulse(false), 480);
		} else {
			onNavigate?.();
			router.push("/dashboard");
		}
	};

	return (
		<a
			href="/dashboard"
			onClick={handleClick}
			aria-label="ResourceX — go to dashboard"
			className={`${className} ${pulse ? "logo-pulse" : ""}`}>
			{children}
		</a>
	);
}
