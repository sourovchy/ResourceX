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
    <div className="flex flex-col min-h-[calc(100vh-64px)] space-y-4 sm:space-y-6 lg:space-y-8">
      {showNav && (
        <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md flex items-center border-b border-borderLight px-2 sm:px-4 lg:px-8">
          {/* Scrollable tab strip */}
          <div className="flex flex-1 gap-2 sm:gap-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1">
            {MY_POSTS_NAV.map(({ href, label, exact }) => {
              const active = isActive(href, exact);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`whitespace-nowrap px-4 py-3 text-sm font-semibold transition-all hover:bg-surfaceVariant/50 rounded-t-xl border-b-2 sm:text-base ${
                    active
                      ? "border-primary text-primary bg-primaryLight/10"
                      : "border-transparent text-textSecondary hover:text-textPrimary"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
