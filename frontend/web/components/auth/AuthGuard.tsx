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
			router.replace("/dashboard");
		}
	}, [canAccess, loading, role, router, user]);

	if (loading || !user) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
				<div className="flex w-full max-w-xs flex-col items-center justify-center rounded-xl border border-borderLight bg-surface p-5 text-center shadow-sm sm:max-w-sm sm:p-6">
					<Loader2 className="mb-3 h-5 w-5 animate-spin text-textSecondary sm:h-6 sm:w-6" />
					<p className="text-sm font-medium text-textSecondary sm:text-base">
						Loading secure workspace...
					</p>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
