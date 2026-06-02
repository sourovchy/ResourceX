"use client";

import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Soft route transition. Re-keys on pathname change so the `page-enter`
 * keyframe (fade + subtle slide-up, defined in globals.css) replays on every
 * navigation. Uses opacity/transform only and is disabled under
 * prefers-reduced-motion.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	return (
		<div key={pathname} className="page-enter flex flex-1 flex-col">
			{children}
		</div>
	);
}
