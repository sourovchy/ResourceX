"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { Sun, Moon, Menu, LogOut, X } from "lucide-react";
import SidebarToggle from "./SidebarToggle";
import NotifBell from "@/components/misc/NotifBell";
import SafeImage from "@/components/ui/SafeImage";
import { getFileUrl } from "@/lib/api";
import { Logo, LogoIcon } from "@/components/ui/Logo";
import LogoNav from "./LogoNav";
import PageTransition from "./PageTransition";

interface TooltipState {
	label: string;
	y: number;
}

export default function AppShell({
	children,
	navItems,
}: {
	children: React.ReactNode;
	navItems: any[];
	role?: "admin" | "student" | "moderator" | "super_admin";
}) {
	const pathname = usePathname();
	const { theme, toggleTheme } = useTheme();
	const { user, logout } = useAuth();
	const [collapsed, setCollapsed] = useState(true);
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
	const [tooltip, setTooltip] = useState<TooltipState | null>(null);

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
					className="flex-1 overflow-y-auto overflow-x-visible px-3 space-y-1 pb-4"
					style={{ overscrollBehavior: "contain" }}
				>
					{navItems.map(({ href, icon: Icon, label }) => {
						const active = isActive(href);
						return (
							<Link
								key={href}
								href={href}
								onClick={() => setMobileSidebarOpen(false)}
								onMouseEnter={(e) => showTooltip(e, label)}
								onMouseLeave={hideTooltip}
								className="block"
							>
								<div
									className={`flex w-full items-center gap-3 rounded-xl p-3 transition-all duration-200 ${
										active
											? "bg-primaryLight text-primary font-medium"
											: "text-textSecondary hover:bg-surfaceVariant hover:text-textPrimary"
									} ${collapsed ? "md:justify-center" : "justify-start"}`}
								>
									<Icon
										className={`h-5 w-5 shrink-0 ${active ? "text-primary" : ""}`}
									/>
									<span
										className={`whitespace-nowrap transition-all duration-300 ${
											collapsed
												? "md:opacity-0 md:w-0 md:overflow-hidden"
												: "opacity-100"
										}`}
									>
										{label}
									</span>
								</div>
							</Link>
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
