"use client";

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
	Megaphone,
} from "lucide-react";
import { usePathname } from "next/navigation";

const ADMIN_NAV = [
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
	const pathname = usePathname();

	if (pathname === "/AdminLogin") {
		return <>{children}</>;
	}

	return (
		<AppShell navItems={ADMIN_NAV} role="admin">
			{children}
		</AppShell>
	);
}
