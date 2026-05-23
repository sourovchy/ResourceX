"use client";

import React, { useMemo } from "react";

import AuthGuard from "@/components/auth/AuthGuard";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import {
	LayoutDashboard,
	BarChart3,
	Users,
	Package,
	Calendar,
	AlertTriangle,
	ShieldAlert,
	ShieldCheck,
	UserCog,
} from "lucide-react";

type AccessibleRole = "admin" | "student" | "moderator" | "super_admin";

type AdminNavItem = {
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	roles?: AccessibleRole[];
};

const ADMIN_NAV: AdminNavItem[] = [
	{
		href: "/home",
		icon: LayoutDashboard,
		label: "Dashboard",
		roles: ["admin", "super_admin", "moderator"],
	},
	{
		href: "/analytics",
		icon: BarChart3,
		label: "Analytics",
		roles: ["admin", "super_admin", "moderator"],
	},
	{
		href: "/users",
		icon: Users,
		label: "User Management",
		roles: ["admin", "super_admin", "moderator"],
	},
	{
		href: "/items",
		icon: Package,
		label: "Item Moderation",
		roles: ["admin", "super_admin", "moderator"],
	},
	{
		href: "/bookings",
		icon: Calendar,
		label: "Booking Monitor",
		roles: ["admin", "super_admin", "moderator"],
	},
	{
		href: "/disputesAdmin",
		icon: AlertTriangle,
		label: "Dispute Center",
		roles: ["admin", "super_admin", "moderator"],
	},
	{
		href: "/penalties",
		icon: ShieldAlert,
		label: "Penalty Override",
		roles: ["admin", "super_admin", "moderator"],
	},
	{
		href: "/trust-scores",
		icon: ShieldCheck,
		label: "Trust Scores",
		roles: ["admin", "super_admin", "moderator"],
	},
	{
		href: "/categories",
		icon: Package,
		label: "Platform Settings",
		roles: ["admin", "super_admin", "moderator"],
	},
	{
		href: "/staff-management",
		icon: UserCog,
		label: "Staff Management",
		roles: ["super_admin"],
	},
];

function getAccessibleRoleFromUserRoles(
	roles: string[] = [],
): AccessibleRole | null {
	if (roles.includes("ROLE_SUPER_ADMIN")) return "super_admin";
	if (roles.includes("ROLE_ADMIN")) return "admin";
	if (roles.includes("ROLE_MODERATOR")) return "moderator";
	if (roles.includes("ROLE_USER")) return "student";
	return null;
}

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user, roles, loading } = useAuth();
	const currentRole = useMemo(
		() => getAccessibleRoleFromUserRoles(roles),
		[roles],
	);

	const filteredNavItems = useMemo(() => {
		if (!currentRole) {
			return [];
		}

		return ADMIN_NAV.filter((item) => {
			if (!item.roles || item.roles.length === 0) {
				return true;
			}

			return item.roles.includes(currentRole);
		});
	}, [currentRole]);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-bgPrimary px-4 text-center text-sm text-textSecondary">
				Loading dashboard...
			</div>
		);
	}

	if (!currentRole || !user) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-bgPrimary px-4 text-center text-sm text-textSecondary">
				Unable to determine your role. Please sign in again.
			</div>
		);
	}

	return (
		<AuthGuard role={currentRole}>
			<AppShell navItems={filteredNavItems} role={currentRole}>
				{children}
			</AppShell>
		</AuthGuard>
	);
}
