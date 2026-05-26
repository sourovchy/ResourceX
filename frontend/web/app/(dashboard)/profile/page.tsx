"use client";

import React from "react";
import { useRoleSwitch } from "@/hooks/useRoleSwitch";
import AdminProfilePage from "./AdminProfile";
import StudentProfilePage from "./StudentProfile";
import { PageLoader } from "@/components/ui/PageLoader";

export default function UnifiedProfilePage() {
    const { isPrivileged, loading } = useRoleSwitch();

    if (loading) {
        return <PageLoader message="Loading profile..." />;
    }

    if (isPrivileged) {
        return <AdminProfilePage />;
    }

    return <StudentProfilePage />;
}
