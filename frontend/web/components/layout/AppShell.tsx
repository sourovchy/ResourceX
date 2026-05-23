"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

import { Sun, Moon, Menu, LogOut, User } from "lucide-react";

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

	const isActive = (href: string) =>
		pathname === href || pathname.startsWith(href + "/");

	const activeItem = useMemo(
		() => navItems.find((i) => isActive(i.href)),
		[pathname, navItems],
	);

	return (
		<div className="flex h-screen bg-background text-textPrimary">
			{/* SIDEBAR */}
			<aside
				className={`group/sidebar flex flex-col bg-surface border-r border-border transition-all duration-300 ease-in-out relative
                ${collapsed ? "w-[72px]" : "w-[260px]"}`}>
				{/* Logo Section */}
				<div className="h-16 flex items-center px-6 mb-4">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-onPrimary font-bold shrink-0">
								{isPrivilegedRole(role) ? "A" : "S"}
						</div>
						{!collapsed && (
							<span className="font-bold text-lg tracking-tight transition-opacity duration-300">
								ResourceX
							</span>
						)}
					</div>
				</div>

				{/* Navigation */}
				<nav className="flex-1 px-3 space-y-1">
					{navItems.map(({ href, icon: Icon, label }) => {
						const active = isActive(href);
						return (
							<Link
								key={href}
								href={href}
								className="relative flex items-center group/item">
								<div
									className={`flex items-center w-full gap-3 p-3 rounded-xl transition-all duration-200 ${
										active
											? "bg-primaryLight text-primary font-medium"
											: "text-textSecondary hover:bg-surfaceVariant hover:text-textPrimary"
									} ${collapsed ? "justify-center" : ""}`}>
									<Icon
										className={`w-5 h-5 shrink-0 ${active ? "text-primary" : ""}`}
									/>
									{!collapsed && (
										<span className="whitespace-nowrap">{label}</span>
									)}
								</div>

								{/* Professional Tooltip for Collapsed State */}
								{collapsed && (
									<div className="absolute left-16 scale-0 group-hover/item:scale-100 transition-all origin-left bg-textPrimary text-background text-xs px-3 py-2 rounded-md font-medium shadow-xl z-50 pointer-events-none whitespace-nowrap">
										{label}
									</div>
								)}
							</Link>
						);
					})}
				</nav>

				{/* Bottom Actions (Logout) */}
				<div className="p-3 border-t border-divider">
					<button type="button" onClick={logout} className="w-full">
						<div
							className={`flex items-center gap-3 p-3 rounded-xl text-error hover:bg-errorLight transition-colors ${collapsed ? "justify-center" : ""}`}>
							<LogOut className="w-5 h-5" />
							{!collapsed && <span className="font-medium">Logout</span>}
						</div>
					</button>
				</div>
			</aside>

			{/* MAIN CONTENT AREA */}
			<div className="flex flex-col flex-1 min-w-0 overflow-hidden">
				{/* HEADER */}
				<header className="flex justify-between items-center h-16 px-6 border-b border-border bg-surface/80 backdrop-blur-md z-10">
					<div className="flex items-center gap-4">
						<button
							onClick={() => setCollapsed(!collapsed)}
							className="p-2 rounded-lg hover:bg-surfaceVariant text-textSecondary transition-colors">
							<Menu className="w-5 h-5" />
						</button>

						<h1 className="font-semibold text-lg text-textPrimary hidden sm:block">
							{activeItem?.label || "Dashboard"}
						</h1>
					</div>

					<div className="flex items-center gap-2">
						{/* Theme Toggle */}
						<button
							onClick={toggleTheme}
							className="p-2.5 rounded-full hover:bg-surfaceVariant text-textSecondary transition-all">
							{theme === "dark" ? (
								<Sun className="w-5 h-5" />
							) : (
								<Moon className="w-5 h-5" />
							)}
						</button>

						<div className="h-6 w-[1px] bg-divider mx-2" />

						{/* Profile Link */}
						<Link
							href={isPrivilegedRole(role) ? "/adminProfile" : "/profile"}
							className="flex items-center gap-2 pl-2 group">
							<div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:ring-4 ring-primary/10 transition-all">
								<User className="w-5 h-5" />
							</div>
							{!collapsed && user && (
								<span className="text-sm font-medium text-textSecondary">
									{user.name}
								</span>
							)}
						</Link>
					</div>
				</header>

				{/* MAIN BODY */}
				<main className="flex-1 overflow-y-auto p-6 bg-background">
					<div className="max-w-7xl mx-auto">{children}</div>
				</main>
			</div>
		</div>
	);
}
