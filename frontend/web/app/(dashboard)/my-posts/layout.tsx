"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MY_POSTS_NAV = [
  { href: "/my-posts", label: "My Listings", exact: true },
  { href: "/my-posts/active-rentals", label: "Active Rentals" },
  { href: "/my-posts/requests", label: "Requests" },
  { href: "/my-posts/earnings", label: "Earnings" },
  { href: "/my-posts/deposit-tracker", label: "Deposits" },
];

// Focused form pages — hide the sub-nav so the form gets full attention
const HIDE_NAV_PREFIXES = ["/my-posts/add", "/my-posts/edit/"];

export default function MyPostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");

  const showNav = !HIDE_NAV_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <div className="space-y-4 sm:space-y-6">
      {showNav && (
        <div className="flex items-center border-b border-borderLight">
          {/* Scrollable tab strip */}
          <div className="flex flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {MY_POSTS_NAV.map(({ href, label, exact }) => {
              const active = isActive(href, exact);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`whitespace-nowrap px-3 py-3 text-sm font-semibold transition-colors sm:px-4 ${
                    active
                      ? "border-b-2 border-primary text-primary"
                      : "text-textSecondary hover:text-textPrimary"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
