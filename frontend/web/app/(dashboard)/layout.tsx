"use client";

import React, { useMemo } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/ui/PageLoader";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { type AccessibleRole } from "@/lib/auth";
import { getNavForRole } from "@/config/nav";

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
    const router = useRouter();

    const currentRole = useMemo(() => getHighestAccessibleRole(roles), [roles]);

    useEffect(() => {
        if (!loading && (!currentRole || !user)) {
            router.replace("/auth/login");
        }
    }, [loading, currentRole, user, router]);

    const filteredNavItems = useMemo(() => getNavForRole(currentRole), [currentRole]);

    if (loading) {
        return <PageLoader message="Loading dashboard..." fullScreen />;
    }

    if (!currentRole || !user) {
        return null;
    }

    return (
        <AuthGuard role={currentRole}>
            <AppShell navItems={filteredNavItems} role={currentRole}>
                {children}
            </AppShell>
        </AuthGuard>
    );
}
