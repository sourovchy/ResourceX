"use client";

import React from "react";
import { useRoleSwitch } from "@/hooks/useRoleSwitch";
import AdminBookings from "./AdminBookings";
import StudentBookings from "./StudentBookings";
import { PageLoader } from "@/components/ui/PageLoader";

export default function UnifiedBookingsPage() {
    const { isPrivileged, loading } = useRoleSwitch();

    if (loading) {
        return <PageLoader message="Loading bookings..." />;
    }

    if (isPrivileged) {
        return <AdminBookings />;
    }

    return <StudentBookings />;
}
