"use client";

import React from "react";

import AuthGuard from "@/components/auth/AuthGuard";
import AppShell from "@/components/layout/AppShell";
import {
	LayoutDashboard,
	BarChart3,
	Users,
	Package,
	Calendar,
	AlertTriangle,
	ShieldAlert,
	ShieldCheck,
	UserCog
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
	{ href: "/staff-management", icon: UserCog, label: "Staff Management" },
];

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AuthGuard role="admin">
			<AppShell navItems={ADMIN_NAV} role="admin">
				{children}
			</AppShell>
		</AuthGuard>
	);
}
