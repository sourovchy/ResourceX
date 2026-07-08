"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Eye } from "lucide-react";
import { ListRowSkeleton } from "@/components/ui/Skeleton";
import Avatar from "@/components/ui/Avatar";
import { formatDate } from "./activityUtils";

export type PendingUser = {
	id: number | string;
	name: string;
	email: string;
	studentId: string;
	university?: string;
	department?: string;
	createdAt?: string;
};

/** Verification queue preview — the first 10 students awaiting review. */
export default function PendingUsersTab({
	pendingUsers,
	loading,
}: {
	pendingUsers: PendingUser[];
	loading: boolean;
}) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-bold text-textPrimary">Awaiting Verification Review</h3>
				<Link
					href="/users?filter=PENDING"
					className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
					View All Verification Queue
					<ArrowRight className="h-3.5 w-3.5" />
				</Link>
			</div>

			<div className="divide-y divide-borderLight border border-borderLight rounded-xl overflow-hidden bg-card">
				{loading ? (
					<ListRowSkeleton count={4} />
				) : pendingUsers.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
						<CheckCircle2 className="h-8 w-8 text-success" />
						<p className="text-sm font-semibold text-textSecondary">Queue is clean!</p>
						<p className="text-xs text-textTertiary">No pending student verification requests.</p>
					</div>
				) : (
					pendingUsers.slice(0, 5).map((user) => (
						<div
							key={user.id}
							className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-surface/50">
							<div className="flex items-center gap-3 min-w-0">
								<Avatar name={user.name} size={36} textClass="text-xs" />
								<div className="min-w-0">
									<div className="truncate text-xs font-bold text-textPrimary">
										{user.name}
									</div>
									<div className="truncate text-[10px] text-textTertiary mt-0.5">
										Student ID: <span className="font-semibold text-textSecondary">{user.studentId}</span>
										{user.university && ` · ${user.university}`}
										{user.department && ` (${user.department})`}
									</div>
									{user.createdAt && (
										<div className="text-[9px] text-textTertiary mt-0.5">
											Applied: {formatDate(user.createdAt)}
										</div>
									)}
								</div>
							</div>
							<Link
								href={`/users/${user.id}?type=pending`}
								className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:opacity-90 transition shadow-sm">
								<Eye className="h-3.5 w-3.5" />
								Review
							</Link>
						</div>
					))
				)}
			</div>
		</div>
	);
}
