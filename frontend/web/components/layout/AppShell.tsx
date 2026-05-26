"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

import { Sun, Moon, Menu, LogOut, User, X } from "lucide-react";

const PRIVILEGED_ROLES = ["admin", "moderator", "super_admin"] as const;

function isPrivilegedRole(role: string) {
	return PRIVILEGED_ROLES.includes(role as (typeof PRIVILEGED_ROLES)[number]);
}

export default function AppShell({
	children,
	navItems,
	role,
}: {
	children: React.ReactNode;
	navItems: any[];
	role: "admin" | "student" | "moderator" | "super_admin";
}) {
	const pathname = usePathname();
	const { theme, toggleTheme } = useTheme();
	const { user, logout } = useAuth();
	const [collapsed, setCollapsed] = useState(true);
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

	const isActive = (href: string) =>
		pathname === href || pathname.startsWith(href + "/");

	const activeItem = useMemo(
		() => navItems.find((i) => isActive(i.href)),
		[pathname, navItems],
	);

	const toggleDesktopSidebar = () => {
		setCollapsed((prev) => !prev);
	};

	const openMobileSidebar = () => {
		setMobileSidebarOpen(true);
	};

	const closeMobileSidebar = () => {
		setMobileSidebarOpen(false);
	};

	return (
		<div className="relative flex min-h-screen bg-background text-textPrimary overflow-x-hidden">
			{/* Mobile overlay */}
			<div
				className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 md:hidden ${
					mobileSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
				}`}
				onClick={closeMobileSidebar}
			/>

			{/* SIDEBAR */}
			<aside
				className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-border bg-surface transition-transform duration-300 ease-in-out md:static md:z-auto md:w-auto md:translate-x-0 ${
					mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
				} ${collapsed ? "md:w-[72px]" : "md:w-[260px]"}`}>
				{/* Logo Section */}
				<div className="flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6 mb-2 sm:mb-4">
					<div className="flex items-center gap-3 min-w-0">
						<div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-onPrimary font-bold shrink-0">
							{isPrivilegedRole(role) ? "A" : "S"}
						</div>
						<span
							className={`font-bold text-lg tracking-tight transition-opacity duration-300 whitespace-nowrap ${
								collapsed ? "md:opacity-0 md:pointer-events-none md:w-0 md:overflow-hidden" : "opacity-100"
							}`}
						>
							ResourceX
						</span>
					</div>

					{/* Close Button for Mobile */}
					<button
						onClick={closeMobileSidebar}
						className="md:hidden rounded-lg p-1.5 text-textSecondary transition-colors hover:bg-surfaceVariant">
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Navigation */}
				<nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-4">
					{navItems.map(({ href, icon: Icon, label }) => {
						const active = isActive(href);
						return (
							<Link
								key={href}
								href={href}
								onClick={closeMobileSidebar}
								className="relative flex items-center group/item">
								<div
									className={`flex w-full items-center gap-3 rounded-xl p-3 transition-all duration-200 ${
										active
											? "bg-primaryLight text-primary font-medium"
											: "text-textSecondary hover:bg-surfaceVariant hover:text-textPrimary"
									} justify-start ${collapsed ? "md:justify-center" : ""}`}>
									<Icon
										className={`h-5 w-5 shrink-0 ${active ? "text-primary" : ""}`}
									/>
									<span
										className={`whitespace-nowrap ${
											collapsed ? "md:opacity-0 md:pointer-events-none md:w-0 md:overflow-hidden" : "opacity-100"
										}`}
									>
										{label}
									</span>
								</div>

								{/* Tooltip for collapsed desktop state */}
								{collapsed && (
									<div className="absolute left-16 scale-0 rounded-md bg-textPrimary px-3 py-2 text-xs font-medium text-background shadow-xl transition-all origin-left pointer-events-none whitespace-nowrap group-hover/item:scale-100 hidden md:block z-50">
										{label}
									</div>
								)}
							</Link>
						);
					})}
				</nav>

				{/* Bottom Actions (Logout) */}
				<div className="border-t border-divider p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
					<button type="button" onClick={logout} className="w-full">
						<div
							className={`flex items-center gap-3 rounded-xl p-3 text-error transition-colors hover:bg-errorLight justify-start ${
								collapsed ? "md:justify-center" : ""
							}`}>
							<LogOut className="h-5 w-5" />
							<span
								className={`whitespace-nowrap ${
									collapsed ? "md:opacity-0 md:pointer-events-none md:w-0 md:overflow-hidden" : "opacity-100"
								}`}
							>
								Logout
							</span>
						</div>
					</button>
				</div>
			</aside>

			{/* MAIN CONTENT AREA */}
			<div className="flex min-w-0 flex-1 flex-col">
				{/* HEADER */}
				<header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface/80 px-3 backdrop-blur-md sm:h-16 sm:px-4 md:px-6">
					<div className="flex min-w-0 items-center gap-2 sm:gap-4">
						{/* Mobile Menu Toggle */}
						<button
							onClick={openMobileSidebar}
							aria-label="Open sidebar"
							className="rounded-lg p-2 text-textSecondary transition-colors hover:bg-surfaceVariant md:hidden">
							<Menu className="h-5 w-5" />
						</button>

						{/* Desktop Sidebar Toggle */}
						<button
							onClick={toggleDesktopSidebar}
							aria-label="Toggle sidebar"
							className="hidden rounded-lg p-2 text-textSecondary transition-colors hover:bg-surfaceVariant md:block">
							<Menu className="h-5 w-5" />
						</button>

						<h1 className="hidden min-w-0 truncate text-lg font-semibold text-textPrimary sm:block">
							{activeItem?.label || "Dashboard"}
						</h1>
					</div>

					<div className="flex items-center gap-1 sm:gap-2">
						{/* Theme Toggle */}
						<button
							onClick={toggleTheme}
							aria-label="Toggle theme"
							className="rounded-full p-2.5 text-textSecondary transition-all hover:bg-surfaceVariant">
							{theme === "dark" ? (
								<Sun className="h-5 w-5" />
							) : (
								<Moon className="h-5 w-5" />
							)}
						</button>

						<div className="mx-1 h-6 w-px bg-divider sm:mx-2" />

						<Link href="/profile" className="flex items-center gap-2 pl-1 sm:pl-2 group">
							<div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary transition-all group-hover:ring-4 ring-primary/10">
								<User className="h-5 w-5" />
							</div>
							{user && (
								<span className="hidden max-w-[8rem] truncate text-sm font-medium text-textSecondary lg:inline">
									{user.name}
								</span>
							)}
						</Link>
					</div>
				</header>

				{/* MAIN BODY */}
				<main className="min-w-0 flex-1 overflow-y-auto bg-background px-3 py-4 sm:px-4 sm:py-6 md:px-6">
					<div className="mx-auto w-full max-w-7xl">{children}</div>
				</main>
			</div>
		</div>
	);
}