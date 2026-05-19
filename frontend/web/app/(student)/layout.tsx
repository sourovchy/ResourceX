"use client";

import AppShell from "@/components/layout/AppShell";
import {
	LayoutDashboard,
	ShoppingBag,
	Inbox,
	AlertTriangle,
	Bell,
	User,
	Archive,
	Calendar,
} from "lucide-react";

const STUDENT_NAV = [
	{ href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
	{ href: "/borrow", icon: ShoppingBag, label: "Borrow" },
	{ href: "/my-bookings", icon: Calendar, label: "My Bookings" },
	{ href: "/my-posts", icon: Archive, label: "My Posts" },
	{ href: "/inbox", icon: Inbox, label: "Inbox" },
	{ href: "/disputes", icon: AlertTriangle, label: "Disputes" },
	{ href: "/notifications", icon: Bell, label: "Notifications" },
	{ href: "/profile", icon: User, label: "Profile" },
];

export default function StudentLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AppShell navItems={STUDENT_NAV} role="student">
			{children}
		</AppShell>
	);
}
