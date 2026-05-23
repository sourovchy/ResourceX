"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AuthGuard({
	children,
	role,
}: {
	children: React.ReactNode;
	role: "admin" | "student" | "moderator" | "super_admin";
}) {
	const router = useRouter();
	const { user, loading, canAccess } = useAuth();

	useEffect(() => {
		if (loading) return;

		if (!user) {
			router.replace("/auth/login");
			return;
		}

		if (!canAccess(role)) {
			router.replace(role === "student" ? "/home" : "/dashboard");
		}
	}, [canAccess, loading, role, router, user]);

	if (loading || !user) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center text-textSecondary">
				<Loader2 className="w-5 h-5 animate-spin mr-2" />
				Loading secure workspace...
			</div>
		);
	}

	return <>{children}</>;
}
