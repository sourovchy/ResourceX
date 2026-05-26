"use client";

import React from "react";
import { useRoleSwitch } from "@/hooks/useRoleSwitch";
import AdminDisputes from "./AdminDisputes";
import StudentDisputes from "./StudentDisputes";
import { PageLoader } from "@/components/ui/PageLoader";

export default function UnifiedDisputesPage() {
    const { isPrivileged, loading } = useRoleSwitch();

    if (loading) {
        return <PageLoader message="Loading disputes..." />;
    }

    if (isPrivileged) {
        return <AdminDisputes />;
    }

    return <StudentDisputes />;
}
