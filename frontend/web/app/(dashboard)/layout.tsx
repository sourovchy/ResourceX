"use client";

import React, { useMemo } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { type AccessibleRole } from "@/lib/auth";
import {
    LayoutDashboard,
    ShoppingBag,
    Inbox,
    AlertTriangle,
    Bell,
    User,
    Archive,
    Calendar,
    BarChart3,
    Users,
    Package,
    ShieldAlert,
    ShieldCheck,
    UserCog,
} from "lucide-react";

type NavItem = {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    roles?: AccessibleRole[]; // If undefined, accessible by all authenticated roles
};

// Navigation for all roles
const DASHBOARD_NAV: NavItem[] = [
    {
        href: "/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
    },
    {
        href: "/borrow",
        icon: ShoppingBag,
        label: "Borrow",
        roles: ["student"],
    },
    {
        href: "/my-posts",
        icon: Archive,
        label: "My Posts",
        roles: ["student"],
    },
    {
        href: "/bookings",
        icon: Calendar,
        label: "Bookings",
    },
    {
        href: "/items",
        icon: Package,
        label: "Items",
        roles: ["admin", "super_admin", "moderator"],
    },
    {
        href: "/categories",
        icon: Package,
        label: "Categories",
        roles: ["admin", "super_admin", "moderator"],
    },
    {
        href: "/inbox",
        icon: Inbox,
        label: "Inbox",
    },
    {
        href: "/disputes",
        icon: AlertTriangle,
        label: "Disputes",
    },
    {
        href: "/analytics",
        icon: BarChart3,
        label: "Analytics",
        roles: ["admin", "super_admin"],
    },
    {
        href: "/penalties",
        icon: ShieldAlert,
        label: "Penalties",
        roles: ["admin", "super_admin", "moderator"],
    },
    {
        href: "/trust-scores",
        icon: ShieldCheck,
        label: "Trust Scores",
        roles: ["admin", "super_admin", "moderator"],
    },
    {
        href: "/users",
        icon: Users,
        label: "Users",
        roles: ["admin", "super_admin"],
    },
    {
        href: "/staff-management",
        icon: UserCog,
        label: "Staff",
        roles: ["super_admin"],
    },
    {
        href: "/notifications",
        icon: Bell,
        label: "Notifications",
    },
    {
        href: "/profile",
        icon: User,
        label: "Profile",
    },
];

function getHighestAccessibleRole(roles: string[] = []): AccessibleRole | null {
    if (roles.includes("ROLE_SUPER_ADMIN")) return "super_admin";
    if (roles.includes("ROLE_ADMIN")) return "admin";
    if (roles.includes("ROLE_MODERATOR")) return "moderator";
    if (roles.includes("ROLE_USER")) return "student";
    return null;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, roles, loading } = useAuth();
    const currentRole = useMemo(
        () => getHighestAccessibleRole(roles),
        [roles],
    );

    const filteredNavItems = useMemo(() => {
        if (!currentRole) return [];

        return DASHBOARD_NAV.filter((item) => {
            if (!item.roles || item.roles.length === 0) {
                return true; // Available to everyone
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
