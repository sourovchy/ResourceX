"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";

import AppShell from "@/components/layout/AppShell";
import AuthGuard from "@/components/auth/AuthGuard";
import {
	LayoutDashboard,
	BarChart3,
	Users,
	Package,
	Calendar,
	AlertTriangle,
	ShieldAlert,
	ShieldCheck,
	Megaphone,
} from "lucide-react";

type AdminNavItem = {
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	label: string;
};

const ADMIN_NAV: AdminNavItem[] = [
	{ href: "/home", icon: LayoutDashboard, label: "Dashboard" },
	{ href: "/analytics", icon: BarChart3, label: "Analytics" },
	{ href: "/users", icon: Users, label: "User Management" },
	{ href: "/items", icon: Package, label: "Item Moderation" },
	{ href: "/bookings", icon: Calendar, label: "Booking Monitor" },
	{ href: "/disputesAdmin", icon: AlertTriangle, label: "Dispute Center" },
	{ href: "/penalties", icon: ShieldAlert, label: "Penalty Override" },
	{ href: "/trust-scores", icon: ShieldCheck, label: "Trust Scores" },
	{ href: "/categories", icon: Package, label: "Platform Settings" },
	{ href: "/announcements", icon: Megaphone, label: "Announcements" },
];

export default function AdminLayout({
										children,
									}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname() || "";

	const isAdminLoginPage = useMemo(() => {
		return pathname === "/AdminLogin" || pathname === "/adminlogin";
	}, [pathname]);

	if (isAdminLoginPage) {
		return <>{children}</>;
	}

	return (
		<AuthGuard role="admin">
			<AppShell navItems={ADMIN_NAV} role="admin">
				{children}
			</AppShell>
		</AuthGuard>
	);
}