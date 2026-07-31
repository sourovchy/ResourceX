"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { Sun, Moon, Menu, LogOut, X, ChevronDown, Home } from "lucide-react";
import SidebarToggle from "./SidebarToggle";
import NotifBell from "@/components/misc/NotifBell";
import Avatar from "@/components/ui/Avatar";
import { Logo, LogoIcon } from "@/components/ui/Logo";
import LogoNav from "./LogoNav";
import PageTransition from "./PageTransition";
import { type NavItem } from "@/config/nav";
import { Background } from "@/components/ui/Background";

interface TooltipState {
  label: string;
  y: number;
}

export default function AppShell({
  children,
  navItems,
}: {
  children: React.ReactNode;
  navItems: NavItem[];
  role?: "admin" | "student" | "moderator" | "super_admin";
}) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);

  // Auto-expand the group that contains the active route.
  useEffect(() => {
    setExpandedGroups((prev) => {
      const newExpanded = { ...prev };
      let changed = false;
      navItems.forEach((item) => {
        if (
          item.subItems?.some(
            (sub) =>
              pathname === sub.href || pathname.startsWith(sub.href + "/"),
          ) &&
          !newExpanded[item.label]
        ) {
          newExpanded[item.label] = true;
          changed = true;
        }
      });
      return changed ? newExpanded : prev;
    });
  }, [pathname, navItems]);

  const groupedNavItems = useMemo(() => {
    const groups = navItems.reduce(
      (acc, item) => {
        const groupName = item.group || "Other";
        if (!acc[groupName]) acc[groupName] = [];
        acc[groupName].push(item);
        return acc;
      },
      {} as Record<string, NavItem[]>,
    );

    const order = [
      "Dashboard",
      "Resource Management",
      "Communication",
      "Account",
      "System",
      "Other",
    ];
    return order
      .map((group) => ({
        group,
        items: groups[group] || [],
      }))
      .filter((g) => g.items.length > 0);
  }, [navItems]);

  const toggleGroup = (label: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isMessagingRoute = pathname.startsWith("/inbox");

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const activeItem = useMemo(
    () =>
      navItems.find(
        (i) => pathname === i.href || pathname.startsWith(i.href + "/"),
      ),
    [pathname, navItems],
  );

  // Floating sidebar sits 12px in from the left edge; tooltips clear its
  // right edge (inset + panel width + gap).
  const sidebarW = collapsed ? 72 : 256;

  const showTooltip = (e: React.MouseEvent<HTMLElement>, label: string) => {
    if (!collapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ label, y: rect.top + rect.height / 2 });
  };
  const hideTooltip = () => setTooltip(null);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-textPrimary">
      {/* ── Floating tooltip portal (escapes all overflow containers) ── */}
      {collapsed && tooltip && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{ left: 12 + sidebarW + 12, top: tooltip.y }}
        >
          <div className="-translate-y-1/2 rounded-md bg-textPrimary px-3 py-1.5 text-xs font-medium text-background shadow-xl whitespace-nowrap">
            {tooltip.label}
          </div>
        </div>
      )}

      {/* ── Mobile overlay ── */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 md:hidden ${
          mobileSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileSidebarOpen(false)}
      />

      {/* ── Tablet drawer backdrop ──
          On tablet (md → <lg) the expanded sidebar overlays content like a
          drawer instead of pushing it, so page grids keep their full width.
          Clicking the backdrop collapses back to the icon rail. */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-30 hidden bg-black/40 transition-opacity duration-300 md:block lg:hidden"
          onClick={() => setCollapsed(true)}
          aria-hidden="true"
        />
      )}

      {/* ══════════════════════════════════════════════
			    SIDEBAR — fixed on all viewports
			══════════════════════════════════════════════ */}
      <aside
        className={`
					fixed z-40 flex flex-col overflow-hidden
					glass-panel
					transition-[transform,width,border-radius] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
					will-change-transform
					/* mobile: edge-anchored drawer that slides fully off-screen */
					inset-y-0 left-0 w-[284px] rounded-r-3xl
					${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
					/* desktop: a floating slab inset 12px from every edge */
					md:inset-y-3 md:left-3 md:translate-x-0 md:rounded-3xl
					${collapsed ? "md:w-[72px]" : "md:w-[256px]"}
				`}
      >
        {/* Logo Header */}
        <div
          className={`flex h-14 shrink-0 items-center sm:h-16 transition-all duration-300 justify-between px-4 sm:px-6 ${collapsed ? "md:justify-center md:px-4" : ""}`}
        >
          {collapsed ? (
            <div className="relative group/header flex items-center justify-center h-10 w-10">
              <LogoNav className="transition-opacity duration-200 group-hover/header:opacity-0 flex items-center justify-center">
                <LogoIcon size={32} />
              </LogoNav>
              <SidebarToggle
                collapsed={collapsed}
                onClick={() => setCollapsed(false)}
                className="absolute inset-0 opacity-0 group-hover/header:opacity-100 transition-opacity duration-200 flex items-center justify-center !block"
              />
            </div>
          ) : (
            <>
              <LogoNav className="flex items-center gap-2.5 min-w-0 transition-all duration-300">
                <Logo size={32} />
              </LogoNav>
              <div className="flex items-center">
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="md:hidden rounded-lg p-1.5 text-textSecondary hover:bg-surfaceVariant transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                  aria-label="Close sidebar"
                >
                  <X className="h-5 w-5" />
                </button>
                <SidebarToggle
                  collapsed={collapsed}
                  onClick={() => setCollapsed(true)}
                />
              </div>
            </>
          )}
        </div>

        {/* Nav — scrolls independently; overflow-x: visible so tooltips escape */}
        <nav
          className="flex-1 overflow-y-auto overflow-x-visible px-3 py-4 space-y-6"
          style={{ overscrollBehavior: "contain" }}
        >
          {groupedNavItems.map(({ group, items }, groupIndex) => (
            <div key={group} className="flex flex-col">
              {/* Group Header / Divider */}
              <div
                className={`mb-2 px-3 transition-all duration-300 flex items-center ${
                  collapsed ? "md:justify-center" : ""
                }`}
                aria-hidden="true"
              >
                <span
                  className={`text-xs font-semibold text-textTertiary uppercase tracking-wider ${
                    collapsed
                      ? "md:opacity-0 md:w-0 md:h-0 md:overflow-hidden"
                      : "opacity-100"
                  }`}
                >
                  {group}
                </span>
                {collapsed && groupIndex !== 0 && (
                  <div className="hidden md:block h-px w-6 bg-borderLight mx-auto" />
                )}
              </div>

              <div className="space-y-0.5">
                {items.map(({ href, icon: Icon, label, subItems }) => {
                  const hasSub = !!subItems && subItems.length > 0;
                  const childActive =
                    hasSub &&
                    subItems!.some(
                      (sub) =>
                        pathname === sub.href ||
                        pathname.startsWith(sub.href + "/"),
                    );
                  const groupActive = isActive(href) || childActive;
                  const expanded =
                    hasSub &&
                    !collapsed &&
                    (!!expandedGroups[label] || hoveredGroup === label);

                  return (
                    <div
                      key={href}
                      className="flex flex-col"
                      onMouseEnter={() => hasSub && setHoveredGroup(label)}
                      onMouseLeave={() =>
                        hasSub &&
                        setHoveredGroup((cur) => (cur === label ? null : cur))
                      }
                    >
                      <div className="relative group/nav flex items-center w-full">
                        <Link
                          href={href}
                          onClick={() => {
                            if (!hasSub) setMobileSidebarOpen(false);
                          }}
                          onMouseEnter={(e) => showTooltip(e, label)}
                          onMouseLeave={hideTooltip}
                          className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-sm transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-px active:translate-y-0 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                            groupActive
                              ? "nav-active text-primary font-semibold"
                              : "font-medium text-textSecondary hover:bg-surfaceVariant/70 hover:text-textPrimary hover:shadow-sm"
                          } ${collapsed ? "md:justify-center md:gap-0" : ""} ${hasSub && !collapsed ? "pr-10" : ""}`}
                          aria-current={groupActive ? "page" : undefined}
                        >
                          <Icon
                            className={`h-5 w-5 shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/nav:scale-110 ${
                              groupActive
                                ? "text-primary drop-shadow-[0_0_8px_rgb(var(--color-primary)/0.45)]"
                                : "text-textSecondary group-hover/nav:text-primary"
                            }`}
                          />
                          <span
                            className={`whitespace-nowrap truncate transition-all duration-300 ${
                              collapsed
                                ? "md:opacity-0 md:w-0 md:overflow-hidden"
                                : "opacity-100"
                            }`}
                          >
                            {label}
                          </span>
                        </Link>
                        {hasSub && !collapsed && (
                          <button
                            onClick={(e) => toggleGroup(label, e)}
                            aria-label={`${expanded ? "Collapse" : "Expand"} ${label}`}
                            aria-expanded={expanded}
                            className={`absolute right-2 rounded-md p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                              groupActive
                                ? "text-primary hover:bg-primary/10"
                                : "text-textTertiary hover:bg-borderLight hover:text-textPrimary"
                            }`}
                          >
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Nested sub-items */}
                      {hasSub && !collapsed && (
                        <div
                          className={`grid transition-all duration-300 ease-in-out ${
                            expanded
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="ml-[1.375rem] mt-0.5 flex flex-col gap-0.5 border-l border-borderLight pl-3">
                              {subItems!.map((sub) => {
                                const SubIcon = sub.icon;
                                const subActive =
                                  pathname === sub.href ||
                                  pathname.startsWith(sub.href + "/");
                                return (
                                  <Link
                                    key={sub.href}
                                    href={sub.href}
                                    onClick={() => setMobileSidebarOpen(false)}
                                    className={`group/sub relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                                      subActive
                                        ? "bg-primaryLight/60 font-medium text-primary shadow-sm"
                                        : "text-textSecondary hover:bg-surfaceVariant hover:text-textPrimary"
                                    }`}
                                    aria-current={
                                      subActive ? "page" : undefined
                                    }
                                  >
                                    {subActive && (
                                      <span className="absolute -left-[13px] top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                                    )}
                                    <SubIcon
                                      strokeWidth={1.75}
                                      className={`h-4 w-4 shrink-0 transition-colors ${
                                        subActive
                                          ? "text-primary"
                                          : "text-textTertiary group-hover/sub:text-textSecondary"
                                      }`}
                                    />
                                    <span className="truncate">
                                      {sub.label}
                                    </span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div
          className={`shrink-0 border-t border-divider p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center ${collapsed ? "md:justify-center justify-between" : "justify-between"}`}
        >
          <button
            type="button"
            onClick={logout}
            onMouseEnter={(e) => showTooltip(e, "Logout")}
            onMouseLeave={hideTooltip}
            className={`focus-visible:ring-2 focus-visible:ring-error focus-visible:outline-none rounded-xl flex items-center transition-colors hover:bg-errorLight text-error font-medium ${
              collapsed
                ? "md:w-10 md:h-10 md:justify-center p-2.5 md:p-0"
                : "p-2.5 justify-start gap-3"
            }`}
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span
              className={`whitespace-nowrap transition-all duration-300 ${
                collapsed
                  ? "md:opacity-0 md:w-0 md:overflow-hidden md:hidden"
                  : "opacity-100"
              }`}
            >
              Logout
            </span>
          </button>

          <Link
            href="/"
            onMouseEnter={(e) => showTooltip(e, "Back to Home")}
            onMouseLeave={hideTooltip}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-textSecondary transition-colors hover:bg-surfaceVariant hover:text-textPrimary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
              collapsed ? "md:hidden" : ""
            }`}
            aria-label="Back to Home"
          >
            <Home className="h-5 w-5" />
          </Link>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════
			    RIGHT PANEL — offset by sidebar, full height
			══════════════════════════════════════════════ */}
      <div
        className={`flex min-w-0 flex-1 flex-col h-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          collapsed ? "md:ml-[96px]" : "md:ml-[96px] lg:ml-[280px]"
        }`}
      >
        {/* HEADER — sits at the top of the right panel, never scrolls */}
        <header className="glass-panel relative z-20 mx-3 mt-3 flex h-14 shrink-0 items-center justify-between gap-3 rounded-2xl px-3 sm:h-16 sm:px-4 md:mx-4 md:mt-4 md:px-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            {/* Mobile menu button and logo */}
            <div className="flex items-center gap-2 md:gap-0">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open sidebar"
                className="rounded-lg p-2 text-textSecondary transition-colors hover:bg-surfaceVariant md:hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              >
                <Menu className="h-5 w-5" />
              </button>
              <LogoNav className="md:hidden flex items-center shrink-0">
                <LogoIcon size={28} />
              </LogoNav>
            </div>

            <h1 className="hidden min-w-0 truncate text-lg font-semibold text-textPrimary sm:block">
              {activeItem?.label || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-full p-2.5 text-textSecondary transition-all duration-200 hover:scale-110 hover:bg-surfaceVariant active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            <NotifBell />

            <div className="mx-1 h-6 w-px bg-divider sm:mx-2" />

            <Link
              href="/profile"
              className="flex items-center gap-2 pl-1 sm:pl-2 group focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-full"
              aria-label="User profile"
            >
              <Avatar
                src={user?.avatarUrl}
                name={user?.name}
                size={36}
                bgClass="bg-primary/10 text-primary"
                className="border border-primary/20 transition-all group-hover:ring-4 ring-primary/10"
              />
              {user && (
                <span className="hidden max-w-[8rem] truncate text-sm font-medium text-textSecondary lg:inline">
                  {user.name}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT — the only scrolling region */}
        <main
          id="app-scroll"
          className={`relative flex-1 bg-background flex flex-col ${isMessagingRoute ? "overflow-hidden" : "graph-grid overflow-y-auto"}`}
        >
          <Background />
          {isMessagingRoute ? (
            <div className="relative z-10 flex-1 flex flex-col overflow-hidden">{children}</div>
          ) : (
            <div className="flex min-h-full flex-col relative z-10">
              <div className="flex-1 px-3 py-4 sm:px-4 sm:py-6 md:px-6 flex flex-col">
                <div className="mx-auto w-full max-w-7xl flex-1 flex flex-col">
                  <PageTransition>{children}</PageTransition>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
