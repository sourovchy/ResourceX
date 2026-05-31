"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const BORROW_NAV = [
	{ href: "/borrow", label: "All Items", exact: true },
	{ href: "/borrow/wishlist", label: "Wishlist" },
];

// These sub-paths are flows, not browse tabs — hide the nav strip on them
const HIDE_NAV_PREFIXES = ["/borrow/book/", "/borrow/review/"];

export default function BorrowLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	const isActive = (href: string, exact?: boolean) =>
		exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

	const showNav = !HIDE_NAV_PREFIXES.some((prefix) => pathname.startsWith(prefix));

	return (
		<div className="space-y-4 sm:space-y-6">
			{showNav && (
				<div className="flex overflow-x-auto border-b border-borderLight [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					{BORROW_NAV.map(({ href, label, exact }) => {
						const active = isActive(href, exact);
						return (
							<Link
								key={href}
								href={href}
								className={`whitespace-nowrap px-3 py-3 text-sm font-semibold transition-colors sm:px-4 ${
									active
										? "border-b-2 border-primary text-primary"
										: "text-textSecondary hover:text-textPrimary"
								}`}>
								{label}
							</Link>
						);
					})}
				</div>
			)}
			{children}
		</div>
	);
}
