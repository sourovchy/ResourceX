"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRoleSwitch } from "@/hooks/useRoleSwitch";

const DISPUTES_NAV = [
    { href: "/disputes", label: "Overview", exact: true },
    { href: "/disputes/my", label: "My Disputes" },
    { href: "/disputes/raise", label: "Raise a Dispute" },
];

export default function DisputesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { isPrivileged, loading } = useRoleSwitch();

    const isActive = (href: string, exact?: boolean) =>
        exact
            ? pathname === href
            : pathname === href || pathname.startsWith(href + "/");

    if (loading || isPrivileged) {
        return <>{children}</>;
    }

    return (
        <div className="space-y-4">
            <div className="flex overflow-x-auto border-b border-borderLight [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {DISPUTES_NAV.map(({ href, label, exact }) => {
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
