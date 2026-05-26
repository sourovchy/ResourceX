"use client";

import React from "react";
import { useRoleSwitch } from "@/hooks/useRoleSwitch";
import AdminHomePage from "./AdminDashboard";
import StudentDashboard from "./StudentDashboard";
import { PageLoader } from "@/components/ui/PageLoader";

export default function UnifiedDashboard() {
    const { isPrivileged, loading } = useRoleSwitch();

    if (loading) {
        return <PageLoader message="Loading dashboard..." />;
    }

    if (isPrivileged) {
        return <AdminHomePage />;
    }

    return <StudentDashboard />;
}
