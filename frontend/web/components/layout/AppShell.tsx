"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { Sun, Moon, Menu, LogOut, X, ChevronDown } from "lucide-react";
import SidebarToggle from "./SidebarToggle";
import NotifBell from "@/components/misc/NotifBell";
import SafeImage from "@/components/ui/SafeImage";
import { getFileUrl } from "@/lib/api";
import { Logo, LogoIcon } from "@/components/ui/Logo";
import LogoNav from "./LogoNav";
import PageTransition from "./PageTransition";
import { type NavItem } from "@/config/nav";

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
	const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
	const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);

	// Auto-expand the group that contains the active route.
	useEffect(() => {
		setExpandedGroups((prev) => {
			const newExpanded = { ...prev };
			let changed = false;
			navItems.forEach((item) => {
				if (
					item.subItems?.some(
						(sub) => pathname === sub.href || pathname.startsWith(sub.href + "/"),
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

	const toggleGroup = (label: string, e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
	};

	const isMessagingRoute = pathname.startsWith("/inbox") || pathname.startsWith("/messages");

	const isActive = (href: string) =>
		pathname === href || pathname.startsWith(href + "/");

	const activeItem = useMemo(
		() => navItems.find((i) => isActive(i.href)),
		[pathname, navItems],
	);

	const sidebarW = collapsed ? 72 : 260;

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
					style={{ left: sidebarW + 8, top: tooltip.y }}
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

			{/* ══════════════════════════════════════════════
			    SIDEBAR — fixed on all viewports
			══════════════════════════════════════════════ */}
			<aside
				className={`
					fixed inset-y-0 left-0 z-40
					flex flex-col
					border-r border-border bg-surface
					transition-all duration-300 ease-in-out
					/* mobile: full-width drawer */
					w-[280px]
					${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
					/* desktop: always visible, width based on collapsed state */
					md:translate-x-0
					${collapsed ? "md:w-[72px]" : "md:w-[260px]"}
				`}
			>
				{/* Logo Header */}
				<div className={`flex h-14 shrink-0 items-center sm:h-16 transition-all duration-300 justify-between px-4 sm:px-6 ${collapsed ? "md:justify-center md:px-4" : ""}`}>
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
									className="md:hidden rounded-lg p-1.5 text-textSecondary hover:bg-surfaceVariant transition-colors"
								>
									<X className="h-5 w-5" />
								</button>
								<SidebarToggle collapsed={collapsed} onClick={() => setCollapsed(true)} />
							</div>
						</>
					)}
				</div>

				{/* Nav — scrolls independently; overflow-x: visible so tooltips escape */}
				<nav
					className="flex-1 overflow-y-auto overflow-x-visible px-3 py-2 space-y-0.5"
					style={{ overscrollBehavior: "contain" }}
				>
					{navItems.map(({ href, icon: Icon, label, subItems }) => {
						const hasSub = !!subItems && subItems.length > 0;
						// A group is active when its own route OR any child route matches.
						const childActive =
							hasSub &&
							subItems!.some(
								(sub) => pathname === sub.href || pathname.startsWith(sub.href + "/"),
							);
						const groupActive = isActive(href) || childActive;
						// Expanded when pinned open by a click OR while the group is hovered.
						const expanded =
							hasSub &&
							!collapsed &&
							(!!expandedGroups[label] || hoveredGroup === label);

						return (
							<div
								key={href}
								className="flex flex-col"
								onMouseEnter={() => hasSub && setHoveredGroup(label)}
								onMouseLeave={() => hasSub && setHoveredGroup((cur) => (cur === label ? null : cur))}
							>
								<div className="relative group/nav flex items-center w-full">
									<Link
										href={href}
										onClick={() => { if (!hasSub) setMobileSidebarOpen(false); }}
										onMouseEnter={(e) => showTooltip(e, label)}
										onMouseLeave={hideTooltip}
										className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-sm transition-all duration-200 ${
											groupActive
												? "bg-primaryLight text-primary font-semibold"
												: "font-medium text-textSecondary hover:bg-surfaceVariant hover:text-textPrimary"
										} ${collapsed ? "md:justify-center" : ""} ${hasSub && !collapsed ? "pr-10" : ""}`}
									>
										<Icon
											className={`h-5 w-5 shrink-0 transition-colors ${
												groupActive
													? "text-primary"
													: "text-textSecondary group-hover/nav:text-textPrimary"
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
											className={`absolute right-2 rounded-md p-1.5 transition-colors ${
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

								{/* Nested sub-items — animated height via grid-rows trick */}
								{hasSub && !collapsed && (
									<div
										className={`grid transition-all duration-300 ease-in-out ${
											expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
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
															className={`group/sub relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-all duration-200 ${
																subActive
																	? "bg-primaryLight/60 font-medium text-primary"
																	: "text-textSecondary hover:bg-surfaceVariant hover:text-textPrimary"
															}`}
														>
															{/* active accent on the indent rail */}
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
															<span className="truncate">{sub.label}</span>
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
				</nav>

				{/* Logout */}
				<div className="shrink-0 border-t border-divider p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
					<button
						type="button"
						onClick={logout}
						onMouseEnter={(e) => showTooltip(e, "Logout")}
						onMouseLeave={hideTooltip}
						className="w-full"
					>
						<div
							className={`flex items-center gap-3 rounded-xl p-3 text-error transition-colors hover:bg-errorLight ${
								collapsed ? "md:justify-center" : "justify-start"
							}`}
						>
							<LogOut className="h-5 w-5" />
							<span
								className={`whitespace-nowrap transition-all duration-300 ${
									collapsed
										? "md:opacity-0 md:w-0 md:overflow-hidden"
										: "opacity-100"
								}`}
							>
								Logout
							</span>
						</div>
					</button>
				</div>
			</aside>

			{/* ══════════════════════════════════════════════
			    RIGHT PANEL — offset by sidebar, full height
			══════════════════════════════════════════════ */}
			<div
				className={`flex min-w-0 flex-1 flex-col h-full transition-all duration-300 ${
					collapsed ? "md:ml-[72px]" : "md:ml-[260px]"
				}`}
			>
				{/* HEADER — sits at the top of the right panel, never scrolls */}
				<header className="shrink-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface/80 px-3 backdrop-blur-md sm:h-16 sm:px-4 md:px-6">
					<div className="flex min-w-0 items-center gap-2 sm:gap-4">
						{/* Mobile menu button and logo */}
						<div className="flex items-center gap-2 md:gap-0">
							<button
								onClick={() => setMobileSidebarOpen(true)}
								aria-label="Open sidebar"
								className="rounded-lg p-2 text-textSecondary transition-colors hover:bg-surfaceVariant md:hidden"
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
							className="rounded-full p-2.5 text-textSecondary transition-all hover:bg-surfaceVariant"
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
							className="flex items-center gap-2 pl-1 sm:pl-2 group"
						>
							<div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-primary/10 text-sm font-bold text-primary transition-all group-hover:ring-4 ring-primary/10">
								{user?.avatarUrl ? (
									<SafeImage
										src={getFileUrl(user.avatarUrl)}
										alt={user.name ?? "Profile"}
										fill
										className="object-cover"
										sizes="36px"
									/>
								) : (
									(user?.name?.charAt(0).toUpperCase() ?? "?")
								)}
							</div>
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
					className={`flex-1 bg-background flex flex-col ${isMessagingRoute ? "overflow-hidden" : "overflow-y-auto"}`}>
					{isMessagingRoute ? (
						children
					) : (
						<div className="flex min-h-full flex-col">
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
