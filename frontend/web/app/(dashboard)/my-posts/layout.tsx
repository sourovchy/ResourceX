"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MY_POSTS_NAV = [
    { href: "/my-posts", label: "My Listings", exact: true },
    { href: "/my-posts/active-rentals", label: "Active Rentals" },
    { href: "/my-posts/requests", label: "Rental Requests" },
    { href: "/my-posts/earnings", label: "Earnings" },
];

export default function MyPostsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const isActive = (href: string, exact: boolean | undefined) =>
        exact
            ? pathname === href
            : pathname === href || pathname.startsWith(href + "/");

    return (
        <div className="space-y-4">
            <div className="flex overflow-x-auto border-b border-borderLight [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {MY_POSTS_NAV.map(({ href, label, exact }) => {
                    const active = isActive(href, exact);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`px-3 py-3 text-sm font-semibold whitespace-nowrap transition-colors sm:px-4 ${
                                active
                                    ? "border-b-2 border-primary text-primary"
                                    : "text-textSecondary hover:text-textPrimary"
                            }`}>
                            {label}
                        </Link>
                    );
                })}
            </div>
            {children}
        </div>
    );
}
